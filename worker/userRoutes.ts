import { Hono } from "hono";
import { Env } from './core-utils';
import type { HistoryItem, Bookmark, ApiResponse } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/history', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const history = await stub.getHistory();
        return c.json({ success: true, data: history } satisfies ApiResponse<HistoryItem[]>);
    });
    app.post('/api/history', async (c) => {
        const item = await c.req.json() as HistoryItem;
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const updated = await stub.addHistoryItem(item);
        return c.json({ success: true, data: updated } satisfies ApiResponse<HistoryItem[]>);
    });
    app.delete('/api/history', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        await stub.clearHistory();
        return c.json({ success: true } satisfies ApiResponse);
    });
    app.get('/api/bookmarks', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const bookmarks = await stub.getBookmarks();
        return c.json({ success: true, data: bookmarks } satisfies ApiResponse<Bookmark[]>);
    });
    app.post('/api/bookmarks', async (c) => {
        const item = await c.req.json() as Bookmark;
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const updated = await stub.toggleBookmark(item);
        return c.json({ success: true, data: updated } satisfies ApiResponse<Bookmark[]>);
    });
    app.get('/api/proxy', async (c) => {
        const targetUrl = c.req.query('url');
        if (!targetUrl) return c.json({ success: false, error: 'URL parameter is required' }, 400);
        try {
            const url = new URL(targetUrl);
            const clientHeaders = new Headers(c.req.header());
            // Filter and prepare headers for target
            const headersToSend = new Headers();
            const allowedHeaders = [
                'user-agent', 'accept', 'accept-language', 'cookie', 'referer', 
                'range', 'content-type', 'origin'
            ];
            allowedHeaders.forEach(h => {
                const val = clientHeaders.get(h);
                if (val) headersToSend.set(h, val);
            });
            const response = await fetch(url.toString(), { 
                headers: headersToSend,
                redirect: 'follow'
            });
            const contentType = response.headers.get('content-type') || '';
            const isHtml = contentType.toLowerCase().includes('text/html');
            // If it's not HTML (e.g., video, audio, image, binary stream), 
            // stream it directly with necessary range headers
            if (!isHtml) {
                const proxyHeaders = new Headers(response.headers);
                proxyHeaders.delete('X-Frame-Options');
                proxyHeaders.delete('Content-Security-Policy');
                proxyHeaders.set('Access-Control-Allow-Origin', '*');
                return new Response(response.body, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: proxyHeaders
                });
            }
            const proxyBase = `${new URL(c.req.url).origin}/api/proxy?url=`;
            // Script for navigation sync and basic interceptors
            const injectionScript = `
                <script>
                    (function() {
                        const targetUrl = new URL(window.location.href).searchParams.get('url');
                        if (window.parent !== window) {
                            window.parent.postMessage({ type: 'PRISM_NAV', url: targetUrl, title: document.title }, '*');
                        }
                    })();
                </script>
            `;
            const rewriter = new HTMLRewriter()
                .on('head', {
                    element(el) { el.append(injectionScript, { html: true }); }
                })
                .on('a, area', {
                    element(el) {
                        const href = el.getAttribute('href');
                        if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
                            try {
                                const absolute = new URL(href, url.origin).toString();
                                el.setAttribute('href', proxyBase + encodeURIComponent(absolute));
                            } catch (e) { /* Invalid URL segments ignored */ }
                        }
                    }
                })
                .on('img, video, audio, source, track, iframe, embed', {
                    element(el) {
                        const src = el.getAttribute('src');
                        if (src) {
                            try {
                                const absolute = new URL(src, url.origin).toString();
                                el.setAttribute('src', proxyBase + encodeURIComponent(absolute));
                            } catch (e) { /* Handle relative path resolution failure */ }
                        }
                        const poster = el.getAttribute('poster');
                        if (poster) {
                            try {
                                const absolute = new URL(poster, url.origin).toString();
                                el.setAttribute('poster', proxyBase + encodeURIComponent(absolute));
                            } catch (e) { /* Ignore malformed poster URLs */ }
                        }
                    }
                })
                .on('link', {
                    element(el) {
                        const href = el.getAttribute('href');
                        if (href) {
                            try {
                                const absolute = new URL(href, url.origin).toString();
                                el.setAttribute('href', proxyBase + encodeURIComponent(absolute));
                            } catch (e) { /* Link resolution skip */ }
                        }
                    }
                })
                .on('script', {
                    element(el) {
                        const src = el.getAttribute('src');
                        if (src) {
                            try {
                                const absolute = new URL(src, url.origin).toString();
                                el.setAttribute('src', proxyBase + encodeURIComponent(absolute));
                            } catch (e) { /* Script src resolution skip */ }
                        }
                    }
                });
            const transformedResponse = rewriter.transform(response);
            const headers = new Headers(transformedResponse.headers);
            headers.delete('X-Frame-Options');
            headers.delete('Content-Security-Policy');
            headers.set('Access-Control-Allow-Origin', '*');
            const setCookie = response.headers.get('set-cookie');
            if (setCookie) {
                headers.set('Set-Cookie', setCookie);
            }
            return new Response(transformedResponse.body, {
                status: transformedResponse.status,
                headers
            });
        } catch (error) {
            console.error('Proxy Error:', error);
            return c.json({ success: false, error: 'Failed to fetch the requested URL' }, 500);
        }
    });
}