'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Loader2, Calendar, Package, FileText, Wallet,
  Users, ArrowLeft, Command, CornerDownLeft,
} from 'lucide-react';
import { searchApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const iconMap: any = {
  Calendar, Package, FileText, Wallet, Users,
};

const colorMap: any = {
  purple: 'from-purple-500 to-pink-500',
  cyan: 'from-cyan-500 to-blue-500',
  emerald: 'from-emerald-500 to-teal-500',
  orange: 'from-orange-500 to-red-500',
  pink: 'from-pink-500 to-rose-500',
};

const typeLabels: any = {
  obligation: 'تعهد',
  asset: 'دارایی',
  document: 'سند',
  transaction: 'تراکنش',
  family: 'عضو خانواده',
};

export function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchApi.query(query),
    enabled: query.length >= 2,
    staleTime: 30000,
  });

  const results = data?.data?.results || [];

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex, onClose]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  const handleSelect = (result: any) => {
    router.push(result.url);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-2xl"
            >
              <div className="glass-strong rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden">
                {/* Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
                  <Search className="w-5 h-5 text-white/40 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="جستجو در تعهدات، دارایی‌ها، اسناد..."
                    className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder:text-white/40"
                  />
                  {isLoading && (
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  )}
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {query.length < 2 ? (
                    <div className="p-8 text-center">
                      <Search className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-white/40 text-sm">
                        حداقل ۲ حرف تایپ کن
                      </p>
                    </div>
                  ) : isLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-8 h-8 text-purple-400 mx-auto animate-spin" />
                    </div>
                  ) : results.length === 0 ? (
                    <div className="p-8 text-center">
                      <Search className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-white/40 text-sm">
                        نتیجه‌ای برای «{query}» یافت نشد
                      </p>
                    </div>
                  ) : (
                    <div className="p-2">
                      {results.map((result: any, i: number) => {
                        const Icon = iconMap[result.icon] || Search;
                        const gradient = colorMap[result.color] || 'from-purple-500 to-pink-500';
                        const isSelected = i === selectedIndex;

                        return (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(i)}
                            className={cn(
                              'w-full flex items-center gap-3 p-3 rounded-2xl transition-colors text-right',
                              isSelected ? 'bg-purple-500/20' : 'hover:bg-white/5',
                            )}
                          >
                            <div
                              className={cn(
                                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
                                gradient,
                              )}
                            >
                              <Icon className="w-5 h-5 text-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-white text-sm truncate">
                                {result.title}
                              </div>
                              <div className="text-white/50 text-xs truncate">
                                {result.subtitle}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] text-white/40 px-2 py-0.5 rounded-full bg-white/5">
                                {typeLabels[result.type] || result.type}
                              </span>
                              {isSelected && (
                                <CornerDownLeft className="w-3.5 h-3.5 text-purple-400" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 text-xs text-white/40">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-[10px]">↑</kbd>
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-[10px]">↓</kbd>
                      <span>حرکت</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-[10px]">Enter</kbd>
                      <span>انتخاب</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 text-[10px]">Esc</kbd>
                      <span>بستن</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Command className="w-3 h-3" />
                    <span>جستجوی سراسری</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
