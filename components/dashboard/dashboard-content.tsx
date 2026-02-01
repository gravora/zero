'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Plug,
  Settings,
  LogOut,
  Lightbulb,
  Target,
  Zap,
  Activity,
  RefreshCw,
  X,
  ArrowRight,
  FileEdit,
  Megaphone,
  Play,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { UserOut, AIInsightsResponse, AIOrchestrateResponse } from '@/lib/gravora-api';

interface DashboardContentProps {
  user: UserOut | null;
  companyId: string | null;
  insights: AIInsightsResponse | null;
  orchestrateStatus: 'idle' | 'running' | 'completed' | 'error';
  orchestrateResult: AIOrchestrateResponse | null;
  error: string | null;
  onRunOrchestrate: (message?: string) => Promise<AIOrchestrateResponse | undefined>;
  onBuildSnapshot: () => Promise<any>;
  onLogout: () => void;
}

export default function DashboardContent({
  user,
  companyId,
  insights,
  orchestrateStatus,
  orchestrateResult,
  error,
  onRunOrchestrate,
  onBuildSnapshot,
  onLogout,
}: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard },
    { id: 'manual-input', label: 'Ручной ввод', icon: FileEdit, href: '/manual-input' },
    { id: 'integrations', label: 'Интеграции', icon: Plug },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  // Parse insights payload
  const insightsPayload = insights?.payload ?? {};
  const hasInsights = insights?.status === 'ok' && insightsPayload && Object.keys(insightsPayload).length > 0;

  // Extract metrics from insights if available
  const metrics = {
    sessions: (insightsPayload as any)?.sessions ?? 0,
    users: (insightsPayload as any)?.users ?? 0,
    leads: (insightsPayload as any)?.leads ?? 0,
    deals: (insightsPayload as any)?.deals ?? 0,
    sales: (insightsPayload as any)?.sales ?? 0,
    revenue: (insightsPayload as any)?.revenue ?? 0,
    adSpend: (insightsPayload as any)?.adSpend ?? 0,
    aov: (insightsPayload as any)?.aov ?? 0,
    roas: (insightsPayload as any)?.roas ?? 0,
    dataQualityScore: (insightsPayload as any)?.dataQualityScore ?? 0,
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '—';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (num: number | null | undefined) => {
    if (num === null || num === undefined || num === 0) return '—';
    return `$${formatNumber(num)}`;
  };

  const formatPercent = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '—';
    return `${num.toFixed(1)}%`;
  };

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
          <div className="text-xs text-gray-400 mt-2">Stage 0: Диагностика</div>
        </div>

        {/* Company */}
        <div className="p-4 border-b border-[#2A3058]">
          <div className="glass-effect rounded-lg p-3">
            <div className="text-sm font-medium truncate">Компания</div>
            <div className="text-xs text-gray-400 truncate">{companyId ? `ID: ${companyId.slice(0, 8)}...` : 'Не создана'}</div>
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
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-400 hover:text-white hover:bg-[#2A3058]/50"
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
                {user?.email?.charAt?.(0)?.toUpperCase?.() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.email ?? 'Пользователь'}</div>
              <div className="text-xs text-gray-400 truncate">{user?.role ?? ''}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
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
                      onClick={onLogout}
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
                    <span className="gradient-text">GRAVORA</span> Дашборд
                  </h1>
                  <p className="text-gray-400 mt-1">
                    Stage 0: Диагностика и первичный анализ
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
                  <button
                    onClick={() => onRunOrchestrate()}
                    disabled={orchestrateStatus === 'running'}
                    className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    {orchestrateStatus === 'running' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Анализ...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Запустить AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Orchestrate Status */}
              {orchestrateStatus === 'running' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-6 text-center"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-cyan-400">AI Оркестратор работает</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Анализируем данные и генерируем инсайты...
                  </p>
                </motion.div>
              )}

              {orchestrateStatus === 'completed' && orchestrateResult && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-green-400 font-medium">Анализ завершён</p>
                    <p className="text-gray-400 text-sm">Snapshot ID: {orchestrateResult.snapshot_id.slice(0, 8)}...</p>
                  </div>
                </motion.div>
              )}

              {/* No Data State */}
              {!hasInsights && orchestrateStatus === 'idle' && (
                <div className="glass-effect rounded-xl p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Начните с анализа</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Нажмите кнопку "Запустить AI" чтобы AI-оркестратор проанализировал ваши данные и сгенерировал инсайты.
                  </p>
                  <button
                    onClick={() => onRunOrchestrate()}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Запустить анализ
                  </button>
                </div>
              )}

              {/* Insights Section */}
              {hasInsights && (
                <>
                  {/* AI Insights */}
                  <div className="glass-effect rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Инсайты от AI
                      </h3>
                      <button
                        onClick={() => onRunOrchestrate()}
                        disabled={orchestrateStatus === 'running'}
                        className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-4 h-4 ${orchestrateStatus === 'running' ? 'animate-spin' : ''}`} />
                        Обновить
                      </button>
                    </div>
                    
                    {/* Display insights from payload */}
                    <div className="space-y-3">
                      {(insightsPayload as any)?.insights ? (
                        ((insightsPayload as any).insights as any[]).map((insight: any, i: number) => (
                          <div key={i} className="bg-[#1A1F3D]/50 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                insight.type === 'warning' ? 'bg-yellow-500/20' :
                                insight.type === 'success' ? 'bg-green-500/20' :
                                'bg-cyan-500/20'
                              }`}>
                                {insight.type === 'warning' ? (
                                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                                ) : insight.type === 'success' ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{insight.title || 'Инсайт'}</p>
                                <p className="text-sm text-gray-400 mt-1">{insight.description || insight.message}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-center py-4">
                          Данные загружены. Запустите AI анализ для генерации инсайтов.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                      title="Сессии"
                      value={formatNumber(metrics.sessions)}
                      icon={<Activity className="w-5 h-5" />}
                      color="cyan"
                    />
                    <MetricCard
                      title="Пользователи"
                      value={formatNumber(metrics.users)}
                      icon={<Users className="w-5 h-5" />}
                      color="purple"
                    />
                    <MetricCard
                      title="Лиды"
                      value={formatNumber(metrics.leads)}
                      icon={<Target className="w-5 h-5" />}
                      color="green"
                    />
                    <MetricCard
                      title="Продажи"
                      value={formatNumber(metrics.sales)}
                      icon={<ShoppingCart className="w-5 h-5" />}
                      color="yellow"
                    />
                  </div>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="glass-effect rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Выручка</p>
                          <p className="text-xl font-bold">{formatCurrency(metrics.revenue)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="glass-effect rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                          <Megaphone className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Расход на рекламу</p>
                          <p className="text-xl font-bold">{formatCurrency(metrics.adSpend)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="glass-effect rounded-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">ROAS</p>
                          <p className="text-xl font-bold">{formatPercent(metrics.roas)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Quick Actions */}
              <div className="glass-effect rounded-xl p-5">
                <h3 className="font-semibold mb-4">Быстрые действия</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/manual-input"
                    className="p-4 bg-[#1A1F3D]/50 rounded-lg hover:bg-[#2A3058]/50 transition-colors group"
                  >
                    <FileEdit className="w-6 h-6 text-cyan-400 mb-2" />
                    <h4 className="font-medium">Ввести данные вручную</h4>
                    <p className="text-sm text-gray-400 mt-1">Добавьте метрики для анализа</p>
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <button
                    onClick={() => onRunOrchestrate()}
                    disabled={orchestrateStatus === 'running'}
                    className="p-4 bg-[#1A1F3D]/50 rounded-lg hover:bg-[#2A3058]/50 transition-colors group text-left disabled:opacity-50"
                  >
                    <Zap className="w-6 h-6 text-yellow-400 mb-2" />
                    <h4 className="font-medium">Запустить AI анализ</h4>
                    <p className="text-sm text-gray-400 mt-1">Получите инсайты от AI</p>
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => setActiveTab('integrations')}
                    className="p-4 bg-[#1A1F3D]/50 rounded-lg hover:bg-[#2A3058]/50 transition-colors group text-left"
                  >
                    <Plug className="w-6 h-6 text-purple-400 mb-2" />
                    <h4 className="font-medium">Настроить интеграции</h4>
                    <p className="text-sm text-gray-400 mt-1">Подключите источники данных</p>
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Интеграции</h1>
                <p className="text-gray-400 mt-1">Подключите источники данных</p>
              </div>

              <div className="glass-effect rounded-xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Plug className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Скоро доступно</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Функционал интеграций находится в разработке. 
                  Пока вы можете использовать ручной ввод данных для тестирования AI-анализа.
                </p>
                <Link
                  href="/manual-input"
                  className="btn-primary inline-flex items-center gap-2 mt-6"
                >
                  <FileEdit className="w-5 h-5" />
                  Перейти к ручному вводу
                </Link>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold">Настройки</h1>
                <p className="text-gray-400 mt-1">Управление аккаунтом</p>
              </div>

              <div className="glass-effect rounded-xl p-6">
                <h3 className="font-semibold mb-4">Информация об аккаунте</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-[#2A3058]">
                    <span className="text-gray-400">Email</span>
                    <span className="font-medium">{user?.email ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[#2A3058]">
                    <span className="text-gray-400">Роль</span>
                    <span className="font-medium">{user?.role ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[#2A3058]">
                    <span className="text-gray-400">ID компании</span>
                    <span className="font-medium font-mono text-sm">{companyId ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-400">Статус</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm">
                      {user?.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-effect rounded-xl p-6">
                <h3 className="font-semibold mb-4 text-red-400">Опасная зона</h3>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  Выйти из аккаунта
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

// Simple Metric Card Component
function MetricCard({ title, value, icon, color }: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'cyan' | 'purple' | 'green' | 'yellow' | 'orange';
}) {
  const colors = {
    cyan: 'bg-cyan-500/20 text-cyan-400',
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    orange: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <div className="glass-effect rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
