'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number | null;
  icon?: LucideIcon;
  highlight?: boolean;
  invertChange?: boolean;
}

export default function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  highlight = false,
  invertChange = false,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState('0');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Animate count up effect
    const numericValue = parseFloat(value?.replace?.(/[^0-9.-]/g, '') ?? '0');
    if (isNaN(numericValue)) {
      setDisplayValue(value ?? 'N/A');
      return;
    }

    const duration = 1000;
    const steps = 20;
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(increment * step, numericValue);
      
      // Format based on original value format
      if (value?.includes('$')) {
        if (current >= 1000000) {
          setDisplayValue(`$${(current / 1000000).toFixed(1)}M`);
        } else if (current >= 1000) {
          setDisplayValue(`$${(current / 1000).toFixed(1)}K`);
        } else {
          setDisplayValue(`$${current.toFixed(0)}`);
        }
      } else if (value?.includes('K')) {
        setDisplayValue(`${current.toFixed(1)}K`);
      } else if (value?.includes('M')) {
        setDisplayValue(`${current.toFixed(1)}M`);
      } else if (value?.includes('x')) {
        setDisplayValue(`${current.toFixed(1)}x`);
      } else if (value?.includes('%')) {
        setDisplayValue(`${current.toFixed(1)}%`);
      } else {
        setDisplayValue(current.toFixed(0));
      }

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value ?? 'N/A');
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const isPositive = change !== null && change !== undefined && change >= 0;
  const changeColor = invertChange
    ? isPositive
      ? 'text-red-400'
      : 'text-green-400'
    : isPositive
    ? 'text-green-400'
    : 'text-red-400';

  if (!mounted) {
    return (
      <div className="bg-[#1E2342]/50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-gray-400 text-xs">{title}</span>
        </div>
        <div className="text-lg font-bold">-</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-[#1E2342]/50 rounded-lg p-3 transition-all hover:bg-[#1E2342] cursor-pointer ${
        highlight ? 'ring-1 ring-cyan-400/30' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-3 h-3 text-gray-400" />}
        <span className="text-gray-400 text-xs">{title}</span>
      </div>
      <div className={`text-lg font-bold ${highlight ? 'gradient-text' : ''}`}>
        {displayValue}
      </div>
      {change !== null && change !== undefined && (
        <div className={`flex items-center gap-1 text-xs mt-1 ${changeColor}`}>
          {(invertChange ? !isPositive : isPositive) ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{isPositive ? '+' : ''}{change?.toFixed?.(1) ?? 0}%</span>
        </div>
      )}
    </motion.div>
  );
}
