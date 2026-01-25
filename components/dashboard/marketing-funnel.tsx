'use client';

import { motion } from 'framer-motion';
import { Users, MousePointer, Eye, DollarSign, ArrowDown } from 'lucide-react';

interface MarketingFunnelProps {
  snapshot: any;
  currency?: string;
}

export default function MarketingFunnel({ snapshot, currency = '$' }: MarketingFunnelProps) {
  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return `${currency}${num.toFixed(2)}`;
  };

  const formatPercent = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return `${num.toFixed(1)}%`;
  };

  // Calculate metrics
  const sessions = snapshot?.sessions || 0;
  const users = snapshot?.users || 0;
  const clicks = snapshot?.clicks || 0;
  const adSpend = snapshot?.adSpend || 0;
  const impressions = snapshot?.impressions || 0;

  const cpc = clicks > 0 ? adSpend / clicks : null;
  const cpu = users > 0 ? adSpend / users : null;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : null;
  const cpm = impressions > 0 ? (adSpend / impressions) * 1000 : null;

  const stages = [
    {
      name: 'Показы',
      value: impressions,
      icon: Eye,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      cost: cpm,
      costLabel: 'CPM',
    },
    {
      name: 'Клики',
      value: clicks,
      icon: MousePointer,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      cost: cpc,
      costLabel: 'CPC',
      conversion: ctr,
      convLabel: 'CTR',
    },
    {
      name: 'Посетители',
      value: sessions,
      icon: Users,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      cost: sessions > 0 ? adSpend / sessions : null,
      costLabel: 'CPS',
      conversion: clicks > 0 ? (sessions / clicks) * 100 : null,
      convLabel: 'CR',
    },
    {
      name: 'Уник. пользователи',
      value: users,
      icon: Users,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      cost: cpu,
      costLabel: 'CPU',
      conversion: sessions > 0 ? (users / sessions) * 100 : null,
      convLabel: 'CR',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-400">Воронка маркетинга</h4>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <DollarSign className="w-3 h-3" />
          <span>Расход: {formatCurrency(adSpend)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => (
          <motion.div
            key={stage.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* Conversion arrow between stages */}
            {index > 0 && stage.conversion !== null && (
              <div className="flex items-center justify-center gap-1 mb-1">
                <ArrowDown className="w-3 h-3 text-gray-500" />
                <span className="text-[10px] text-gray-500">
                  {stage.convLabel}: {formatPercent(stage.conversion)}
                </span>
              </div>
            )}

            {/* Static block - full width */}
            <div
              className={`w-full overflow-hidden rounded-lg ${stage.bgColor} border ${stage.borderColor}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${stage.color} opacity-10`} />
              <div className="relative p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stage.bgColor}`}>
                    <stage.icon className="w-4 h-4 text-white/80" />
                  </div>
                  <span className="text-sm font-medium text-white">{stage.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{formatNumber(stage.value)}</div>
                  {stage.cost !== null && (
                    <div className="text-xs text-gray-400">
                      {stage.costLabel}: {formatCurrency(stage.cost)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
