'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl',
      className,
    )}
    {...props}
  />
));

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-5 pb-3 md:p-8 md:pb-4', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-3 md:p-8 md:pt-4', className)} {...props} />
));

CardContent.displayName = 'CardContent';
