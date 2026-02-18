import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Landing } from '@/components/Landing';
import { BrowserShell } from '@/components/BrowserShell';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
type ViewMode = 'landing' | 'browser';
export function HomePage() {
  const [mode, setMode] = useState<ViewMode>('landing');
  const [activeUrl, setActiveUrl] = useState('');
  const handleNavigate = (url: string) => {
    setActiveUrl(url);
    setMode('browser');
  };
  const handleGoHome = () => {
    setMode('landing');
    setActiveUrl('');
  };
  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      {/* Animated Mesh Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1.2, 1, 1.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[140px]"
        />
      </div>
      <AnimatePresence mode="wait">
        {mode === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10"
          >
            <ThemeToggle className="fixed top-6 right-6" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-8 md:py-10 lg:py-12">
                <Landing onNavigate={handleNavigate} />
              </div>
            </div>
            <footer className="w-full text-center py-12 text-[10px] text-muted-foreground/30 font-bold tracking-[0.4em] uppercase">
              PRISM GATEWAY &bull; SECURE NODES ACTIVE &bull; EST. 2024
            </footer>
          </motion.div>
        ) : (
          <motion.div
            key="browser"
            initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="h-screen w-full relative z-20"
          >
            <BrowserShell initialUrl={activeUrl} onHome={handleGoHome} />
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}