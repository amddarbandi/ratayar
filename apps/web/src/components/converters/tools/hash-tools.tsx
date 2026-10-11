'use client';

import { useMemo, useState } from 'react';
import {
  Hash, Copy, Check, Fingerprint, Sparkles, Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Algo = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';

const ALGOS: Algo[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];

// ── MD5 (pure JS, no dependency) ──
// Small implementation of the MD5 algorithm — public domain style.
function md5(input: string): string {
  function rotl(n: number, s: number) {
    return (n << s) | (n >>> (32 - s));
  }
  function add(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  const bytes = new TextEncoder().encode(input);
  const originalLen = bytes.length;
  const bitLen = originalLen * 8;

  // pad
  const padLen = ((56 - ((originalLen + 1) % 64)) + 64) % 64;
  const buf = new Uint8Array(originalLen + 1 + padLen + 8);
  buf.set(bytes, 0);
  buf[originalLen] = 0x80;
  // append length (little-endian 64-bit)
  const dv = new DataView(buf.buffer);
  dv.setUint32(buf.length - 8, bitLen >>> 0, true);
  dv.setUint32(buf.length - 4, Math.floor(bitLen / 0x100000000), true);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const M = new Uint32Array(16);
  for (let chunk = 0; chunk < buf.length; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      M[i] = dv.getUint32(chunk + i * 4, true);
    }
    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F = 0, g = 0;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = add(add(F, A), add(K[i], M[g]));
      A = D;
      D = C;
      C = B;
      B = add(B, rotl(F, S[i]));
    }
    a0 = add(a0, A);
    b0 = add(b0, B);
    c0 = add(c0, C);
    d0 = add(d0, D);
  }

  const out = new Uint8Array(16);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, a0, true);
  odv.setUint32(4, b0, true);
  odv.setUint32(8, c0, true);
  odv.setUint32(12, d0, true);
  return Array.from(out).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function uuidv4(): string {
  if (typeof crypto !== 'undefined' && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID();
  }
  // fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function shaHex(algo: 'SHA-1' | 'SHA-256' | 'SHA-512', input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest(algo, enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function HashTools() {
  const [mode, setMode] = useState<'hash' | 'uuid'>('hash');
  const [input, setInput] = useState('');
  const [algo, setAlgo] = useState<Algo>('SHA-256');
  const [hashed, setHashed] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [uuidList, setUuidList] = useState<string[]>([]);

  const compute = async () => {
    if (mode === 'uuid') {
      setUuidList(Array.from({ length: 5 }).map(() => uuidv4()));
      return;
    }
    if (!input) return;
    setRunning(true);
    try {
      const result: Record<string, string> = {};
      result['MD5'] = md5(input);
      result['SHA-1'] = await shaHex('SHA-1', input);
      result['SHA-256'] = await shaHex('SHA-256', input);
      result['SHA-512'] = await shaHex('SHA-512', input);
      setHashed(result);
    } catch (e) {
      toast.error('خطا در محاسبه');
    } finally {
      setRunning(false);
    }
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('کپی شد');
    } catch {
      toast.error('کپی نشد');
    }
  };

  return (
    <div className="space-y-5">
      {/* mode picker */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setMode('hash')}
          className={cn(
            'min-h-[52px] rounded-2xl border px-3 flex items-center gap-2 text-xs font-medium transition-all',
            mode === 'hash'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
          )}
        >
          <Hash className="w-4 h-4" />
          هش متن
        </button>
        <button
          onClick={() => setMode('uuid')}
          className={cn(
            'min-h-[52px] rounded-2xl border px-3 flex items-center gap-2 text-xs font-medium transition-all',
            mode === 'uuid'
              ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
          )}
        >
          <Fingerprint className="w-4 h-4" />
          UUID Generator
        </button>
      </div>

      {mode === 'hash' ? (
        <>
          <Card>
            <CardContent className="p-5 space-y-3">
              <label className="text-xs text-white/60">متن ورودی</label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                dir="auto"
                rows={4}
                placeholder="متن مورد نظر را وارد کنید..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-mono resize-none focus:outline-none focus:border-cyan-500/50"
              />
              <button
                onClick={compute}
                disabled={running || !input}
                className="min-h-[44px] w-full md:w-auto px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                محاسبه هش
              </button>
            </CardContent>
          </Card>

          {Object.keys(hashed).length > 0 && (
            <div className="space-y-3">
              {ALGOS.map((a) => (
                <Card key={a}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-bold text-sm">{a}</span>
                      <button
                        onClick={() => copyText(hashed[a])}
                        className="text-white/40 hover:text-white p-1.5"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="font-mono text-[11px] text-white/70 bg-white/5 border border-white/10 rounded-lg p-3 break-all" dir="ltr">
                      {hashed[a]}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <Card>
            <CardContent className="p-5 space-y-3">
              <button
                onClick={compute}
                className="min-h-[44px] w-full px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                ساخت ۵ UUID جدید
              </button>
            </CardContent>
          </Card>

          {uuidList.length > 0 && (
            <Card>
              <CardContent className="p-5 space-y-2">
                {uuidList.map((u, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-3">
                    <span className="font-mono text-xs text-white flex-1 break-all" dir="ltr">
                      {u}
                    </span>
                    <button
                      onClick={() => copyText(u)}
                      className="text-white/40 hover:text-white p-1.5 flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
