import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Shield, Zap, History, Clock, Star, Trash2, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getDisplayDomain } from '@/lib/url-utils';
import { toast } from 'sonner';
import type { HistoryItem, Bookmark, ApiResponse } from '@shared/types';
interface LandingProps {
  onNavigate: (url: string) => void;
}
export function Landing({ onNavigate }: LandingProps) {
  const [url, setUrl] = useState('');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [activeTab, setActiveTab] = useState('bookmarks');
  const fetchData = async () => {
    try {
      const [hRes, bRes] = await Promise.all([fetch('/api/history'), fetch('/api/bookmarks')]);
      const hJson = await hRes.json() as ApiResponse<HistoryItem[]>;
      const bJson = await bRes.json() as ApiResponse<Bookmark[]>;
      if (hJson.success) setHistoryItems(hJson.data || []);
      if (bJson.success) setBookmarks(bJson.data || []);
      if (bJson.data?.length === 0 && hJson.data?.length !== 0) setActiveTab('history');
    } catch (e) {
      console.warn('Failed to fetch user data');
    }
  };
  useEffect(() => { fetchData(); }, []);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onNavigate(url);
  };
  const clearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistoryItems([]);
      toast.success("History cleared");
    } catch (e) { toast.error("Failed to clear history"); }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] w-full">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center space-y-16 w-full max-w-4xl">
        {/* Hero Section */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-primary">v2.0 Premium</span>
          </motion.div>
          <h1 className="text-7xl md:text-9xl font-display font-black tracking-tight leading-none">
            <span className="text-gradient">Prism</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground/80 max-w-xl mx-auto font-medium text-balance">
            A secure, minimalist gateway designed for the modern explorer. Experience the web without borders.
          </p>
        </div>
        {/* Liquid Search Bar */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto w-full group">
          <div className="relative flex items-center p-2 premium-glass rounded-3xl liquid-input shadow-2xl">
            <Search className="ml-4 w-6 h-6 text-muted-foreground group-focus-within:text-indigo-500 transition-colors" />
            <Input
              type="text"
              placeholder="Where to next?"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-grow h-16 border-none bg-transparent text-xl font-medium focus-visible:ring-0 placeholder:text-muted-foreground/40"
            />
            <div className="hidden md:flex items-center gap-2 mr-4 px-2 py-1 bg-muted rounded-lg text-[10px] font-bold text-muted-foreground border border-border/50">
              <CornerDownLeft className="w-3 h-3" /> ENTER
            </div>
            <Button type="submit" className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all hover:shadow-indigo-500/20 hover:shadow-2xl active:scale-95">
              Launch
            </Button>
          </div>
        </form>
        {/* Bookmarks & History */}
        <div className="w-full max-w-3xl mx-auto space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-center mb-8">
              <TabsList className="bg-secondary/40 p-1.5 rounded-2xl border border-border/30 backdrop-blur-sm">
                <TabsTrigger value="bookmarks" className="px-6 py-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-sm font-bold transition-all">
                  <Star className="w-4 h-4 mr-2" /> Bookmarks
                </TabsTrigger>
                <TabsTrigger value="history" className="px-6 py-2 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-lg text-sm font-bold transition-all">
                  <Clock className="w-4 h-4 mr-2" /> History
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="bookmarks" className="mt-0 outline-none">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {bookmarks.length > 0 ? bookmarks.map((b) => (
                    <motion.button 
                      key={b.id} 
                      layout 
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.9 }} 
                      onClick={() => onNavigate(b.url)}
                      className="group flex flex-col items-center p-6 rounded-3xl premium-glass hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-all text-center border-dashed border-2 border-border/20 hover:border-indigo-500/40 hover:-translate-y-1"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                        <img src={b.faviconUrl} className="w-7 h-7" alt="" onError={(e) => (e.currentTarget.src = 'https://www.google.com/favicon.ico')} />
                      </div>
                      <span className="text-xs font-bold truncate w-full px-2">{getDisplayDomain(b.url)}</span>
                    </motion.button>
                  )) : (
                    <div className="col-span-full py-16 flex flex-col items-center text-muted-foreground/30">
                      <Star className="w-16 h-16 mb-4 opacity-10" />
                      <p className="text-sm font-medium italic">Your bookmarks will appear here</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </TabsContent>
            <TabsContent value="history" className="mt-0 space-y-3 outline-none">
              {historyItems.length > 0 ? (
                <>
                  <div className="flex justify-end px-2 pb-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Clear History
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear History?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently delete your browsing history from this device.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={clearHistory} className="bg-destructive text-destructive-foreground">Delete All</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  {historyItems.map((h) => (
                    <motion.button 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={h.id} 
                      onClick={() => onNavigate(h.url)} 
                      className="w-full flex items-center justify-between p-4 rounded-2xl premium-glass hover:bg-secondary/40 transition-all group"
                    >
                      <div className="flex items-center gap-5 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 border shadow-inner">
                          <img src={h.faviconUrl} className="w-5 h-5" alt="" />
                        </div>
                        <div className="text-left overflow-hidden">
                          <p className="text-sm font-bold truncate text-foreground group-hover:text-indigo-500 transition-colors">{h.title}</p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{getDisplayDomain(h.url)}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/60 px-4 tabular-nums shrink-0">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </motion.button>
                  ))}
                </>
              ) : (
                <div className="py-16 flex flex-col items-center text-muted-foreground/30">
                  <History className="w-16 h-16 mb-4 opacity-10" />
                  <p className="text-sm font-medium italic">No recent history</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        {/* Feature Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {[
            { icon: Shield, title: "Pure Privacy", desc: "We strip all trackers and cookies by default." },
            { icon: Globe, title: "Always Connected", desc: "A resilient global network of proxy nodes." },
            { icon: Zap, title: "Turbo Speed", desc: "Lightweight rewriting engine for instant loads." }
          ].map((f, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="p-8 rounded-[2.5rem] premium-glass hover:scale-[1.02] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-500">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground/70 leading-relaxed font-medium">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}