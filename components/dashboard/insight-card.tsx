'use client';

import { motion } from 'framer-motion';
import {
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Shield,
  ChevronRight,
} from 'lucide-react';

interface InsightCardProps {
  insight: {
    id?: string;
    agentType?: string;
    title?: string;
    description?: string;
    category?: string;
    priority?: number;
  };
}

export default function InsightCard({ insight }: InsightCardProps) {
  const safeInsight = insight ?? {};
  
  const getAgentIcon = () => {
    switch (safeInsight.agentType) {
      case 'DATA_AUDITOR':
        return Shield;
      case 'ANALYST':
        return TrendingUp;
      case 'STRATEGIST':
        return Lightbulb;
      default:
        return Lightbulb;
    }
  };

  const getAgentName = () => {
    switch (safeInsight.agentType) {
      case 'DATA_AUDITOR':
        return 'Data Auditor';
      case 'ANALYST':
        return 'Analyst';
      case 'STRATEGIST':
        return 'Strategist';
      default:
        return 'AI Agent';
    }
  };

  const getCategoryColor = () => {
    switch (safeInsight.category) {
      case 'bottleneck':
        return 'bg-red-500/20 text-red-400';
      case 'quick_win':
        return 'bg-green-500/20 text-green-400';
      case 'anomaly':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-cyan-500/20 text-cyan-400';
    }
  };

  const getCategoryLabel = () => {
    switch (safeInsight.category) {
      case 'bottleneck':
        return 'Узкое место';
      case 'quick_win':
        return 'Quick Win';
      case 'anomaly':
        return 'Аномалия';
      default:
        return 'Рекомендация';
    }
  };

  const Icon = getAgentIcon();

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#1E2342]/50 rounded-lg p-4 hover:bg-[#1E2342] transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400/20 to-orange-400/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-yellow-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-400">{getAgentName()}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor()}`}
            >
              {getCategoryLabel()}
            </span>
          </div>
          <h4 className="font-medium text-sm mb-1 truncate">
            {safeInsight.title ?? 'Инсайт'}
          </h4>
          <p className="text-xs text-gray-400 line-clamp-2">
            {safeInsight.description ?? ''}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
      </div>
    </motion.div>
  );
}
