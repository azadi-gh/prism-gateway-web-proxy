/**
 * Utility functions for URL validation and normalization in Prism Gateway
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(url));
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      return new URL(trimmed).toString();
    } catch {
      return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
    }
  }
  const domainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i;
  if (domainPattern.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(trimmed)}`;
}
export function getProxyUrl(targetUrl: string): string {
  if (!targetUrl) return "";
  const normalized = targetUrl.trim();
  return `/api/proxy?url=${encodeURIComponent(normalized)}`;
}
export function extractTargetUrl(proxyUrl: string): string {
  try {
    const url = new URL(proxyUrl, window.location.origin);
    return url.searchParams.get('url') || proxyUrl;
  } catch {
    return proxyUrl;
  }
}
export function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return "";
  }
}
export function getDisplayDomain(url: string): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^www\./, '');
    // If it's a search result, show a better label
    if (hostname.includes('google.com') && parsed.pathname.includes('search')) {
      const query = parsed.searchParams.get('q');
      return query ? `Search: ${query}` : 'Google Search';
    }
    return hostname;
  } catch {
    return url;
  }
}
export function getPrettyUrl(url: string): string {
  try {
    const parsed = new URL(url);
    let pretty = parsed.hostname.replace(/^www\./, '') + parsed.pathname;
    if (pretty.endsWith('/')) pretty = pretty.slice(0, -1);
    return pretty;
  } catch {
    return url;
  }
}
export function cleanTitle(title: string, url: string): string {
  if (!title || title === "undefined" || title.length === 0) {
    return getDisplayDomain(url);
  }
  return title.trim();
}