'use client';

import { useMemo, useState } from 'react';
import {
  FileCode2, Link2, Braces, Copy, Check, ArrowLeftRight,
  Loader2, RotateCcw,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tool = 'base64' | 'url' | 'json';

const TOOLS = [
  { key: 'base64', label: 'Base64', icon: FileCode2 },
  { key: 'url', label: 'URL Encoder', icon: Link2 },
  { key: 'json', label: 'JSON Formatter', icon: Braces },
] as const;

export function TextTools() {
  const [tool, setTool] = useState<Tool>('base64');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [jsonError, setJsonError] = useState('');

  const output = useMemo(() => {
    setJsonError('');
    if (!input) return '';
    try {
      if (tool === 'base64') {
        // auto-detect: if looks like base64, decode; else encode
        const clean = input.trim();
        if (/^[A-Za-z0-9+/=\s]+$/.test(clean) && clean.length % 4 === 0) {
          try {
            return decodeURIComponent(escape(atob(clean)));
          } catch {
            return btoa(unescape(encodeURIComponent(input)));
          }
        }
        return btoa(unescape(encodeURIComponent(input)));
      }
      if (tool === 'url') {
        return encodeURIComponent(input);
      }
      if (tool === 'json') {
        const parsed = JSON.parse(input);
        return JSON.stringify(parsed, null, 2);
      }
      return '';
    } catch (e: any) {
      if (tool === 'json') setJsonError(e.message || 'JSON نامعتبر');
      return '';
    }
  }, [input, tool]);

  const copy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      toast.success('کپی شد');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('کپی نشد');
    }
  };

  const swap = () => {
    if (!output) return;
    setInput(output);
  };

  const clear = () => {
    setInput('');
    setJsonError('');
  };

  return (
    <div className="space-y-5">
      {/* Tool picker */}
      <div className="grid grid-cols-3 gap-2">
        {TOOLS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTool(t.key as Tool);
              setInput('');
            }}
            className={cn(
              'min-h-[52px] rounded-2xl border px-3 flex items-center gap-2 text-xs font-medium transition-all',
              tool === t.key
                ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/60">ورودی</label>
            <button
              onClick={clear}
              className="text-white/40 hover:text-white text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              پاک کردن
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            dir={tool === 'json' ? 'ltr' : 'auto'}
            placeholder={
              tool === 'base64'
                ? 'متن یا Base64 اینجا بنویس...'
                : tool === 'url'
                  ? 'https://example.com/?q=متن'
                  : '{"key": "value"}'
            }
            rows={tool === 'json' ? 8 : 5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono resize-none focus:outline-none focus:border-cyan-500/50"
          />
          {jsonError && (
            <div className="text-rose-400 text-xs">⚠️ {jsonError}</div>
          )}
        </CardContent>
      </Card>

      {/* Output */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-white/60">خروجی</label>
            <div className="flex items-center gap-1">
              <button
                onClick={swap}
                disabled={!output}
                className="text-white/40 hover:text-white text-xs p-1.5 disabled:opacity-30"
                title="استفاده به عنوان ورودی"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
              <button
                onClick={copy}
                disabled={!output}
                className="text-white/40 hover:text-white text-xs p-1.5 disabled:opacity-30"
                title="کپی"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <pre
            dir={tool === 'json' ? 'ltr' : 'auto'}
            className="w-full min-h-[120px] bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono whitespace-pre-wrap break-all"
          >
            {output || <span className="text-white/30">—</span>}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
