'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface ChannelData {
  channelName: string;
  channelType?: string;
  sessions?: number;
  clicks?: number;
  impressions?: number;
  leads?: number;
  sales?: number;
  revenue?: number;
  adSpend?: number;
  cpc?: number;
  cpl?: number;
  cps?: number;
  cr?: number;
  roas?: number;
  shareOfTraffic?: number;
}

interface ChannelChartProps {
  channelData?: ChannelData[];
  currency?: string;
}

const COLORS = ['#00D4FF', '#00FF88', '#FF9149', '#A19AD3', '#60B5FF', '#FF6B9D', '#FFD93D', '#6BCB77', '#C9B1FF', '#FF8E72'];

const DEMO_DATA = [
  { name: 'Google CPC', value: 45, sessions: 4500, adSpend: 15000, leads: 225, cpc: 3.33, cpl: 66.67 },
  { name: 'Organic', value: 25, sessions: 2500, adSpend: 0, leads: 125, cpc: 0, cpl: 0 },
  { name: 'Direct', value: 15, sessions: 1500, adSpend: 0, leads: 60, cpc: 0, cpl: 0 },
  { name: 'Social', value: 10, sessions: 1000, adSpend: 5000, leads: 50, cpc: 5, cpl: 100 },
  { name: 'Email', value: 5, sessions: 500, adSpend: 1000, leads: 40, cpc: 2, cpl: 25 },
];

export default function ChannelChart({ channelData = [], currency = '$' }: ChannelChartProps) {
  // Use real data if available, otherwise use demo data
  const hasRealData = channelData.length > 0;
  
  const chartData = hasRealData 
    ? channelData.map((ch, i) => ({
        name: ch.channelName,
        value: ch.shareOfTraffic ?? 0,
        sessions: ch.sessions ?? 0,
        adSpend: ch.adSpend ?? 0,
        leads: ch.leads ?? 0,
        cpc: ch.cpc ?? 0,
        cpl: ch.cpl ?? 0,
        roas: ch.roas ?? 0,
      }))
    : DEMO_DATA;

  const totalSessions = chartData.reduce((sum, ch) => sum + (ch.sessions || 0), 0);
  const totalAdSpend = chartData.reduce((sum, ch) => sum + (ch.adSpend || 0), 0);

  return (
    <div className="space-y-4">
      {/* Pie Chart for Traffic Share */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={55}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E2342',
                border: '1px solid #2A3058',
                borderRadius: '8px',
                fontSize: 11,
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value.toFixed(1)}%`,
                'Доля трафика'
              ]}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: 10 }}
              formatter={(value) => <span className="text-gray-300">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Table */}
      {hasRealData && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="text-left p-2">Канал</th>
                <th className="text-right p-2">Сессии</th>
                <th className="text-right p-2">Лиды</th>
                <th className="text-right p-2">Расход</th>
                <th className="text-right p-2">CPC</th>
                <th className="text-right p-2">CPL</th>
              </tr>
            </thead>
            <tbody>
              {chartData.slice(0, 5).map((ch, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="p-2 flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-white">{ch.name}</span>
                  </td>
                  <td className="p-2 text-right text-gray-300">{ch.sessions?.toLocaleString()}</td>
                  <td className="p-2 text-right text-gray-300">{ch.leads?.toLocaleString() || '-'}</td>
                  <td className="p-2 text-right text-gray-300">{currency}{ch.adSpend?.toLocaleString()}</td>
                  <td className="p-2 text-right text-cyan-400">{currency}{ch.cpc?.toFixed(2)}</td>
                  <td className="p-2 text-right text-green-400">{ch.cpl ? `${currency}${ch.cpl.toFixed(0)}` : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#00D4FF] bg-[#00D4FF]/5">
                <td className="p-2 text-[#00D4FF] font-bold">ИТОГО</td>
                <td className="p-2 text-right text-white font-semibold">{totalSessions.toLocaleString()}</td>
                <td className="p-2 text-right text-white font-semibold">
                  {chartData.reduce((sum, ch) => sum + (ch.leads || 0), 0).toLocaleString() || '-'}
                </td>
                <td className="p-2 text-right text-white font-semibold">{currency}{totalAdSpend.toLocaleString()}</td>
                <td className="p-2 text-right text-cyan-400">
                  {totalSessions > 0 ? `${currency}${(totalAdSpend / totalSessions).toFixed(2)}` : '-'}
                </td>
                <td className="p-2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      
      {!hasRealData && (
        <div className="text-center text-xs text-gray-500 py-2">
          Демо-данные • <span className="text-cyan-400">Внесите данные каналов</span>
        </div>
      )}
    </div>
  );
}
