'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Info,
  FileSpreadsheet,
  Settings,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  BarChart3,
  Save,
  ChevronDown,
  ChevronUp,
  Zap,
  Plus,
  X,
  Globe,
  Instagram,
  Facebook,
} from 'lucide-react';

interface ManualInputFlowProps {
  companyId: string;
}

type PeriodType = '7days' | '30days' | '90days';
type Granularity = 'day' | 'week' | 'month';

interface MetricRow {
  periodIndex: number;
  periodDate: string;
  periodLabel: string;
  sessions: number | null;
  users: number | null;
  clicks: number | null;
  impressions: number | null;
  organicSessions: number | null;
  paidSessions: number | null;
  leads: number | null;
  deals: number | null;
  sales: number | null;
  revenue: number | null;
  adSpend: number | null;
  totalBudget: number | null;
  repeatSales: number | null;
  cogs: number | null;
}

interface ChannelRow {
  periodIndex: number;
  periodLabel: string;
  channelName: string;
  channelType: string;
  sessions: number | null;
  clicks: number | null;
  impressions: number | null;
  leads: number | null;
  adSpend: number | null;
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const DEFAULT_CHANNELS = [
  { name: 'Instagram', type: 'social', icon: '📷' },
  { name: 'TikTok', type: 'social', icon: '🎵' },
  { name: 'Facebook', type: 'social', icon: '👍' },
  { name: 'Google Ads', type: 'search', icon: '🔍' },
  { name: 'Яндекс.Директ', type: 'search', icon: '🔎' },
  { name: 'YouTube', type: 'social', icon: '▶️' },
  { name: 'Telegram', type: 'social', icon: '✈️' },
  { name: 'VK', type: 'social', icon: '👤' },
  { name: 'Органика', type: 'organic', icon: '🌱' },
  { name: 'Прямой трафик', type: 'direct', icon: '🎯' },
];

export default function ManualInputFlow({ companyId }: ManualInputFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [periodType, setPeriodType] = useState<PeriodType>('30days');
  const [granularity, setGranularity] = useState<Granularity>('month');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('Asia/Almaty');
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    traffic: true,
    funnel: true,
    finance: true,
    channels: false,
  });

  // Channels
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [customChannelName, setCustomChannelName] = useState('');
  const [channelData, setChannelData] = useState<ChannelRow[]>([]);

  // Event Mapping
  const [saleEventType, setSaleEventType] = useState('paid_order');
  const [leadEventType, setLeadEventType] = useState('form_submit');
  const [dealEventType, setDealEventType] = useState('deal_created');
  const [repeatWindow, setRepeatWindow] = useState(30);

  useEffect(() => {
    generatePeriods();
  }, [periodType, granularity]);

  // Update channel data when periods or channels change
  useEffect(() => {
    if (selectedChannels.length > 0 && metrics.length > 0) {
      generateChannelData();
    }
  }, [selectedChannels, metrics.length, periodType, granularity]);

  const generatePeriods = () => {
    const periods: MetricRow[] = [];
    const today = new Date();

    if (granularity === 'month') {
      const numMonths = periodType === '7days' ? 1 : periodType === '30days' ? 3 : 6;
      for (let i = numMonths - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        periods.push(createEmptyRow(numMonths - 1 - i, date, granularity));
      }
    } else if (granularity === 'week') {
      const numWeeks = periodType === '7days' ? 1 : periodType === '30days' ? 4 : 13;
      for (let i = numWeeks - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i * 7);
        periods.push(createEmptyRow(numWeeks - 1 - i, date, granularity));
      }
    } else {
      const numDays = periodType === '7days' ? 7 : periodType === '30days' ? 30 : 90;
      for (let i = numDays - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        periods.push(createEmptyRow(numDays - 1 - i, date, granularity));
      }
    }

    setMetrics(periods);
  };

  const generateChannelData = () => {
    const data: ChannelRow[] = [];
    metrics.forEach((row) => {
      selectedChannels.forEach((channelName) => {
        const existingData = channelData.find(
          (c) => c.periodIndex === row.periodIndex && c.channelName === channelName
        );
        const channelInfo = DEFAULT_CHANNELS.find((c) => c.name === channelName) || { type: 'custom' };
        data.push({
          periodIndex: row.periodIndex,
          periodLabel: row.periodLabel,
          channelName,
          channelType: channelInfo.type,
          sessions: existingData?.sessions ?? null,
          clicks: existingData?.clicks ?? null,
          impressions: existingData?.impressions ?? null,
          leads: existingData?.leads ?? null,
          adSpend: existingData?.adSpend ?? null,
        });
      });
    });
    setChannelData(data);
  };

  const createEmptyRow = (index: number, date: Date, gran: Granularity): MetricRow => {
    let label = '';
    if (gran === 'month') {
      label = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
    } else if (gran === 'week') {
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 6);
      label = `${date.getDate()}.${date.getMonth() + 1} - ${endDate.getDate()}.${endDate.getMonth() + 1}`;
    } else {
      label = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }

    return {
      periodIndex: index,
      periodDate: date.toISOString().split('T')[0],
      periodLabel: label,
      sessions: null,
      users: null,
      clicks: null,
      impressions: null,
      organicSessions: null,
      paidSessions: null,
      leads: null,
      deals: null,
      sales: null,
      revenue: null,
      adSpend: null,
      totalBudget: null,
      repeatSales: null,
      cogs: null,
    };
  };

  const updateMetric = (index: number, field: keyof MetricRow, value: number | null) => {
    setMetrics((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const updateChannelData = (periodIndex: number, channelName: string, field: keyof ChannelRow, value: number | null) => {
    setChannelData((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((c) => c.periodIndex === periodIndex && c.channelName === channelName);
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], [field]: value };
      }
      return updated;
    });
  };

  const addChannel = (channelName: string) => {
    if (!selectedChannels.includes(channelName)) {
      setSelectedChannels((prev) => [...prev, channelName]);
    }
  };

  const removeChannel = (channelName: string) => {
    setSelectedChannels((prev) => prev.filter((c) => c !== channelName));
    setChannelData((prev) => prev.filter((c) => c.channelName !== channelName));
  };

  const addCustomChannel = () => {
    if (customChannelName.trim() && !selectedChannels.includes(customChannelName.trim())) {
      setSelectedChannels((prev) => [...prev, customChannelName.trim()]);
      setCustomChannelName('');
    }
  };

  const totals = useMemo(() => {
    return metrics.reduce(
      (acc, m) => {
        acc.sessions += m.sessions || 0;
        acc.users += m.users || 0;
        acc.clicks += m.clicks || 0;
        acc.impressions += m.impressions || 0;
        acc.leads += m.leads || 0;
        acc.deals += m.deals || 0;
        acc.sales += m.sales || 0;
        acc.revenue += m.revenue || 0;
        acc.adSpend += m.adSpend || 0;
        acc.repeatSales += m.repeatSales || 0;
        acc.cogs += m.cogs || 0;
        acc.organicSessions += m.organicSessions || 0;
        acc.paidSessions += m.paidSessions || 0;
        return acc;
      },
      { sessions: 0, users: 0, clicks: 0, impressions: 0, leads: 0, deals: 0, sales: 0, revenue: 0, adSpend: 0, repeatSales: 0, cogs: 0, organicSessions: 0, paidSessions: 0 }
    );
  }, [metrics]);

  const channelTotals = useMemo(() => {
    const totals: Record<string, { sessions: number; clicks: number; impressions: number; leads: number; adSpend: number }> = {};
    channelData.forEach((c) => {
      if (!totals[c.channelName]) {
        totals[c.channelName] = { sessions: 0, clicks: 0, impressions: 0, leads: 0, adSpend: 0 };
      }
      totals[c.channelName].sessions += c.sessions || 0;
      totals[c.channelName].clicks += c.clicks || 0;
      totals[c.channelName].impressions += c.impressions || 0;
      totals[c.channelName].leads += c.leads || 0;
      totals[c.channelName].adSpend += c.adSpend || 0;
    });
    return totals;
  }, [channelData]);

  const periodDays = useMemo(() => {
    if (periodType === '7days') return 7;
    if (periodType === '30days') return 30;
    return 90;
  }, [periodType]);

  const dailyMetrics = useMemo(() => {
    return {
      dailySales: totals.sales > 0 ? totals.sales / periodDays : 0,
      dailyRevenue: totals.revenue > 0 ? totals.revenue / periodDays : 0,
    };
  }, [totals, periodDays]);

  const validateMetrics = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    metrics.forEach((row, index) => {
      const periodLabel = row.periodLabel;

      if (row.sessions !== null && row.leads !== null && row.leads > row.sessions) {
        errors.push({
          field: `row-${index}-leads`,
          message: `${periodLabel}: Лиды (${row.leads}) не могут быть больше сессий (${row.sessions})`,
          severity: 'error',
        });
      }

      if (row.leads !== null && row.deals !== null && row.deals > row.leads) {
        errors.push({
          field: `row-${index}-deals`,
          message: `${periodLabel}: Сделки (${row.deals}) не могут быть больше лидов (${row.leads})`,
          severity: 'error',
        });
      }

      if (row.deals !== null && row.sales !== null && row.sales > row.deals) {
        errors.push({
          field: `row-${index}-sales`,
          message: `${periodLabel}: Продажи (${row.sales}) не могут быть больше сделок (${row.deals})`,
          severity: 'error',
        });
      }

      if (row.sales !== null && row.repeatSales !== null && row.repeatSales > row.sales) {
        errors.push({
          field: `row-${index}-repeatSales`,
          message: `${periodLabel}: Повторные продажи не могут быть больше общих продаж`,
          severity: 'error',
        });
      }

      if (row.sales !== null && row.sales > 0 && (row.revenue === null || row.revenue === 0)) {
        errors.push({
          field: `row-${index}-revenue`,
          message: `${periodLabel}: Есть продажи, но выручка = 0`,
          severity: 'error',
        });
      }

      if (row.adSpend !== null && row.adSpend > 0 && (row.clicks === null || row.clicks === 0)) {
        errors.push({
          field: `row-${index}-clicks`,
          message: `${periodLabel}: Есть рекламный бюджет, но нет данных по кликам`,
          severity: 'warning',
        });
      }
    });

    return errors;
  };

  const handleSave = async () => {
    const errors = validateMetrics();
    setValidationErrors(errors);

    if (errors.filter((e) => e.severity === 'error').length > 0) {
      return;
    }

    setSaving(true);

    try {
      // Prepare data for backend API
      const apiMetrics = metrics.map((m) => ({
        period_index: m.periodIndex,
        period_date: m.periodDate,
        period_label: m.periodLabel,
        sessions: m.sessions,
        users: m.users,
        clicks: m.clicks,
        impressions: m.impressions,
        organic_sessions: m.organicSessions,
        paid_sessions: m.paidSessions,
        leads: m.leads,
        deals: m.deals,
        sales: m.sales,
        revenue: m.revenue,
        ad_spend: m.adSpend,
        total_budget: m.totalBudget,
        repeat_sales: m.repeatSales,
        cogs: m.cogs,
      }));

      // Aggregate channels
      const channelAggregates: Record<string, any> = {};
      channelData.forEach((ch) => {
        if (!channelAggregates[ch.channelName]) {
          channelAggregates[ch.channelName] = {
            channel_name: ch.channelName,
            channel_type: ch.channelType,
            sessions: 0,
            clicks: 0,
            impressions: 0,
            leads: 0,
            ad_spend: 0,
          };
        }
        channelAggregates[ch.channelName].sessions += ch.sessions || 0;
        channelAggregates[ch.channelName].clicks += ch.clicks || 0;
        channelAggregates[ch.channelName].impressions += ch.impressions || 0;
        channelAggregates[ch.channelName].leads += ch.leads || 0;
        channelAggregates[ch.channelName].ad_spend += ch.adSpend || 0;
      });

      const apiChannels = Object.values(channelAggregates);

      // Import and call manualInputAPI
      const { manualInputAPI, snapshotAPI, aiAPI } = await import('@/lib/gravora-api');

      // Submit manual input
      const response = await manualInputAPI.submit({
        company_id: companyId,
        period_type: periodType,
        granularity,
        currency,
        timezone,
        metrics: apiMetrics,
        channels: apiChannels.length > 0 ? apiChannels : undefined,
      });

      if (response.status === 'ok') {
        // Build snapshot with the new data
        try {
          await snapshotAPI.build(companyId);
          // Optionally run AI orchestrate
          await aiAPI.orchestrate(companyId);
        } catch (e) {
          console.log('Post-save actions:', e);
        }
        
        router.push('/dashboard');
      } else {
        const errorMsg = response.validation_errors?.map((e) => e.message).join(', ') || 'Ошибка сохранения';
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error('Save error:', error);
      alert(error.message || 'Ошибка сети. Возможно, endpoint ещё не реализован на backend.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getCurrencySymbol = () => {
    const symbols: Record<string, string> = { USD: '$', KZT: '₸', RUB: '₽', EUR: '€' };
    return symbols[currency] || currency;
  };

  const renderMetricInput = (row: MetricRow, index: number, field: keyof MetricRow, placeholder: string, min?: number) => {
    const hasError = validationErrors.some((e) => e.field === `row-${index}-${field}` && e.severity === 'error');
    const hasWarning = validationErrors.some((e) => e.field === `row-${index}-${field}` && e.severity === 'warning');

    return (
      <input
        type="number"
        value={row[field] ?? ''}
        onChange={(e) => updateMetric(index, field, e.target.value === '' ? null : parseFloat(e.target.value))}
        placeholder={placeholder}
        min={min}
        className={`w-full p-2 text-sm bg-[#0D1321] border rounded text-white text-center ${
          hasError ? 'border-red-500' : hasWarning ? 'border-yellow-500' : 'border-gray-700'
        }`}
      />
    );
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Выберите период ввода</h2>
        <p className="text-gray-400">Укажите за какой период вы хотите ввести метрики</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { value: '7days', label: '7 дней', desc: 'Для быстрого тестирования' },
          { value: '30days', label: '30 дней', desc: 'Рекомендуемый период' },
          { value: '90days', label: '90 дней', desc: 'Для глубокого анализа' },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setPeriodType(option.value as PeriodType)}
            className={`p-4 rounded-xl border-2 transition-all ${
              periodType === option.value
                ? 'border-[#00D4FF] bg-[#00D4FF]/10'
                : 'border-gray-700 bg-[#1A1F3D]/50 hover:border-gray-500'
            }`}
          >
            <Calendar className={`w-8 h-8 mx-auto mb-2 ${periodType === option.value ? 'text-[#00D4FF]' : 'text-gray-400'}`} />
            <div className={`font-semibold ${periodType === option.value ? 'text-white' : 'text-gray-300'}`}>
              {option.label}
            </div>
            <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label className="text-gray-400 text-sm mb-2 block">Детализация (гранулярность)</label>
        <div className="flex gap-3">
          {[
            { value: 'month', label: 'По месяцам', icon: Calendar, desc: 'Рекомендуем для упрощения ввода' },
            { value: 'week', label: 'По неделям', icon: BarChart3, desc: 'Средняя детализация' },
            { value: 'day', label: 'По дням', icon: TrendingUp, desc: 'Максимальная точность' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setGranularity(option.value as Granularity)}
              className={`flex-1 p-3 rounded-lg border transition-all ${
                granularity === option.value
                  ? 'border-[#00D4FF] bg-[#00D4FF]/10 text-white'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              <option.icon className={`w-5 h-5 mx-auto mb-1 ${granularity === option.value ? 'text-[#00D4FF]' : 'text-gray-500'}`} />
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs text-gray-500 mt-1">{option.desc}</div>
            </button>
          ))}
        </div>
        {granularity === 'month' && (
          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Zap className="w-4 h-4" />
              <span>Месячный ввод значительно экономит время при работе с длинными периодами</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Валюта</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-3 bg-[#1A1F3D] border border-gray-700 rounded-lg text-white"
          >
            <option value="USD">USD ($)</option>
            <option value="KZT">KZT (₸)</option>
            <option value="RUB">RUB (₽)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Часовой пояс</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full p-3 bg-[#1A1F3D] border border-gray-700 rounded-lg text-white"
          >
            <option value="Asia/Almaty">Алматы (GMT+5)</option>
            <option value="Europe/Moscow">Москва (GMT+3)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Настройка маппинга событий</h2>
        <p className="text-gray-400">Определите что считать продажей, лидом и сделкой</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-[#1A1F3D]/50 rounded-xl border border-gray-700">
          <label className="text-gray-300 font-medium mb-2 block">Что такое ПРОДАЖА?</label>
          <select
            value={saleEventType}
            onChange={(e) => setSaleEventType(e.target.value)}
            className="w-full p-3 bg-[#0D1321] border border-gray-600 rounded-lg text-white"
          >
            <option value="paid_order">Оплаченный заказ</option>
            <option value="paid_deal">Оплаченная сделка</option>
            <option value="subscription_start">Старт подписки</option>
          </select>
        </div>

        <div className="p-4 bg-[#1A1F3D]/50 rounded-xl border border-gray-700">
          <label className="text-gray-300 font-medium mb-2 block">Что такое ЛИД?</label>
          <select
            value={leadEventType}
            onChange={(e) => setLeadEventType(e.target.value)}
            className="w-full p-3 bg-[#0D1321] border border-gray-600 rounded-lg text-white"
          >
            <option value="form_submit">Заявка с формы</option>
            <option value="lead_created">Лид в CRM</option>
            <option value="callback_request">Запрос обратного звонка</option>
          </select>
        </div>

        <div className="p-4 bg-[#1A1F3D]/50 rounded-xl border border-gray-700">
          <label className="text-gray-300 font-medium mb-2 block">Что такое СДЕЛКА?</label>
          <select
            value={dealEventType}
            onChange={(e) => setDealEventType(e.target.value)}
            className="w-full p-3 bg-[#0D1321] border border-gray-600 rounded-lg text-white"
          >
            <option value="deal_created">Сделка создана</option>
            <option value="kp_sent">КП отправлено</option>
            <option value="negotiation">Переговоры</option>
          </select>
        </div>

        <div className="p-4 bg-[#1A1F3D]/50 rounded-xl border border-gray-700">
          <label className="text-gray-300 font-medium mb-2 block">Окно повторных покупок (дней)</label>
          <input
            type="number"
            value={repeatWindow}
            onChange={(e) => setRepeatWindow(parseInt(e.target.value) || 30)}
            className="w-full p-3 bg-[#0D1321] border border-gray-600 rounded-lg text-white"
            min={1}
            max={365}
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Ввод метрик</h2>
        <p className="text-gray-400">
          {granularity === 'month' ? 'Заполните данные по месяцам' : 
           granularity === 'week' ? 'Заполните данные по неделям' : 
           'Заполните данные по дням'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg border border-blue-500/30">
          <div className="text-xs text-blue-400 mb-1">Сумма продаж</div>
          <div className="text-xl font-bold text-white">{totals.sales}</div>
          <div className="text-xs text-gray-400">за период</div>
        </div>
        <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg border border-green-500/30">
          <div className="text-xs text-green-400 mb-1">Ср. продаж/день</div>
          <div className="text-xl font-bold text-white">{dailyMetrics.dailySales.toFixed(1)}</div>
          <div className="text-xs text-gray-400">{periodDays} дней</div>
        </div>
        <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-lg border border-yellow-500/30">
          <div className="text-xs text-yellow-400 mb-1">Выручка</div>
          <div className="text-xl font-bold text-white">{getCurrencySymbol()}{totals.revenue.toLocaleString()}</div>
          <div className="text-xs text-gray-400">за период</div>
        </div>
        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg border border-purple-500/30">
          <div className="text-xs text-purple-400 mb-1">Ср. выручка/день</div>
          <div className="text-xl font-bold text-white">{getCurrencySymbol()}{dailyMetrics.dailyRevenue.toFixed(0)}</div>
          <div className="text-xs text-gray-400">{periodDays} дней</div>
        </div>
      </div>

      {validationErrors.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
          <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
            <AlertTriangle className="w-5 h-5" />
            Обнаружены ошибки валидации
          </div>
          <ul className="text-sm text-red-300 space-y-1">
            {validationErrors.slice(0, 5).map((error, i) => (
              <li key={i}>• {error.message}</li>
            ))}
            {validationErrors.length > 5 && (
              <li className="text-gray-400">...и ещё {validationErrors.length - 5} ошибок</li>
            )}
          </ul>
        </div>
      )}

      <div className="overflow-x-auto">
        {/* Traffic Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('traffic')}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/10 rounded-lg text-white"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">Трафик и маркетинг</span>
              <span className="text-xs text-gray-400 ml-2">Сессии: {totals.sessions} | Клики: {totals.clicks} | Показы: {totals.impressions}</span>
            </div>
            {expandedSections.traffic ? <ChevronUp /> : <ChevronDown />}
          </button>

          {expandedSections.traffic && (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs">
                    <th className="p-2 text-left min-w-[100px]">Период</th>
                    <th className="p-2 text-center min-w-[90px]">Показы</th>
                    <th className="p-2 text-center min-w-[90px]">Клики</th>
                    <th className="p-2 text-center min-w-[90px]">Сессии</th>
                    <th className="p-2 text-center min-w-[90px]">Уник. польз.</th>
                    <th className="p-2 text-center min-w-[100px]">Расход ({getCurrencySymbol()})</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((row, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="p-2 text-gray-300 text-xs font-medium">{row.periodLabel}</td>
                      <td className="p-2">{renderMetricInput(row, i, 'impressions', '0', 0)}</td>
                      <td className="p-2">{renderMetricInput(row, i, 'clicks', '0', 0)}</td>
                      <td className="p-2">{renderMetricInput(row, i, 'sessions', '0', 0)}</td>
                      <td className="p-2">{renderMetricInput(row, i, 'users', '0', 0)}</td>
                      <td className="p-2">{renderMetricInput(row, i, 'adSpend', '0', 0)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[#00D4FF] bg-[#00D4FF]/5">
                    <td className="p-2 text-[#00D4FF] font-bold">ИТОГО</td>
                    <td className="p-2 text-center text-white font-semibold">{totals.impressions}</td>
                    <td className="p-2 text-center text-white font-semibold">{totals.clicks}</td>
                    <td className="p-2 text-center text-white font-semibold">{totals.sessions}</td>
                    <td className="p-2 text-center text-white font-semibold">{totals.users}</td>
                    <td className="p-2 text-center text-white font-semibold">{getCurrencySymbol()}{totals.adSpend.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Channels Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('channels')}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-indigo-500/20 to-indigo-600/10 rounded-lg text-white"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold">Каналы трафика</span>
              <span className="text-xs text-gray-400 ml-2">
                {selectedChannels.length > 0 ? `Выбрано: ${selectedChannels.length}` : '(опционально)'}
              </span>
            </div>
            {expandedSections.channels ? <ChevronUp /> : <ChevronDown />}
          </button>

          {expandedSections.channels && (
            <div className="mt-2 p-4 bg-[#1A1F3D]/30 rounded-lg border border-gray-700">
              {/* Channel Selection */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Выберите каналы трафика:</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DEFAULT_CHANNELS.map((channel) => (
                    <button
                      key={channel.name}
                      onClick={() => selectedChannels.includes(channel.name) ? removeChannel(channel.name) : addChannel(channel.name)}
                      className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-all ${
                        selectedChannels.includes(channel.name)
                          ? 'bg-[#00D4FF]/20 border border-[#00D4FF] text-[#00D4FF]'
                          : 'bg-gray-700/50 border border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      <span>{channel.icon}</span>
                      <span>{channel.name}</span>
                      {selectedChannels.includes(channel.name) && <X className="w-3 h-3 ml-1" />}
                    </button>
                  ))}
                </div>

                {/* Custom Channel */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customChannelName}
                    onChange={(e) => setCustomChannelName(e.target.value)}
                    placeholder="Добавить свой канал..."
                    className="flex-1 p-2 text-sm bg-[#0D1321] border border-gray-600 rounded-lg text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomChannel()}
                  />
                  <button
                    onClick={addCustomChannel}
                    disabled={!customChannelName.trim()}
                    className="px-3 py-2 bg-[#00D4FF]/20 border border-[#00D4FF] text-[#00D4FF] rounded-lg disabled:opacity-50 hover:bg-[#00D4FF]/30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Channel Data Input */}
              {selectedChannels.length > 0 && (
                <div className="overflow-x-auto">
                  {selectedChannels.map((channelName) => {
                    const channelInfo = DEFAULT_CHANNELS.find((c) => c.name === channelName);
                    const chTotals = channelTotals[channelName] || { sessions: 0, clicks: 0, impressions: 0, leads: 0, adSpend: 0 };
                    return (
                      <div key={channelName} className="mb-4">
                        <div className="flex items-center justify-between p-2 bg-gray-700/30 rounded-t-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{channelInfo?.icon || '📈'}</span>
                            <span className="text-white font-medium">{channelName}</span>
                          </div>
                          <button
                            onClick={() => removeChannel(channelName)}
                            className="text-gray-400 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-400 text-xs bg-gray-800/30">
                              <th className="p-2 text-left min-w-[100px]">Период</th>
                              <th className="p-2 text-center min-w-[80px]">Показы</th>
                              <th className="p-2 text-center min-w-[80px]">Клики</th>
                              <th className="p-2 text-center min-w-[80px]">Сессии</th>
                              <th className="p-2 text-center min-w-[80px]">Лиды</th>
                              <th className="p-2 text-center min-w-[90px]">Расход ({getCurrencySymbol()})</th>
                            </tr>
                          </thead>
                          <tbody>
                            {channelData
                              .filter((c) => c.channelName === channelName)
                              .map((row) => (
                                <tr key={`${channelName}-${row.periodIndex}`} className="border-t border-gray-800">
                                  <td className="p-2 text-gray-300 text-xs font-medium">{row.periodLabel}</td>
                                  <td className="p-2">
                                    <input
                                      type="number"
                                      value={row.impressions ?? ''}
                                      onChange={(e) => updateChannelData(row.periodIndex, channelName, 'impressions', e.target.value === '' ? null : parseInt(e.target.value))}
                                      placeholder="0"
                                      min={0}
                                      className="w-full p-1.5 text-xs bg-[#0D1321] border border-gray-700 rounded text-white text-center"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="number"
                                      value={row.clicks ?? ''}
                                      onChange={(e) => updateChannelData(row.periodIndex, channelName, 'clicks', e.target.value === '' ? null : parseInt(e.target.value))}
                                      placeholder="0"
                                      min={0}
                                      className="w-full p-1.5 text-xs bg-[#0D1321] border border-gray-700 rounded text-white text-center"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="number"
                                      value={row.sessions ?? ''}
                                      onChange={(e) => updateChannelData(row.periodIndex, channelName, 'sessions', e.target.value === '' ? null : parseInt(e.target.value))}
                                      placeholder="0"
                                      min={0}
                                      className="w-full p-1.5 text-xs bg-[#0D1321] border border-gray-700 rounded text-white text-center"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="number"
                                      value={row.leads ?? ''}
                                      onChange={(e) => updateChannelData(row.periodIndex, channelName, 'leads', e.target.value === '' ? null : parseInt(e.target.value))}
                                      placeholder="0"
                                      min={0}
                                      className="w-full p-1.5 text-xs bg-[#0D1321] border border-gray-700 rounded text-white text-center"
                                    />
                                  </td>
                                  <td className="p-2">
                                    <input
                                      type="number"
                                      value={row.adSpend ?? ''}
                                      onChange={(e) => updateChannelData(row.periodIndex, channelName, 'adSpend', e.target.value === '' ? null : parseFloat(e.target.value))}
                                      placeholder="0"
                                      min={0}
                                      className="w-full p-1.5 text-xs bg-[#0D1321] border border-gray-700 rounded text-white text-center"
                                    />
                                  </td>
                                </tr>
                              ))}
                            <tr className="border-t-2 border-indigo-500 bg-indigo-500/5">
                              <td className="p-2 text-indigo-400 font-bold text-xs">Итого</td>
                              <td className="p-2 text-center text-white font-semibold text-xs">{chTotals.impressions}</td>
                              <td className="p-2 text-center text-white font-semibold text-xs">{chTotals.clicks}</td>
                              <td className="p-2 text-center text-white font-semibold text-xs">{chTotals.sessions}</td>
                              <td className="p-2 text-center text-white font-semibold text-xs">{chTotals.leads}</td>
                              <td className="p-2 text-center text-white font-semibold text-xs">{getCurrencySymbol()}{chTotals.adSpend}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Funnel Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('funnel')}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-500/20 to-green-600/10 rounded-lg text-white"
          >
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              <span className="font-semibold">Воронка продаж</span>
              <span className="text-xs text-gray-400 ml-2">Лиды: {totals.leads} → Сделки: {totals.deals} → Продажи: {totals.sales}</span>
            </div>
            {expandedSections.funnel ? <ChevronUp /> : <ChevronDown />}
          </button>

          {expandedSections.funnel && (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs">
                    <th className="p-2 text-left min-w-[100px]">Период</th>
                    <th className="p-2 text-center min-w-[90px]">Лиды</th>
                    <th className="p-2 text-center min-w-[90px]">Сделки</th>
                    <th className="p-2 text-center min-w-[90px]">Продажи</th>
                    <th className="p-2 text-center min-w-[90px]">Повтор.</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((row, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="p-2 text-gray-300 text-xs font-medium">{row.periodLabel}</td>
                      <td className="p-2">{renderMetricInput(row, i, 'leads', '0', 0)}</td>
                      <td className="p-2">{renderMetricInput(row, i, 'deals', '0', 0)}</td>
                      <td className="p-2">{renderMetricInput(row, i, 'sales', '0', 0)}</td>
                      <td className="p-2">{renderMetricInput(row, i, 'repeatSales', '0', 0)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[#00D4FF] bg-[#00D4FF]/5">
                    <td className="p-2 text-[#00D4FF] font-bold">ИТОГО</td>
                    <td className="p-2 text-center text-white font-semibold">{totals.leads}</td>
                    <td className="p-2 text-center text-white font-semibold">{totals.deals}</td>
                    <td className="p-2 text-center text-white font-semibold">{totals.sales}</td>
                    <td className="p-2 text-center text-white font-semibold">{totals.repeatSales}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Finance Section */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('finance')}
            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 rounded-lg text-white"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">Финансы</span>
              <span className="text-xs text-gray-400 ml-2">Выручка: {getCurrencySymbol()}{totals.revenue.toLocaleString()} | COGS: {getCurrencySymbol()}{totals.cogs.toLocaleString()}</span>
            </div>
            {expandedSections.finance ? <ChevronUp /> : <ChevronDown />}
          </button>

          {expandedSections.finance && (
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 text-xs">
                    <th className="p-2 text-left min-w-[100px]">Период</th>
                    <th className="p-2 text-center min-w-[100px]">Выручка ({getCurrencySymbol()})</th>
                    <th className="p-2 text-center min-w-[100px]">COGS ({getCurrencySymbol()})</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((row, i) => (
                    <tr key={i} className="border-t border-gray-800">
                      <td className="p-2 text-gray-300 text-xs font-medium">{row.periodLabel}</td>
                      <td className="p-2">{renderMetricInput(row, i, 'revenue', '0', 0)}</td>
                      <td className="p-2">{renderMetricInput(row, i, 'cogs', '0', 0)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-[#00D4FF] bg-[#00D4FF]/5">
                    <td className="p-2 text-[#00D4FF] font-bold">ИТОГО</td>
                    <td className="p-2 text-center text-white font-semibold">{getCurrencySymbol()}{totals.revenue.toLocaleString()}</td>
                    <td className="p-2 text-center text-white font-semibold">{getCurrencySymbol()}{totals.cogs.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const steps = [
    { num: 1, title: 'Период', icon: Calendar },
    { num: 2, title: 'Маппинг', icon: Settings },
    { num: 3, title: 'Метрики', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-[#0D1321] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#1A1F3D]/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Ручной ввод метрик</h1>
              <p className="text-sm text-gray-400">Компания • Этап 0.01</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 rounded-full">
              <Info className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-400">Тестовый режим</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  step >= s.num
                    ? 'border-[#00D4FF] bg-[#00D4FF]/20 text-[#00D4FF]'
                    : 'border-gray-600 text-gray-500'
                }`}
              >
                {step > s.num ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span
                className={`ml-2 text-sm hidden sm:block ${step >= s.num ? 'text-white' : 'text-gray-500'}`}
              >
                {s.title}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-12 sm:w-24 h-0.5 mx-2 ${step > s.num ? 'bg-[#00D4FF]' : 'bg-gray-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="bg-[#1A1F3D]/30 rounded-2xl border border-gray-800 p-6">
          <AnimatePresence mode="wait">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#00FF88] text-[#0D1321] font-semibold rounded-lg"
            >
              Далее
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#00D4FF] to-[#00FF88] text-[#0D1321] font-semibold rounded-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0D1321] border-t-transparent" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Сохранить и перейти к анализу
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
