'use client';

import { motion } from 'framer-motion';
import {
  X,
  Check,
  AlertTriangle,
  ArrowRight,
  Activity,
  Users,
  ShoppingCart,
  DollarSign,
  Target,
} from 'lucide-react';

interface ContinueToStrategyModalProps {
  snapshot: {
    dataQualityScore?: number;
    gateStatus?: string;
    sources?: string[];
  };
  dataGaps: Array<{
    severity?: string;
  }>;
  onClose: () => void;
}

export default function ContinueToStrategyModal({
  snapshot,
  dataGaps,
  onClose,
}: ContinueToStrategyModalProps) {
  const safeSnapshot = snapshot ?? {};
  const safeDataGaps = dataGaps ?? [];
  
  const hasCriticalGaps = safeDataGaps.some(
    (gap) => gap?.severity === 'CRITICAL'
  );

  const checklistItems = [
    {
      label: 'Трафик',
      description: 'Подключён (Gravora Tag)',
      checked: (safeSnapshot.sources ?? []).some(
        (s) => s?.includes?.('tag') || s?.includes?.('ga4')
      ),
      icon: Activity,
    },
    {
      label: 'Лиды',
      description: 'Подключён (CRM)',
      checked: (safeSnapshot.sources ?? []).some(
        (s) => s?.includes?.('crm') || s?.includes?.('bitrix')
      ),
      icon: Users,
    },
    {
      label: 'Продажи',
      description: 'Настроено (deal_won)',
      checked: true,
      icon: ShoppingCart,
    },
    {
      label: 'Расходы',
      description: 'Не подключены',
      checked: (safeSnapshot.sources ?? []).some(
        (s) => s?.includes?.('ads') || s?.includes?.('google_ads')
      ),
      icon: DollarSign,
      warning: true,
    },
    {
      label: 'Маржа',
      description: 'Нет данных',
      checked: false,
      icon: Target,
      optional: true,
    },
  ];

  const getGateColor = () => {
    switch (safeSnapshot.gateStatus) {
      case 'C':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'B':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-effect rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Готовы к стратегии?</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A3058] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Уровень готовности</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold border ${getGateColor()}`}
            >
              Gate {safeSnapshot.gateStatus ?? 'A'}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {checklistItems.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                item.checked
                  ? 'bg-green-500/10'
                  : item.warning
                  ? 'bg-yellow-500/10'
                  : 'bg-[#1E2342]/50'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  item.checked
                    ? 'bg-green-500/20'
                    : item.warning
                    ? 'bg-yellow-500/20'
                    : 'bg-[#2A3058]'
                }`}
              >
                {item.checked ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : item.warning ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                ) : (
                  <item.icon className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.optional && (
                    <span className="text-xs text-gray-500">(опционально)</span>
                  )}
                </div>
                <span
                  className={`text-xs ${
                    item.checked
                      ? 'text-green-400'
                      : item.warning
                      ? 'text-yellow-400'
                      : 'text-gray-400'
                  }`}
                >
                  {item.description}
                </span>
              </div>
            </div>
          ))}
        </div>

        {hasCriticalGaps && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div>
                <span className="text-red-400 font-medium text-sm">
                  Есть критические проблемы
                </span>
                <p className="text-gray-400 text-xs mt-1">
                  Исправьте их перед переходом к стратегии
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary text-sm"
          >
            Подключить источники
          </button>
          <button
            disabled={hasCriticalGaps}
            className="flex-1 btn-primary text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Продолжить
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {!hasCriticalGaps && (safeDataGaps?.length ?? 0) > 0 && (
          <p className="text-xs text-yellow-400 text-center mt-4">
            ℹ️ Вы можете продолжить, но точность стратегии будет ниже
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
