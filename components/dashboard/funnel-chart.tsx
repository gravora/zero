'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface FunnelChartProps {
  snapshot: {
    sessions?: number;
    leads?: number;
    deals?: number;
    sales?: number;
    repeatSales?: number;
    crVisitLead?: number | null;
    crLeadDeal?: number | null;
    crDealSale?: number | null;
  };
}

export default function FunnelChart({ snapshot }: FunnelChartProps) {
  const safeSnapshot = snapshot ?? {};
  
  const stages = [
    {
      name: 'Visits',
      value: safeSnapshot.sessions ?? 0,
      cr: null,
    },
    {
      name: 'Leads',
      value: safeSnapshot.leads ?? 0,
      cr: safeSnapshot.crVisitLead ?? null,
    },
    {
      name: 'Deals',
      value: safeSnapshot.deals ?? 0,
      cr: safeSnapshot.crLeadDeal ?? null,
    },
    {
      name: 'Sales',
      value: safeSnapshot.sales ?? 0,
      cr: safeSnapshot.crDealSale ?? null,
    },
    {
      name: 'Repeat',
      value: safeSnapshot.repeatSales ?? 0,
      cr: (safeSnapshot.sales ?? 0) > 0
        ? ((safeSnapshot.repeatSales ?? 0) / (safeSnapshot.sales ?? 1)) * 100
        : null,
    },
  ];

  const maxValue = Math.max(...stages.map((s) => s.value ?? 0), 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, i) => {
        const width = ((stage.value ?? 0) / maxValue) * 100;
        const colors = [
          'from-blue-500 to-blue-400',
          'from-cyan-500 to-cyan-400',
          'from-teal-500 to-teal-400',
          'from-green-500 to-green-400',
          'from-emerald-500 to-emerald-400',
        ];

        return (
          <motion.div
            key={stage.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{stage.name}</span>
                {i > 0 && stage.cr !== null && (
                  <span className="text-xs text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                    {stage.cr?.toFixed?.(1) ?? 0}% CR
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold">
                {(stage.value ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="h-8 bg-[#1E2342] rounded-lg overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(width, 2)}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className={`h-full bg-gradient-to-r ${colors[i] ?? colors[0]} rounded-lg flex items-center justify-end pr-2`}
              >
                {width > 15 && (
                  <span className="text-xs font-medium text-white/80">
                    {width?.toFixed?.(0) ?? 0}%
                  </span>
                )}
              </motion.div>
            </div>
            {i < stages.length - 1 && (
              <div className="flex justify-center my-1">
                <ChevronRight className="w-4 h-4 text-gray-500 rotate-90" />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
