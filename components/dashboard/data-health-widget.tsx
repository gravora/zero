'use client';

import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface DataHealthWidgetProps {
  score: number;
  gateStatus: string;
  lastSync: string | null;
  gapsCount: number;
  onFixGaps: () => void;
}

export default function DataHealthWidget({
  score,
  gateStatus,
  lastSync,
  gapsCount,
  onFixGaps,
}: DataHealthWidgetProps) {
  const safeScore = score ?? 0;
  const safeGateStatus = gateStatus ?? 'A';
  
  const getScoreColor = () => {
    if (safeScore >= 85) return 'text-green-400';
    if (safeScore >= 70) return 'text-cyan-400';
    if (safeScore >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGateColor = () => {
    switch (safeGateStatus) {
      case 'C':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'B':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getGateDescription = () => {
    switch (safeGateStatus) {
      case 'C':
        return 'Максимальная точность';
      case 'B':
        return 'Рекомендуемый минимум';
      default:
        return 'Минимальный уровень';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Нет данных';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Нет данных';
    }
  };

  // Calculate stroke dasharray for circular progress
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-effect rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-cyan-400" />
        <h3 className="font-semibold">Data Health</h3>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular Score */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="#2A3058"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="48"
              cy="48"
              r="40"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                strokeDasharray: circumference,
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00D4FF" />
                <stop offset="100%" stopColor="#00FF88" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${getScoreColor()}`}>
              {safeScore}
            </span>
            <span className="text-xs text-gray-400">Score</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div>
            <span className="text-xs text-gray-400 block mb-1">Gate Status</span>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${getGateColor()}`}
            >
              {safeGateStatus === 'C' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <span className="font-semibold">Gate {safeGateStatus}</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {getGateDescription()}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>Обновлено: {formatDate(lastSync)}</span>
          </div>
        </div>
      </div>

      {(gapsCount ?? 0) > 0 && (
        <button
          onClick={onFixGaps}
          className="w-full mt-4 py-2 text-sm font-medium text-cyan-400 bg-cyan-400/10 rounded-lg hover:bg-cyan-400/20 transition-colors flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Исправить {gapsCount ?? 0} проблем
        </button>
      )}
    </motion.div>
  );
}
