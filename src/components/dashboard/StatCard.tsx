'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from '@/components/ui/icons';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800',
    success: 'bg-green-50 dark:bg-green-900/20',
    warning: 'bg-amber-50 dark:bg-amber-900/20',
    danger: 'bg-red-50 dark:bg-red-900/20',
  };

  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  const renderTrend = () => {
    if (!trend) return null;

    const { value, direction } = trend;
    const formattedValue = value > 0 ? `+${value}%` : `${value}%`;

    return (
      <div className={cn('flex items-center', trendColors[direction])}>
        {direction === 'up' && <ArrowUpIcon size={16} className="mr-1" />}
        {direction === 'down' && <ArrowDownIcon size={16} className="mr-1" />}
        <span className="text-sm font-medium">{formattedValue}</span>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'rounded-lg border p-4 shadow-sm',
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline">
        <div className="text-2xl font-semibold">{value}</div>
        <div className="ml-2">{renderTrend()}</div>
      </div>
      {description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
} 