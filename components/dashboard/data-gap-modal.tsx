'use client';

import { motion } from 'framer-motion';
import {
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  Plug,
  ChevronRight,
} from 'lucide-react';

interface DataGapModalProps {
  dataGaps: Array<{
    id?: string;
    severity?: string;
    area?: string;
    status?: string;
    whatIsMissing?: string;
    impact?: string;
    fixSteps?: string[];
    ctaAction?: string;
  }>;
  onClose: () => void;
}

export default function DataGapModal({ dataGaps, onClose }: DataGapModalProps) {
  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL':
        return AlertTriangle;
      case 'IMPORTANT':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'IMPORTANT':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default:
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getSeverityLabel = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'Критически';
      case 'IMPORTANT':
        return 'Важно';
      default:
        return 'Опционально';
    }
  };

  const getActionLabel = (action?: string) => {
    switch (action) {
      case 'CONNECT_CRM':
        return 'Подключить CRM';
      case 'CONNECT_ADS':
        return 'Подключить рекламу';
      case 'CONNECT_BI':
        return 'Подключить BI';
      case 'MAP_EVENTS':
        return 'Настроить события';
      default:
        return 'Исправить';
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
        className="glass-effect rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Пробелы в данных</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2A3058] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-6">
          Исправьте эти проблемы для повышения точности стратегии
        </p>

        <div className="space-y-4">
          {(dataGaps ?? []).map((gap, i) => {
            const Icon = getSeverityIcon(gap?.severity);
            return (
              <motion.div
                key={gap?.id ?? i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-xl border p-4 ${getSeverityColor(gap?.severity)?.split(' ')?.slice(1)?.join(' ') ?? 'bg-gray-500/20'}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      getSeverityColor(gap?.severity)?.split(' ')?.[1] ?? 'bg-gray-500/20'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        getSeverityColor(gap?.severity)?.split(' ')?.[0] ?? 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${getSeverityColor(gap?.severity)}`}
                      >
                        {getSeverityLabel(gap?.severity)}
                      </span>
                      <span className="text-xs text-gray-400">{gap?.area ?? ''}</span>
                    </div>
                    <h4 className="font-medium text-sm mb-2">
                      {gap?.whatIsMissing ?? 'Проблема'}
                    </h4>
                    <p className="text-xs text-gray-400 mb-3">
                      {gap?.impact ?? ''}
                    </p>
                    {(gap?.fixSteps?.length ?? 0) > 0 && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-400 block mb-1">
                          Как исправить:
                        </span>
                        <ul className="text-xs text-gray-300 space-y-1">
                          {(gap?.fixSteps ?? []).map((step, j) => (
                            <li key={j} className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-[#2A3058] flex items-center justify-center text-[10px]">
                                {j + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <button className="text-sm font-medium text-cyan-400 flex items-center gap-1 hover:underline">
                      <Plug className="w-4 h-4" />
                      {getActionLabel(gap?.ctaAction)}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {(dataGaps?.length ?? 0) === 0 && (
            <div className="text-center py-8 text-gray-400">
              Нет проблем с данными
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
