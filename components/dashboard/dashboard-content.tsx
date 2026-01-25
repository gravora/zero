'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Plug,
  Settings,
  LogOut,
  Bell,
  ChevronRight,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Target,
  Zap,
  Activity,
  RefreshCw,
  X,
  ArrowRight,
  FileEdit,
  Megaphone,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import MetricCard from './metric-card';
import FunnelChart from './funnel-chart';
import DataHealthWidget from './data-health-widget';
import InsightCard from './insight-card';
import RevenueChart from './revenue-chart';
import ChannelChart from './channel-chart';
import DataGapModal from './data-gap-modal';
import ContinueToStrategyModal from './continue-strategy-modal';
import MarketingFunnel from './marketing-funnel';
import SalesFunnel from './sales-funnel';
import KeyMetricsPanel from './key-metrics-panel';

interface DashboardContentProps {
  company: any;
  snapshot: any;
  manualSnapshot?: any;
  channelSnapshots?: any[];
  dataGaps: any[];
  insights: any[];
  dailyMetrics: any[];
  user: any;
}

export default function DashboardContent({
  company,
  snapshot,
  manualSnapshot,
  channelSnapshots = [],
  dataGaps,
  insights,
  dailyMetrics,
  user,
}: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDataGapModal, setShowDataGapModal] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const safeSnapshot = snapshot ?? {
    sessions: 0,
    users: 0,
    leads: 0,
    deals: 0,
    sales: 0,
    repeatSales: 0,
    revenue: 0,
    orders: 0,
    aov: 0,
    adSpend: 0,
    clicks: 0,
    impressions: 0,
    crVisitLead: 0,
    crLeadDeal: 0,
    crDealSale: 0,
    roas: 0,
    cpa: 0,
    cpl: 0,
    dataQualityScore: 0,
    gateStatus: 'A',
    sources: [],
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    return `$${formatNumber(num)}`;
  };

  const formatPercent = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    return `${num.toFixed(1)}%`;
  };

  const navItems = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'manual-input', label: 'Ручной ввод', icon: FileEdit, href: '/manual-input' },
    { id: 'integrations', label: 'Интеграции', icon: Plug },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 glass-effect border-r border-[#2A3058] min-h-screen">
        {/* Logo */}
        <div className="p-6 border-b border-[#2A3058]">
          <div className="flex items-center gap-3">
            <Image 
              src="/gravora-logo.jpg" 
              alt="GRAVORA" 
              width={140} 
              height={35} 
              className="h-9 w-auto object-contain"
            />
          </div>
          <div className="text-xs text-gray-400 mt-2">Этап 0: Диагностика</div>
        </div>

        {/* Company */}
        <div className="p-4 border-b border-[#2A3058]">
          <div className="glass-effect rounded-lg p-3">
            <div className="text-sm font-medium truncate">{company?.name ?? 'Компания'}</div>
            <div className="text-xs text-gray-400">{company?.industry ?? 'Отрасль'}</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-400 hover:text-white hover:bg-[#2A3058]/50`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === item.id
                        ? 'bg-cyan-400/10 text-cyan-400'
                        : 'text-gray-400 hover:text-white hover:bg-[#2A3058]/50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-[#2A3058]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt?.(0)?.toUpperCase?.() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name ?? 'Пользователь'}</div>
              <div className="text-xs text-gray-400 truncate">{user?.email ?? ''}</div>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors px-2 py-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Выйти</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden glass-effect border-b border-[#2A3058] sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Image 
              src="/gravora-logo.jpg" 
              alt="GRAVORA" 
              width={120} 
              height={30} 
              className="h-8 w-auto object-contain"
            />
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Activity className="w-6 h-6" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-[#2A3058]"
            >
              <nav className="p-4">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400"
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                            activeTab === item.id
                              ? 'bg-cyan-400/10 text-cyan-400'
                              : 'text-gray-400'
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      )}
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Выйти</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold">
                    Дашборд <span className="gradient-text">{company?.name ?? ''}</span>
                  </h1>
                  <p className="text-gray-400 mt-1">
                    Диагностика и первичный сбор данных
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Link
                    href="/manual-input"
                    className="btn-secondary flex items-center gap-2 text-sm"
                  >
                    <FileEdit className="w-4 h-4" />
                    Ручной ввод
                  </Link>
                  <button className="btn-secondary flex items-center gap-2 text-sm">
                    <RefreshCw className="w-4 h-4" />
                    Обновить
                  </button>
                  <button
                    onClick={() => setShowStrategyModal(true)}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    К стратегии
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Data Health & Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DataHealthWidget
                  score={safeSnapshot.dataQualityScore ?? 0}
                  gateStatus={safeSnapshot.gateStatus ?? 'A'}
                  lastSync={snapshot?.createdAt ?? null}
                  gapsCount={(dataGaps?.length ?? 0)}
                  onFixGaps={() => setShowDataGapModal(true)}
                />

                <div className="lg:col-span-2">
                  <div className="glass-effect rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Инсайты ИИ
                      </h3>
                      <span className="text-sm text-gray-400">
                        {insights?.length ?? 0} новых
                      </span>
                    </div>
                    <div className="space-y-3">
                      {(insights ?? []).slice(0, 3).map((insight: any, i: number) => (
                        <InsightCard key={insight?.id ?? i} insight={insight} />
                      ))}
                      {(insights?.length ?? 0) === 0 && (
                        <div className="text-gray-400 text-center py-4">
                          Нет новых инсайтов
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <KeyMetricsPanel snapshot={safeSnapshot} currency={safeSnapshot.currency === 'KZT' ? '₸' : safeSnapshot.currency === 'RUB' ? '₽' : '$'} />

              {/* Marketing & Sales Funnels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Marketing Funnel */}
                <div className="glass-effect rounded-xl p-5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-purple-400" />
                    Воронка маркетинга
                  </h3>
                  <MarketingFunnel snapshot={safeSnapshot} currency={safeSnapshot.currency === 'KZT' ? '₸' : safeSnapshot.currency === 'RUB' ? '₽' : '$'} />
                </div>

                {/* Sales Funnel */}
                <div className="glass-effect rounded-xl p-5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-400" />
                    Воронка продаж
                  </h3>
                  <SalesFunnel snapshot={safeSnapshot} currency={safeSnapshot.currency === 'KZT' ? '₸' : safeSnapshot.currency === 'RUB' ? '₽' : '$'} />
                </div>
              </div>

              {/* Traffic Channels */}
              <div className="glass-effect rounded-xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Каналы трафика
                </h3>
                <ChannelChart 
                  channelData={channelSnapshots} 
                  currency={safeSnapshot.currency === 'KZT' ? '₸' : safeSnapshot.currency === 'RUB' ? '₽' : '$'} 
                />
              </div>

              {/* Sales & Marketing */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales */}
                <div className="glass-effect rounded-xl p-5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Продажи и чек
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <MetricCard
                      title="Revenue"
                      value={formatCurrency(safeSnapshot.revenue)}
                      change={15.3}
                      icon={DollarSign}
                      highlight
                    />
                    <MetricCard
                      title="Orders"
                      value={formatNumber(safeSnapshot.orders)}
                      change={10.1}
                      icon={ShoppingCart}
                    />
                    <MetricCard
                      title="AOV"
                      value={formatCurrency(safeSnapshot.aov)}
                      change={4.8}
                      icon={TrendingUp}
                    />
                  </div>
                  <RevenueChart dailyMetrics={dailyMetrics} />
                </div>

                {/* Marketing */}
                <div className="glass-effect rounded-xl p-5">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Маркетинг
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <MetricCard
                      title="Ad Spend"
                      value={formatCurrency(safeSnapshot.adSpend)}
                      change={-5.2}
                      icon={DollarSign}
                    />
                    <MetricCard
                      title="ROAS"
                      value={safeSnapshot.roas ? `${safeSnapshot.roas?.toFixed?.(1)}x` : 'N/A'}
                      change={safeSnapshot.roas ? 8.5 : null}
                      icon={TrendingUp}
                      highlight={safeSnapshot.roas >= 3}
                    />
                    <MetricCard
                      title="CPA"
                      value={formatCurrency(safeSnapshot.cpa)}
                      change={-12.3}
                      icon={Target}
                      invertChange
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">CPL</span>
                      <span className="font-medium">{formatCurrency(safeSnapshot.cpl)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Clicks</span>
                      <span className="font-medium">{formatNumber(safeSnapshot.clicks)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Impressions</span>
                      <span className="font-medium">{formatNumber(safeSnapshot.impressions)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">CTR</span>
                      <span className="font-medium">
                        {safeSnapshot.impressions > 0
                          ? `${((safeSnapshot.clicks / safeSnapshot.impressions) * 100).toFixed(2)}%`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Gaps Alert */}
              {(dataGaps?.length ?? 0) > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-effect rounded-xl p-5 border border-yellow-500/30 bg-yellow-500/5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-400 mb-1">
                        Обнаружены пробелы в данных
                      </h3>
                      <p className="text-gray-400 text-sm mb-3">
                        {dataGaps?.length ?? 0} проблем требуют внимания для повышения точности стратегии
                      </p>
                      <button
                        onClick={() => setShowDataGapModal(true)}
                        className="text-cyan-400 text-sm font-medium flex items-center gap-1 hover:underline"
                      >
                        Исправить <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h1 className="text-2xl font-bold">Интеграции</h1>
              <div className="grid gap-4">
                {(company?.integrations ?? []).map((integration: any) => (
                  <div
                    key={integration?.id}
                    className="glass-effect rounded-xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#2A3058] flex items-center justify-center">
                        <Plug className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <div className="font-medium">{integration?.name ?? 'Integration'}</div>
                        <div className="text-sm text-gray-400">{integration?.type ?? ''}</div>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-sm ${
                        integration?.status === 'CONNECTED'
                          ? 'bg-green-500/20 text-green-400'
                          : integration?.status === 'PENDING'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {integration?.status === 'CONNECTED'
                        ? 'Подключено'
                        : integration?.status === 'PENDING'
                        ? 'Ожидает'
                        : 'Ошибка'}
                    </div>
                  </div>
                ))}
                {(company?.integrations?.length ?? 0) === 0 && (
                  <div className="glass-effect rounded-xl p-8 text-center">
                    <Plug className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Нет подключенных интеграций</h3>
                    <p className="text-gray-400 text-sm">
                      Подключите источники данных для получения метрик
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h1 className="text-2xl font-bold">Настройки</h1>
              <div className="glass-effect rounded-xl p-6">
                <h3 className="font-semibold mb-4">Профиль компании</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-[#2A3058]">
                    <span className="text-gray-400">Название</span>
                    <span>{company?.name ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#2A3058]">
                    <span className="text-gray-400">Отрасль</span>
                    <span>{company?.industry ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#2A3058]">
                    <span className="text-gray-400">Модель продаж</span>
                    <span>{company?.salesModel ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[#2A3058]">
                    <span className="text-gray-400">Страна</span>
                    <span>{company?.country ?? '-'}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-400">Сайт</span>
                    <span>{company?.website ?? '-'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showDataGapModal && (
          <DataGapModal
            dataGaps={dataGaps}
            onClose={() => setShowDataGapModal(false)}
          />
        )}
        {showStrategyModal && (
          <ContinueToStrategyModal
            snapshot={safeSnapshot}
            dataGaps={dataGaps}
            onClose={() => setShowStrategyModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
