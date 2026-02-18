import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, RotateCw, ShieldCheck, Home,
  ExternalLink, Star, Copy, MoreVertical, Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getProxyUrl, normalizeUrl, getFaviconUrl, cleanTitle, getPrettyUrl } from '@/lib/url-utils';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import type { Bookmark, ApiResponse } from '@shared/types';
interface BrowserShellProps {
  initialUrl: string;
  onHome: () => void;
}
export function BrowserShell({ initialUrl, onHome }: BrowserShellProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [displayUrl, setDisplayUrl] = useState(initialUrl);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [navHistory, setNavHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!currentUrl) return;
    const recordVisit = async () => {
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: uuidv4(),
            url: currentUrl,
            title: new URL(currentUrl).hostname,
            timestamp: Date.now(),
            faviconUrl: getFaviconUrl(currentUrl)
          }),
        });
        const bRes = await fetch('/api/bookmarks');
        const bJson = await bRes.json() as ApiResponse<Bookmark[]>;
        if (bJson.success && bJson.data) {
          setIsBookmarked(bJson.data.some(b => b.url === currentUrl));
        }
      } catch (e) { /* Metadata errors ignored */ }
    };
    recordVisit();
  }, [currentUrl]);
  useEffect(() => {
    if (initialUrl) {
      const normalized = normalizeUrl(initialUrl);
      setCurrentUrl(normalized);
      setDisplayUrl(normalized);
      setNavHistory([normalized]);
      setHistoryIndex(0);
    }
  }, [initialUrl]);
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'PRISM_NAV') {
        const newUrl = event.data.url;
        if (newUrl && newUrl !== currentUrl) {
          setCurrentUrl(newUrl);
          setDisplayUrl(newUrl);
          const newHistory = navHistory.slice(0, historyIndex + 1);
          newHistory.push(newUrl);
          setNavHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentUrl, navHistory, historyIndex]);
  const toggleBookmark = async () => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uuidv4(),
          url: currentUrl,
          title: cleanTitle("", currentUrl),
          faviconUrl: getFaviconUrl(currentUrl),
          createdAt: Date.now()
        }),
      });
      const json = await res.json() as ApiResponse<Bookmark[]>;
      if (json.success) {
        setIsBookmarked(!isBookmarked);
        toast.success(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks");
      }
    } catch (e) {
      toast.error("Failed to update bookmarks");
    }
  };
  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeUrl(displayUrl);
    setIsLoading(true);
    if (normalized === currentUrl) {
      reload();
    } else {
      setCurrentUrl(normalized);
      const newHistory = navHistory.slice(0, historyIndex + 1);
      newHistory.push(normalized);
      setNavHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };
  const goBack = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevUrl = navHistory[prevIndex];
      setHistoryIndex(prevIndex);
      setCurrentUrl(prevUrl);
      setDisplayUrl(prevUrl);
      setIsLoading(true);
    }
  };
  const goForward = () => {
    if (historyIndex < navHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextUrl = navHistory[nextIndex];
      setHistoryIndex(nextIndex);
      setCurrentUrl(nextUrl);
      setDisplayUrl(nextUrl);
      setIsLoading(true);
    }
  };
  const reload = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if(iframeRef.current) iframeRef.current.src = currentSrc;
      }, 50);
    }
  };
  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <TooltipProvider>
        <header className="relative h-20 flex items-center px-6 gap-6 border-b bg-background/60 backdrop-blur-3xl z-30">
          <div className="flex items-center gap-1.5 p-1 premium-glass rounded-2xl">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onHome} className="h-9 w-9 rounded-xl hover:bg-accent">
                  <Home className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Home</TooltipContent>
            </Tooltip>
            <div className="w-[1px] h-4 bg-border/50 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              disabled={historyIndex <= 0}
              className="w-9 h-9 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goForward}
              disabled={historyIndex >= navHistory.length - 1}
              className="w-9 h-9 rounded-xl"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <form onSubmit={handleNavigate} className="flex-grow max-w-5xl">
            <div className="relative flex items-center group">
              <div className="absolute left-4 flex items-center gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="hover:scale-110 transition-transform">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 text-sm p-5 premium-glass rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-2 font-bold text-emerald-600 mb-2">
                      <ShieldCheck className="w-5 h-5" /> Connection is Secure
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                      Prism Gateway acts as a protective shield between you and the internet. All traffic is proxied through our secure infrastructure.
                    </p>
                  </PopoverContent>
                </Popover>
                {!isFocused && <img src={getFaviconUrl(currentUrl)} className="w-4 h-4 rounded-sm" alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />}
                {isFocused && <Search className="w-3.5 h-3.5 text-muted-foreground" />}
              </div>
              <Input
                value={isFocused ? displayUrl : getPrettyUrl(displayUrl)}
                onChange={(e) => setDisplayUrl(e.target.value)}
                onFocus={() => {
                  setIsFocused(true);
                  // Optional: select all text on focus for easier editing
                  // (e.target as HTMLInputElement).select();
                }}
                onBlur={() => {
                  // Reduced timeout to 150ms for snappier feedback while preventing icon flicker
                  setTimeout(() => setIsFocused(false), 150);
                }}
                className="w-full h-12 pl-14 pr-28 bg-secondary/40 border-none focus-visible:ring-4 focus-visible:ring-indigo-500/10 rounded-2xl text-[13px] font-bold tracking-tight transition-all"
                spellCheck={false}
                autoComplete="off"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={reload}
                  className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
                <div className="w-[1px] h-4 bg-border/50 mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleBookmark}
                  className={`h-8 w-8 rounded-xl transition-all ${isBookmarked ? 'text-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10' : 'text-muted-foreground'}`}
                >
                  <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 premium-glass rounded-2xl p-2 border-none shadow-2xl">
                    <DropdownMenuItem className="rounded-xl p-2.5 font-bold text-xs" onClick={() => { navigator.clipboard.writeText(currentUrl); toast.success("Link copied to clipboard"); }}>
                      <Copy className="w-4 h-4 mr-3" /> Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-xl p-2.5 font-bold text-xs" onClick={() => window.open(currentUrl, '_blank')}>
                      <ExternalLink className="w-4 h-4 mr-3" /> Open Directly
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1 bg-border/40" />
                    <DropdownMenuItem className="rounded-xl p-2.5 font-bold text-xs text-indigo-500" onClick={onHome}>
                      <Home className="w-4 h-4 mr-3" /> Exit Browser
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </form>
          <div className="hidden lg:flex w-32 justify-end">
            <div className="h-10 px-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Active</span>
            </div>
          </div>
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ scaleX: 0, opacity: 1 }}
                animate={{ scaleX: [0, 0.4, 0.7, 0.9], opacity: 1 }}
                exit={{ scaleX: 1, opacity: 0 }}
                transition={{ duration: 2, times: [0, 0.2, 0.5, 1], ease: "circOut" }}
                className="absolute bottom-0 left-0 h-[4px] w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 origin-left z-50 shadow-[0_2px_10px_rgba(99,102,241,0.4)]"
              />
            )}
          </AnimatePresence>
        </header>
      </TooltipProvider>
      <main className="flex-grow relative bg-white">
        <iframe
          ref={iframeRef}
          key={currentUrl}
          src={getProxyUrl(currentUrl)}
          onLoad={() => setIsLoading(false)}
          className="w-full h-full border-none bg-white"
          title="Prism Proxy Viewport"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
        />
      </main>
    </div>
  );
}