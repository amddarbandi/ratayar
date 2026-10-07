'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Upload, Trash2, Download, Loader2, X, Filter,
  FileImage, Eye, ChevronRight, ChevronLeft, ExternalLink,
  HardDrive, Calendar, Info, Shield, File as FileIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { documentsApi, streamDocument } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const typeConfig: any = {
  identity: { label: 'هویتی', color: 'text-purple-400', bg: 'bg-purple-500/10', emoji: '🪪' },
  property: { label: 'ملکی', color: 'text-emerald-400', bg: 'bg-emerald-500/10', emoji: '🏠' },
  vehicle: { label: 'خودرو', color: 'text-cyan-400', bg: 'bg-cyan-500/10', emoji: '🚗' },
  insurance: { label: 'بیمه', color: 'text-blue-400', bg: 'bg-blue-500/10', emoji: '📋' },
  medical: { label: 'پزشکی', color: 'text-red-400', bg: 'bg-red-500/10', emoji: '💊' },
  business: { label: 'کسب‌وکار', color: 'text-orange-400', bg: 'bg-orange-500/10', emoji: '🏪' },
  family: { label: 'خانوادگی', color: 'text-pink-400', bg: 'bg-pink-500/10', emoji: '👨‍👩‍👧' },
  other: { label: 'سایر', color: 'text-white/60', bg: 'bg-white/5', emoji: '📄' },
};

const formatSize = (bytes: number) => {
  if (!bytes) return '۰';
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('fa-IR');
};

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['documents', filter],
    queryFn: () => documentsApi.list(filter === 'all' ? undefined : filter),
  });

  const { data: termsStatus } = useQuery({
    queryKey: ['terms-check'],
    queryFn: () => termsApi.check(),
  });

  const needsTerms = termsStatus?.data?.needsUpdate === true;

  useEffect(() => {
    if (needsTerms && !termsChecked) {
      setTermsOpen(true);
    }
  }, [needsTerms, termsChecked]);

  const { data: statsData } = useQuery({
    queryKey: ['documents-stats'],
    queryFn: () => documentsApi.stats(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onSuccess: () => {
      toast.success('سند حذف شد');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents-stats'] });
    },
  });

  const documents = data?.data || [];
  const stats = statsData?.data || { total: 0, totalSize: 0 };

  const filters = [
    { key: 'all', label: 'همه' },
    { key: 'identity', label: '🪪 هویتی' },
    { key: 'property', label: '🏠 ملکی' },
    { key: 'vehicle', label: '🚗 خودرو' },
    { key: 'insurance', label: '📋 بیمه' },
    { key: 'medical', label: '💊 پزشکی' },
    { key: 'business', label: '🏪 کسب‌وکار' },
    { key: 'family', label: '👨‍👩‍👧 خانوادگی' },
    { key: 'other', label: '📄 سایر' },
  ];

  const getFileIcon = (mimeType: string) => {
    if (mimeType?.startsWith('image/')) return FileImage;
    return FileText;
  };

  const getPreviewType = (mimeType: string): 'image' | 'pdf' | 'text' | 'none' => {
    if (mimeType?.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType?.startsWith('text/')) return 'text';
    return 'none';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">اسناد</h1>
          <p className="text-white/50">آرشیو امن مدارک شما</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-medium transition-all shadow-lg shadow-purple-500/30 hover:scale-105"
        >
          <Upload className="w-5 h-5" />
          آپلود سند
        </button>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-white/50 text-sm">تعداد اسناد</div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{formatSize(stats.totalSize)}</div>
                <div className="text-white/50 text-sm">حجم کل</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-white/40 flex-shrink-0" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              filter === f.key
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
              <FileText className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">هنوز سندی نداری</h3>
            <p className="text-white/50 mb-6">
              مدارک مهم خود را امن و رمزنگاری‌شده ذخیره کن
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium hover:scale-105 transition-all"
            >
              <Upload className="w-5 h-5" />
              آپلود اولین سند
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {documents.map((doc: any, i: number) => {
              const config = typeConfig[doc.type] || typeConfig.other;
              const FileIcon = getFileIcon(doc.mimeType);
              const previewType = getPreviewType(doc.mimeType);
              const canPreview = previewType !== 'none';

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group hover:border-purple-500/30 transition-all cursor-pointer overflow-hidden">
                    <div
                      onClick={() => setPreviewDoc({ doc, canPreview, previewType })}
                      className="relative aspect-video bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center overflow-hidden"
                    >
                      <div className={cn('w-20 h-20 rounded-3xl flex items-center justify-center', config.bg)}>
                        <FileIcon className={cn('w-10 h-10', config.color)} />
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm">
                          {canPreview ? (
                            <>
                              <Eye className="w-4 h-4" />
                              پیش‌نمایش
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              دانلود
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-bold text-white text-sm mb-2 truncate">
                        {doc.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-white/40 mb-3">
                        <span className={cn('px-2 py-0.5 rounded-full', config.bg, config.color)}>
                          {config.emoji} {config.label}
                        </span>
                        <span>{formatSize(doc.size)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDoc({ doc, canPreview, previewType });
                          }}
                          className="flex-1 text-xs px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors flex items-center justify-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {canPreview ? 'مشاهده' : 'دانلود'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`«${doc.name}» حذف شود؟`)) {
                              deleteMutation.mutate(doc.id);
                            }
                          }}
                          className="px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            onClose={() => setShowUpload(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['documents'] });
              queryClient.invalidateQueries({ queryKey: ['documents-stats'] });
              setShowUpload(false);
            }}
          />
        )}
      </AnimatePresence>

      <TermsModal
        open={termsOpen}
        onClose={() => {
          setTermsOpen(false);
          setTermsChecked(true);
        }}
        onAccept={() => {
          setTermsChecked(true);
          queryClient.invalidateQueries({ queryKey: ['terms-check'] });
        }}
      />

      {/* Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <PreviewModal
            doc={previewDoc.doc}
            canPreview={previewDoc.canPreview}
            previewType={previewDoc.previewType}
            documents={documents}
            onClose={() => setPreviewDoc(null)}
            onNavigate={(doc: any) => {
              const previewType = getPreviewType(doc.mimeType);
              setPreviewDoc({ doc, canPreview: previewType !== 'none', previewType });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Preview Modal
// ============================================
function PreviewModal({
  doc,
  canPreview,
  previewType,
  documents,
  onClose,
  onNavigate,
}: any) {
  const [url, setUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [textContent, setTextContent] = useState<string>('');

  const currentIndex = documents.findIndex((d: any) => d.id === doc.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < documents.length - 1;

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    setLoading(true);
    setUrl('');
    setTextContent('');

    (async () => {
      try {
        // 🔥 فایل را مستقیم از API می‌گیریم (blob)
        const blob = await streamDocument(doc.id);
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);

        // اگر text است، محتوا را بخوان
        if (previewType === 'text') {
          const text = await blob.text();
          if (!cancelled) setTextContent(text);
        }
      } catch (err) {
        if (!cancelled) toast.error('خطا در بارگذاری فایل');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc.id, previewType]);

  const handleDownload = async () => {
    try {
      const blob = await streamDocument(doc.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error('خطا در دانلود');
    }
  };

  const config = typeConfig[doc.type] || typeConfig.other;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', config.bg)}>
            <FileText className={cn('w-5 h-5', config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm truncate">{doc.name}</h3>
            <p className="text-white/40 text-xs">
              {formatSize(doc.size)} • {formatDate(doc.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
            title="دانلود"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
            title="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            <p className="text-white/50 text-sm">در حال بارگذاری...</p>
          </div>
        ) : !canPreview ? (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
              <FileIcon className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              پیش‌نمایش ممکن نیست
            </h3>
            <p className="text-white/50 mb-6">
              این نوع فایل قابل نمایش آنلاین نیست
            </p>
            <Button onClick={handleDownload} variant="gradient">
              <Download className="w-4 h-4" />
              دانلود فایل
            </Button>
          </div>
        ) : previewType === 'image' ? (
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={url}
            alt={doc.name}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        ) : previewType === 'pdf' ? (
          <iframe
            src={url}
            className="w-full h-full rounded-lg border border-white/10"
            title={doc.name}
          />
        ) : previewType === 'text' ? (
          <div className="w-full h-full overflow-auto rounded-lg bg-white/5 border border-white/10 p-6">
            <pre className="text-white/80 text-sm whitespace-pre-wrap font-mono" dir="ltr">
              {textContent}
            </pre>
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-t border-white/10">
        <button
          onClick={() => hasPrev && onNavigate(documents[currentIndex - 1])}
          disabled={!hasPrev}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors',
            hasPrev
              ? 'bg-white/5 hover:bg-white/10 text-white/80'
              : 'text-white/20 cursor-not-allowed',
          )}
        >
          <ChevronRight className="w-4 h-4" />
          قبلی
        </button>

        <span className="text-white/40 text-sm">
          {currentIndex + 1} / {documents.length}
        </span>

        <button
          onClick={() => hasNext && onNavigate(documents[currentIndex + 1])}
          disabled={!hasNext}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors',
            hasNext
              ? 'bg-white/5 hover:bg-white/10 text-white/80'
              : 'text-white/20 cursor-not-allowed',
          )}
        >
          بعدی
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================
// Upload Modal
// ============================================
function UploadModal({ onClose, onSuccess }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('other');
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const docTypes = [
    { key: 'identity', label: 'هویتی', emoji: '🪪' },
    { key: 'property', label: 'ملکی', emoji: '🏠' },
    { key: 'vehicle', label: 'خودرو', emoji: '🚗' },
    { key: 'insurance', label: 'بیمه', emoji: '📋' },
    { key: 'medical', label: 'پزشکی', emoji: '💊' },
    { key: 'business', label: 'کسب‌وکار', emoji: '🏪' },
    { key: 'family', label: 'خانوادگی', emoji: '👨‍👩‍👧' },
    { key: 'other', label: 'سایر', emoji: '📄' },
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 50 * 1024 * 1024) {
        toast.error('حجم فایل نباید بیشتر از ۵۰ مگابایت باشد');
        return;
      }
      setFile(selected);
      if (!name) {
        setName(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('فایلی انتخاب کن');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 90));
      }, 200);

      await documentsApi.upload(file, type, name.trim() || undefined);

      clearInterval(interval);
      setProgress(100);
      toast.success('سند آپلود شد ✅');
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'خطا در آپلود');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md pointer-events-auto max-h-[90vh] overflow-y-auto"
        >
          <Card className="p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">آپلود سند</h2>
                <p className="text-white/50 text-xs mt-0.5">حداکثر ۵۰ مگابایت</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all mb-4',
                file
                  ? 'border-purple-500/50 bg-purple-500/5'
                  : 'border-white/10 hover:border-purple-500/40 hover:bg-white/5',
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf,.xls,.xlsx"
              />
              {file ? (
                <div>
                  <FileText className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                  <div className="text-sm font-medium text-white mb-1 truncate">
                    {file.name}
                  </div>
                  <div className="text-xs text-white/40">{formatSize(file.size)}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setName('');
                    }}
                    className="mt-2 text-xs text-red-400 hover:text-red-300"
                  >
                    تغییر فایل
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-10 h-10 text-white/30 mx-auto mb-2" />
                  <div className="text-sm text-white/60 mb-1">انتخاب فایل</div>
                  <div className="text-xs text-white/40">
                    JPG، PNG، PDF، Excel
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <Input
                label="نام سند"
                placeholder="مثلاً: سند خانه تهران"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-medium text-white/80 mb-2">
                دسته
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {docTypes.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setType(t.key)}
                    disabled={uploading}
                    className={cn(
                      'py-2 px-1 rounded-lg text-xs transition-all flex flex-col items-center gap-1',
                      type === t.key
                        ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                        : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10',
                    )}
                  >
                    <span className="text-base leading-none">{t.emoji}</span>
                    <span className="text-[10px] leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {uploading && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
                  <span>در حال آپلود...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={onClose} variant="default" className="flex-1" disabled={uploading}>
                انصراف
              </Button>
              <Button
                onClick={handleUpload}
                variant="gradient"
                className="flex-1"
                isLoading={uploading}
                disabled={!file}
              >
                <Upload className="w-4 h-4" />
                آپلود
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
