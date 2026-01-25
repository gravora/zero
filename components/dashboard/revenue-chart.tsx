'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface RevenueChartProps {
  dailyMetrics: Array<{
    date?: string | Date;
    revenue?: number;
  }>;
}

export default function RevenueChart({ dailyMetrics }: RevenueChartProps) {
  const chartData = useMemo(() => {
    return (dailyMetrics ?? []).map((m) => {
      const date = m?.date ? new Date(m.date) : new Date();
      return {
        date: date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
        }),
        revenue: m?.revenue ?? 0,
      };
    });
  }, [dailyMetrics]);

  if ((chartData?.length ?? 0) === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
        Нет данных для графика
      </div>
    );
  }

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 10 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            width={50}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E2342',
              border: '1px solid #2A3058',
              borderRadius: '8px',
              fontSize: 11,
            }}
            labelStyle={{ color: '#9CA3AF' }}
            itemStyle={{ color: '#00D4FF' }}
            formatter={(value: number) => [`$${value?.toLocaleString?.() ?? 0}`, 'Revenue']}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#00D4FF"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
