'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { termsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';

export function TermsModal({
  open,
  onClose,
  onAccept,
  force = false,
}: {
  open: boolean;
  onClose?: () => void;
  onAccept?: () => void;
  force?: boolean;
}) {
  const queryClient = useQueryClient();
  const [accepted, setAccepted] = useState(false);

  const { data: termsData, isLoading } = useQuery({
    queryKey: ['terms'],
    queryFn: () => termsApi.get(),
    enabled: open,
  });

  const acceptMutation = useMutation({
    mutationFn: (version: string) => termsApi.accept(version),
    onSuccess: () => {
      toast.success('قرارداد پذیرفته شد ✅');
      queryClient.invalidateQueries({ queryKey: ['terms-check'] });
      onAccept?.();
      if (!force) onClose?.();
    },
    onError: () => toast.error('خطا در پذیرش قرارداد'),
  });

  const terms = termsData?.data;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={force ? undefined : onClose}
            className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] glass-strong rounded-3xl border border-purple-500/30 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <ScrollText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-lg">
                      قرارداد کاربری
                    </h2>
                    <p className="text-white/50 text-xs">
                      لطفاً مطالعه و امضا کنید
                    </p>
                  </div>
                </div>
                {!force && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-white/80 text-sm leading-loose whitespace-pre-wrap">
                      {terms?.text || ''}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/10 p-5 space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setAccepted(!accepted)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      accepted
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-white/30 group-hover:border-purple-400'
                    }`}
                  >
                    {accepted && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-white/80">
                    تمام شرایط قرارداد را مطالعه کردم و می‌پذیرم
                  </span>
                </label>

                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={!accepted || !terms}
                  isLoading={acceptMutation.isPending}
                  onClick={() => terms && acceptMutation.mutate(terms.version)}
                >
                  <Check className="w-5 h-5" />
                  امضای الکترونیکی و پذیرش
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
