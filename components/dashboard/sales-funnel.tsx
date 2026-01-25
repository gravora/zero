'use client';

import { motion } from 'framer-motion';
import { Users, Handshake, ShoppingCart, Repeat, TrendingUp, ArrowDown } from 'lucide-react';

interface SalesFunnelProps {
  snapshot: any;
  currency?: string;
}

export default function SalesFunnel({ snapshot, currency = '$' }: SalesFunnelProps) {
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

  // Extract metrics
  const leads = snapshot?.leads || 0;
  const deals = snapshot?.deals || 0;
  const sales = snapshot?.sales || 0;
  const repeatSales = snapshot?.repeatSales || 0;
  const adSpend = snapshot?.adSpend || 0;

  // Calculate costs
  const cpl = leads > 0 ? adSpend / leads : null;
  const cpd = deals > 0 ? adSpend / deals : null;
  const cps = sales > 0 ? adSpend / sales : null;

  // Calculate conversions
  const crLeadDeal = leads > 0 ? (deals / leads) * 100 : null;
  const crDealSale = deals > 0 ? (sales / deals) * 100 : null;
  const repeatRate = sales > 0 ? (repeatSales / sales) * 100 : null;

  const stages = [
    {
      name: 'Лиды',
      value: leads,
      icon: Users,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      cost: cpl,
      costLabel: 'CPL',
      conversion: null,
      convLabel: null,
    },
    {
      name: 'Сделки',
      value: deals,
      icon: Handshake,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      cost: cpd,
      costLabel: 'CPD',
      conversion: crLeadDeal,
      convLabel: 'CR L→D',
    },
    {
      name: 'Продажи',
      value: sales,
      icon: ShoppingCart,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      cost: cps,
      costLabel: 'CPS',
      conversion: crDealSale,
      convLabel: 'CR D→S',
    },
    {
      name: 'Повторные',
      value: repeatSales,
      icon: Repeat,
      color: 'from-lime-500 to-lime-600',
      bgColor: 'bg-lime-500/10',
      borderColor: 'border-lime-500/30',
      cost: null,
      costLabel: null,
      conversion: repeatRate,
      convLabel: 'Repeat',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-400">Воронка продаж</h4>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <TrendingUp className="w-3 h-3" />
          <span>Сквозная CR: {leads > 0 ? formatPercent((sales / leads) * 100) : 'N/A'}</span>
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
