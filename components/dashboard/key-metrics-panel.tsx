'use client';

import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, BarChart3, Calculator, Wallet, Target, Percent, Eye, MousePointer } from 'lucide-react';

interface KeyMetricsPanelProps {
  snapshot: any;
  manualSnapshot?: any;
  currency?: string;
}

export default function KeyMetricsPanel({ snapshot, manualSnapshot, currency = '$' }: KeyMetricsPanelProps) {
  const formatCurrency = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    if (Math.abs(num) >= 1000000) return `${currency}${(num / 1000000).toFixed(1)}M`;
    if (Math.abs(num) >= 1000) return `${currency}${(num / 1000).toFixed(1)}K`;
    return `${currency}${num.toFixed(2)}`;
  };

  const formatPercent = (num: number | null | undefined) => {
    if (num === null || num === undefined || isNaN(num)) return 'N/A';
    return `${num.toFixed(1)}%`;
  };

  // Extract metrics from snapshot or manualSnapshot
  const revenue = snapshot?.revenue || manualSnapshot?.totalRevenue || 0;
  const sales = snapshot?.sales || manualSnapshot?.totalSales || 0;
  const users = snapshot?.users || manualSnapshot?.totalUsers || 0;
  const adSpend = snapshot?.adSpend || manualSnapshot?.totalAdSpend || 0;
  const cogs = manualSnapshot?.totalCogs || 0;
  const impressions = snapshot?.impressions || manualSnapshot?.totalImpressions || 0;
  const repeatSales = snapshot?.repeatSales || manualSnapshot?.totalRepeatSales || 0;

  // ========== ФИНАНСОВЫЕ МЕТРИКИ ==========
  // ATP - Average Transaction Price (средний чек)
  const atp = sales > 0 ? revenue / sales : null;
  // SPH - Sales Per Head (доход на клиента)
  const sph = users > 0 ? revenue / users : null;
  // ROI = (Доход - Расход) / Расход * 100%
  const roi = adSpend > 0 ? ((revenue - adSpend) / adSpend) * 100 : null;
  // ROMI = (Доп. доход - маркетинговые затраты) / маркетинговые затраты * 100%
  const romi = adSpend > 0 ? ((revenue - adSpend) / adSpend) * 100 : null;
  // ROAS = Доход / Расходы
  const roas = adSpend > 0 ? revenue / adSpend : null;
  // Gross Profit
  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : null;
  // EBITDA
  const ebitda = grossProfit - adSpend;
  const ebitdaMargin = revenue > 0 ? (ebitda / revenue) * 100 : null;

  // ========== КЛИЕНТСКАЯ АНАЛИТИКА ==========
  // CAC (Customer Acquisition Cost)
  const cac = sales > 0 ? adSpend / sales : null;
  // LTV = ATP * среднее кол-во покупок (упрощенно: с repeat rate)
  const repeatRate = sales > 0 ? (repeatSales / sales) * 100 : null;
  const avgPurchases = repeatRate !== null ? 1 + repeatRate / 100 : 1;
  const ltv = atp !== null ? atp * avgPurchases : null;
  // LTV:CAC ratio
  const ltvCacRatio = ltv && cac && cac > 0 ? ltv / cac : null;

  // ========== КАНАЛЫ ==========
  // CPM (Cost per Mille)
  const cpm = impressions > 0 ? (adSpend / impressions) * 1000 : null;

  const metrics = [
    {
      name: 'ATP',
      fullName: 'Средний чек',
      value: atp,
      format: 'currency',
      icon: DollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      formula: 'Revenue / Sales',
    },
    {
      name: 'ROI',
      fullName: 'Возврат инвестиций',
      value: roi,
      format: 'percent',
      icon: TrendingUp,
      color: roi && roi >= 100 ? 'text-green-400' : roi && roi >= 0 ? 'text-yellow-400' : 'text-red-400',
      bgColor: roi && roi >= 100 ? 'bg-green-500/10' : roi && roi >= 0 ? 'bg-yellow-500/10' : 'bg-red-500/10',
      formula: '(Revenue - Spend) / Spend × 100%',
    },
    {
      name: 'ROAS',
      fullName: 'Return on Ad Spend',
      value: roas,
      format: 'multiplier',
      icon: Percent,
      color: roas && roas >= 3 ? 'text-green-400' : roas && roas >= 1 ? 'text-yellow-400' : 'text-red-400',
      bgColor: roas && roas >= 3 ? 'bg-green-500/10' : roas && roas >= 1 ? 'bg-yellow-500/10' : 'bg-red-500/10',
      formula: 'Revenue / Ad Spend',
    },
    {
      name: 'CAC',
      fullName: 'Стоимость привлечения',
      value: cac,
      format: 'currency',
      icon: Target,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      formula: 'Ad Spend / Sales',
    },
    {
      name: 'LTV',
      fullName: 'Lifetime Value',
      value: ltv,
      format: 'currency',
      icon: Users,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      formula: 'ATP × (1 + Repeat Rate)',
    },
    {
      name: 'LTV:CAC',
      fullName: 'Коэффициент LTV/CAC',
      value: ltvCacRatio,
      format: 'multiplier',
      icon: BarChart3,
      color: ltvCacRatio && ltvCacRatio >= 3 ? 'text-green-400' : ltvCacRatio && ltvCacRatio >= 1 ? 'text-yellow-400' : 'text-red-400',
      bgColor: ltvCacRatio && ltvCacRatio >= 3 ? 'bg-green-500/10' : ltvCacRatio && ltvCacRatio >= 1 ? 'bg-yellow-500/10' : 'bg-red-500/10',
      formula: 'LTV / CAC (идеал ≥ 3)',
    },
    {
      name: 'Gross %',
      fullName: 'Валовая маржа',
      value: grossMargin,
      format: 'percent',
      icon: Wallet,
      color: grossMargin && grossMargin >= 50 ? 'text-green-400' : grossMargin && grossMargin >= 30 ? 'text-yellow-400' : 'text-orange-400',
      bgColor: grossMargin && grossMargin >= 50 ? 'bg-green-500/10' : grossMargin && grossMargin >= 30 ? 'bg-yellow-500/10' : 'bg-orange-500/10',
      formula: '(Revenue - COGS) / Revenue',
    },
    {
      name: 'EBITDA',
      fullName: 'Прибыль до налогов',
      value: ebitda,
      format: 'currency',
      icon: Calculator,
      color: ebitda && ebitda > 0 ? 'text-green-400' : 'text-red-400',
      bgColor: ebitda && ebitda > 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      formula: 'Revenue - COGS - Ad Spend',
    },
    {
      name: 'CPM',
      fullName: 'Cost per 1000 показов',
      value: cpm,
      format: 'currency',
      icon: Eye,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      formula: '(Ad Spend / Impressions) × 1000',
    },
  ];

  const formatValue = (metric: typeof metrics[0]) => {
    if (metric.value === null || metric.value === undefined || isNaN(metric.value)) return 'N/A';
    
    switch (metric.format) {
      case 'currency':
        return formatCurrency(metric.value);
      case 'percent':
        return formatPercent(metric.value);
      case 'multiplier':
        return `${metric.value.toFixed(2)}x`;
      default:
        return metric.value.toFixed(2);
    }
  };

  return (
    <div className="glass-effect rounded-xl p-5">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-purple-400" />
        Ключевые показатели эффективности
      </h3>

      <div className="grid grid-cols-3 gap-3">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`p-3 rounded-xl ${metric.bgColor} border border-gray-700/50 group relative`}
          >
            <div className="flex items-center gap-2 mb-1">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <span className="text-xs text-gray-400 font-medium">{metric.name}</span>
            </div>
            <div className={`text-lg font-bold ${metric.color}`}>
              {formatValue(metric)}
            </div>
            <div className="text-[10px] text-gray-500">{metric.fullName}</div>
            {/* Tooltip with formula */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 rounded text-[10px] text-gray-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {metric.formula}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary row */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-xs text-gray-400">Выручка</div>
            <div className="text-lg font-bold text-white">{formatCurrency(revenue)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Расходы на рекламу</div>
            <div className="text-lg font-bold text-orange-400">{formatCurrency(adSpend)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Вал. прибыль</div>
            <div className={`text-lg font-bold ${grossProfit >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
              {formatCurrency(grossProfit)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Чистая прибыль</div>
            <div className={`text-lg font-bold ${ebitda >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(ebitda)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
