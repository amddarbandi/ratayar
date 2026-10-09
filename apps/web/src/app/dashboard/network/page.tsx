'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, Copy, Check, ChevronDown, Binary, Hash, Info,
} from 'lucide-react';
import {
  calcIPv4, calcIPv6, validateIPv4, validateIPv6, formatBigNumber,
  type IPv4Result, type IPv6Result,
} from '@/lib/subnet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Mode = 'ipv4' | 'ipv6';

export default function NetworkPage() {
  const [mode, setMode] = useState<Mode>('ipv4');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Network className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Subnet Calculator</h1>
        </div>
        <p className="text-white/50">
          ماشین حساب کامل شبکه — IPv4 و IPv6 با تمام جزئیات
        </p>
      </div>

      {/* Mode tabs */}
      <div className="inline-flex p-1 rounded-2xl bg-white/5 border border-white/10">
        {(['ipv4', 'ipv6'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'px-6 py-2.5 rounded-xl text-sm font-bold transition-all',
              mode === m
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-white/60 hover:text-white',
            )}
          >
            {m === 'ipv4' ? 'IPv4' : 'IPv6'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'ipv4' ? (
          <motion.div
            key="ipv4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <IPv4Tab />
          </motion.div>
        ) : (
          <motion.div
            key="ipv6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <IPv6Tab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════
// IPv4 Tab
// ═══════════════════════════════════════════

function IPv4Tab() {
  const [ip, setIp] = useState('192.168.1.100');
  const [cidrInput, setCidrInput] = useState('24');

  const validation = useMemo(() => validateIPv4(ip), [ip]);
  const result = useMemo<IPv4Result | null>(() => {
    if (!validation.ok) return null;
    try {
      return calcIPv4(ip, cidrInput);
    } catch {
      return null;
    }
  }, [ip, cidrInput, validation.ok]);

  const presets = [8, 16, 24, 25, 30, 32];

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="آدرس IPv4"
                placeholder="192.168.1.100"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                dir="ltr"
              />
            </div>
            <div>
              <Input
                label="CIDR / Mask"
                placeholder="24"
                value={cidrInput}
                onChange={(e) => setCidrInput(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          {/* CIDR presets */}
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setCidrInput(String(p))}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-mono transition-all border',
                  cidrInput === String(p)
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
                )}
              >
                /{p}
              </button>
            ))}
          </div>

          {!validation.ok && ip.length > 0 && (
            <div className="text-red-400 text-sm">
              ⚠️ {validation.error}
            </div>
          )}
        </CardContent>
      </Card>

      {result && <IPv4Results result={result} />}
    </div>
  );
}

function IPv4Results({ result }: { result: IPv4Result }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Big three */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BigResult label="آدرس شبکه" value={result.network} sub={result.cidrNotation} accent="cyan" />
        <BigResult label="آدرس Broadcast" value={result.broadcast} accent="orange" />
        <BigResult
          label="محدوده میزبان‌های قابل استفاده"
          value={`${result.firstUsable} — ${result.lastUsable}`}
          sub={`${formatBigNumber(result.usableHosts)} میزبان`}
          accent="emerald"
          small
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="ماسک و وایلدکارد" icon={Hash}>
          <Row label="Subnet Mask" value={result.mask} mono />
          <Row label="Wildcard Mask" value={result.wildcard} mono />
          <Row label="CIDR" value={`/${result.cidr}`} mono />
        </InfoCard>

        <InfoCard title="طبقه‌بندی" icon={Info}>
          <Row label="کلاس" value={result.ipClass} />
          <Row label="نوع" value={result.ipType} />
        </InfoCard>

        <InfoCard title="آدرس‌ها" icon={Hash}>
          <Row label="تعداد کل آدرس‌ها" value={formatBigNumber(result.totalAddresses)} />
          <Row label="تعداد میزبان‌های قابل استفاده" value={formatBigNumber(result.usableHosts)} />
          <Row label="First Usable" value={result.firstUsable} mono />
          <Row label="Last Usable" value={result.lastUsable} mono />
        </InfoCard>

        <InfoCard title="نمایش‌های دیگر" icon={Binary}>
          <Row label="Hexadecimal" value={result.ipHex} mono />
          <Row label="Integer" value={String(result.ipInteger)} mono />
          <Row label="Reverse DNS" value={result.reverseDns} mono small />
        </InfoCard>
      </div>

      {/* Binary section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Binary className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white">نمایش باینری</h3>
          </div>
          <div className="space-y-3">
            <BinaryRow label="IP" value={result.ipBinary} />
            <BinaryRow label="Mask" value={result.maskBinary} />
            <BinaryRow label="Network" value={result.networkBinary} highlight />
            <BinaryRow label="Broadcast" value={result.broadcastBinary} highlight />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// IPv6 Tab
// ═══════════════════════════════════════════

function IPv6Tab() {
  const [ip, setIp] = useState('2001:db8:85a3::8a2e:370:7334');
  const [prefix, setPrefix] = useState('64');

  const validation = useMemo(() => validateIPv6(ip), [ip]);
  const result = useMemo<IPv6Result | null>(() => {
    if (!validation.ok) return null;
    try {
      const p = Math.max(0, Math.min(128, parseInt(prefix, 10) || 64));
      return calcIPv6(`${ip}/${p}`);
    } catch {
      return null;
    }
  }, [ip, prefix, validation.ok]);

  const presets = [32, 48, 56, 64, 96, 128];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                label="آدرس IPv6"
                placeholder="2001:db8::1"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                dir="ltr"
              />
            </div>
            <div>
              <Input
                label="Prefix Length"
                placeholder="64"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setPrefix(String(p))}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-mono transition-all border',
                  prefix === String(p)
                    ? 'bg-purple-500/20 border-purple-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
                )}
              >
                /{p}
              </button>
            ))}
          </div>

          {!validation.ok && ip.length > 0 && (
            <div className="text-red-400 text-sm">⚠️ {validation.error}</div>
          )}
        </CardContent>
      </Card>

      {result && <IPv6Results result={result} />}
    </div>
  );
}

function IPv6Results({ result }: { result: IPv6Result }) {
  const total = result.totalAddresses;
  const totalFormatted =
    total.length > 20 ? `2^${128 - result.prefix}` : formatBigNumber(total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Big two */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BigResult label="فرم کامل (Expanded)" value={result.expanded} accent="purple" small />
        <BigResult label="فرم فشرده (Compressed)" value={result.compressed} accent="cyan" />
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard title="شبکه" icon={Network}>
          <Row label="Prefix" value={`/${result.prefix}`} mono />
          <Row label="Network" value={result.network} mono small />
          <Row label="First Address" value={result.firstAddress} mono small />
          <Row label="Last Address" value={result.lastAddress} mono small />
        </InfoCard>

        <InfoCard title="نوع و Scope" icon={Info}>
          <Row label="Address Type" value={result.addressType} />
          <Row label="Scope" value={result.scope} />
          <Row label="Global" value={result.isGlobal ? 'بله' : 'خیر'} />
        </InfoCard>

        <InfoCard title="ساختار" icon={Hash}>
          <Row label="Prefix Part (64 bit اول)" value={result.prefixPart} mono small />
          <Row label="Subnet ID" value={result.subnetId || '—'} mono small />
          <Row label="Interface ID (64 bit دوم)" value={result.interfaceId} mono small />
        </InfoCard>

        <InfoCard title="مقیاس و Reverse DNS" icon={Binary}>
          <Row label="تعداد کل آدرس‌ها" value={totalFormatted} />
          <Row label="Reverse DNS" value={result.reverseDns} mono small />
        </InfoCard>
      </div>

      {/* Binary groups */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Binary className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white">گروه‌های ۱۶ بیتی</h3>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {result.binaryGroups.map((g, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center"
              >
                <div className="text-[11px] md:text-xs text-white/40 mb-1">
                  {i * 16}
                </div>
                <div className="text-white font-mono text-xs">{g}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════
// Shared UI pieces
// ═══════════════════════════════════════════

const ACCENT = {
  cyan: 'from-cyan-500/20 to-blue-500/5 border-cyan-500/30',
  orange: 'from-orange-500/20 to-red-500/5 border-orange-500/30',
  emerald: 'from-emerald-500/20 to-teal-500/5 border-emerald-500/30',
  purple: 'from-purple-500/20 to-fuchsia-500/5 border-purple-500/30',
};

function BigResult({
  label,
  value,
  sub,
  accent,
  small,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: keyof typeof ACCENT;
  small?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('کپی شد');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('کپی نشد');
    }
  };

  return (
    <div
      className={cn(
        'rounded-3xl border bg-gradient-to-br backdrop-blur-xl p-5',
        ACCENT[accent],
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-white/60">{label}</div>
        <button
          onClick={copy}
          className="text-white/40 hover:text-white transition-colors"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      <div
        className={cn(
          'text-white font-mono font-bold break-all',
          small ? 'text-base' : 'text-xl',
        )}
        dir="ltr"
      >
        {value}
      </div>
      {sub && <div className="text-xs text-white/40 mt-1">{sub}</div>}
    </div>
  );
}

function InfoCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-4 h-4 text-white/60" />
          <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        <div className="space-y-2">{children}</div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  mono,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/50 flex-shrink-0">{label}</span>
      <span
        className={cn(
          'text-white text-right break-all',
          mono && 'font-mono',
          small ? 'text-xs' : 'text-sm',
        )}
        dir={mono ? 'ltr' : 'rtl'}
      >
        {value}
      </span>
    </div>
  );
}

function BinaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl p-3 border',
        highlight
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : 'bg-white/[0.02] border-white/10',
      )}
    >
      <div className="text-[11px] md:text-xs text-white/40 mb-1">{label}</div>
      <div className="text-white font-mono text-xs break-all" dir="ltr">
        {value}
      </div>
    </div>
  );
}
