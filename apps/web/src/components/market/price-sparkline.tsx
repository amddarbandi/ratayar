'use client';

import { useEffect, useState } from 'react';
import { marketApi } from '@/lib/api';

interface Point {
  ts: string;
  priceToman: number | null;
  priceUsd: number | null;
}

interface Props {
  symbol: string;
  days?: number;
  height?: number;
  width?: number;
  color?: 'up' | 'down' | 'auto';
  className?: string;
}

export function PriceSparkline({
  symbol,
  days = 30,
  height = 40,
  width = 120,
  color = 'auto',
  className,
}: Props) {
  const [points, setPoints] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    marketApi
      .history(symbol, days)
      .then((res) => {
        if (cancelled) return;
        const values = (res.data as Point[])
          .map((p) => p.priceToman ?? p.priceUsd ?? 0)
          .filter((v) => v > 0);
        setPoints(values);
      })
      .catch(() => {
        if (!cancelled) setPoints([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [symbol, days]);

  if (loading || points.length < 2) {
    return (
      <div
        className={className}
        style={{ width, height }}
        aria-hidden
      />
    );
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const pad = 2;
  const usableH = height - pad * 2;

  const d = points
    .map((v, i) => {
      const x = i * stepX;
      const y = pad + usableH - ((v - min) / range) * usableH;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  const isUp = points[points.length - 1] >= points[0];
  const stroke =
    color === 'up'
      ? '#10b981'
      : color === 'down'
        ? '#ef4444'
        : isUp
          ? '#10b981'
          : '#ef4444';

  const gradientId = `spark-${symbol}-${days}-${isUp ? 'u' : 'd'}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${d} L ${width} ${height} L 0 ${height} Z`}
        fill={`url(#${gradientId})`}
      />
      <path
        d={d}
        stroke={stroke}
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
