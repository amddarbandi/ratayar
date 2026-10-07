'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    if (ios) {
      // Show custom iOS instructions after 5 seconds
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="glass-strong rounded-2xl p-4 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-white text-sm mb-1">
                  راتایار را نصب کن
                </h3>

                {isIOS ? (
                  <div className="text-white/70 text-xs mb-3 leading-relaxed">
                    برای نصب، روی دکمه
                    <Share className="w-3 h-3 inline mx-1" />
                    در پایین صفحه بزن، سپس
                    <span className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded bg-white/10">
                      <Plus className="w-3 h-3" /> Add to Home Screen
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="text-white/60 text-xs mb-3">
                      مثل یک اپ واقعی روی گوشی‌ات نصب کن. سریع‌تر و بدون
                      نوار آدرس.
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleInstall}
                        className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white text-xs font-medium transition-all"
                      >
                        نصب کن
                      </button>
                      <button
                        onClick={handleDismiss}
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 text-xs transition-colors"
                      >
                        بعداً
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleDismiss}
                className="p-1 text-white/40 hover:text-white transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
