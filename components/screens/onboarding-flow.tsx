'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Globe,
  Target,
  Plug,
  Code,
  ShoppingCart,
  Check,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Link as LinkIcon,
  Users,
  DollarSign,
  TrendingUp,
  Zap,
  Database,
  BarChart3,
} from 'lucide-react';
import Image from 'next/image';

interface OnboardingFlowProps {
  userId: string;
  existingCompany: any;
}

const STEPS = [
  { id: 'company', title: 'Компания', icon: Building2 },
  { id: 'data-sources', title: 'Источники', icon: Database },
  { id: 'integrations', title: 'Интеграции', icon: Plug },
  { id: 'goals', title: 'Цели', icon: Target },
  { id: 'sales-mapping', title: 'Продажи', icon: ShoppingCart },
  { id: 'complete', title: 'Готово', icon: Check },
];

const LEGAL_FORMS = [
  { value: 'TOO', label: 'ТОО' },
  { value: 'IP', label: 'ИП' },
  { value: 'OOO', label: 'ООО' },
  { value: 'SELF_EMPLOYED', label: 'Самозанятый' },
  { value: 'OTHER', label: 'Другое' },
];

const SALES_MODELS = [
  { value: 'ECOMMERCE', label: 'E-commerce', icon: ShoppingCart, description: 'Интернет-магазин' },
  { value: 'LEADGEN', label: 'Лидогенерация', icon: Users, description: 'Услуги и B2B' },
  { value: 'SUBSCRIPTION', label: 'Подписка/SaaS', icon: Zap, description: 'Регулярные платежи' },
  { value: 'HYBRID', label: 'Гибрид', icon: Globe, description: 'Офлайн + онлайн' },
];

const INDUSTRIES = [
  'SaaS', 'E-commerce', 'Fintech', 'Healthcare', 'Education',
  'Real Estate', 'Retail', 'Manufacturing', 'Consulting', 'Marketing',
  'IT Services', 'Hospitality', 'Logistics', 'Media', 'Другое',
];

const BUSINESS_GOALS = [
  { value: 'REVENUE_GROWTH', label: 'Рост выручки', icon: TrendingUp },
  { value: 'PROFIT_GROWTH', label: 'Рост прибыли', icon: DollarSign },
  { value: 'MARKET_SHARE', label: 'Увеличение доли рынка', icon: Globe },
  { value: 'INVESTMENT', label: 'Привлечение инвестиций', icon: Briefcase },
  { value: 'NEW_MARKET', label: 'Выход на новый рынок', icon: MapPin },
];

const INTEGRATIONS = [
  { type: 'GRAVORA_TAG', name: 'Gravora Tag', description: 'Трекинг сайта', icon: Code, recommended: true },
  { type: 'GA4', name: 'Google Analytics 4', description: 'Аналитика трафика', icon: BarChart3, recommended: false },
  { type: 'BITRIX24', name: 'Bitrix24', description: 'CRM система', icon: Users, recommended: true },
  { type: 'AMOCRM', name: 'AmoCRM', description: 'CRM система', icon: Users, recommended: false },
  { type: 'GOOGLE_ADS', name: 'Google Ads', description: 'Реклама', icon: Zap, recommended: false },
  { type: 'META_ADS', name: 'Meta Ads', description: 'Facebook/Instagram', icon: Zap, recommended: false },
];

const SALE_EVENTS = [
  { value: 'purchase', label: 'purchase', description: 'Событие покупки (Tag/GA4)' },
  { value: 'paid_invoice', label: 'paid_invoice', description: 'Оплаченный счёт (CRM)' },
  { value: 'deal_won', label: 'deal_won', description: 'Успешная сделка (CRM)' },
  { value: 'order_paid', label: 'order_paid', description: 'Оплаченный заказ (E-commerce)' },
];

export default function OnboardingFlow({ userId, existingCompany }: OnboardingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(existingCompany?.id ?? null);

  // Company form state
  const [companyData, setCompanyData] = useState({
    name: existingCompany?.name ?? '',
    legalForm: existingCompany?.legalForm ?? '',
    country: existingCompany?.country ?? '',
    city: existingCompany?.city ?? '',
    industry: existingCompany?.industry ?? '',
    salesModel: existingCompany?.salesModel ?? '',
    website: existingCompany?.website ?? '',
    email: existingCompany?.email ?? '',
    phone: existingCompany?.phone ?? '',
  });

  // Data sources selection
  const [selectedIntegrations, setSelectedIntegrations] = useState<string[]>([]);
  const [dataSourceMode, setDataSourceMode] = useState<'live' | 'import' | null>(null);

  // Business goals state
  const [goals, setGoals] = useState<string[]>(
    existingCompany?.businessContext?.goals ?? []
  );
  const [budgetMin, setBudgetMin] = useState<string>(
    existingCompany?.businessContext?.budgetMin?.toString() ?? ''
  );
  const [budgetMax, setBudgetMax] = useState<string>(
    existingCompany?.businessContext?.budgetMax?.toString() ?? ''
  );
  const [teamSize, setTeamSize] = useState<string>(
    existingCompany?.businessContext?.teamSize?.toString() ?? ''
  );

  // Sales mapping state
  const [saleEventType, setSaleEventType] = useState<string>(
    existingCompany?.businessContext?.saleEventType ?? ''
  );

  const calculateCompletion = () => {
    let filled = 0;
    let total = 5;
    if (companyData.name) filled++;
    if (companyData.legalForm) filled++;
    if (companyData.industry) filled++;
    if (companyData.salesModel) filled++;
    if (companyData.country) filled++;
    return Math.round((filled / total) * 100);
  };

  const handleSaveCompany = async () => {
    setIsLoading(true);
    try {
      const method = companyId ? 'PUT' : 'POST';
      const url = companyId ? `/api/company/${companyId}` : '/api/company';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...companyData,
          completionPercent: calculateCompletion(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCompanyId(data?.company_id ?? data?.id);
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      console.error('Error saving company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIntegrations = async () => {
    setIsLoading(true);
    try {
      if (companyId) {
        await fetch(`/api/company/${companyId}/integrations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ integrations: selectedIntegrations }),
        });
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error saving integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGoals = async () => {
    setIsLoading(true);
    try {
      if (companyId) {
        await fetch(`/api/company/${companyId}/context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goals,
            budgetMin: budgetMin ? parseFloat(budgetMin) : null,
            budgetMax: budgetMax ? parseFloat(budgetMax) : null,
            teamSize: teamSize ? parseInt(teamSize) : null,
          }),
        });
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error saving goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSaleMapping = async () => {
    setIsLoading(true);
    try {
      if (companyId) {
        await fetch(`/api/company/${companyId}/sale-mapping`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ saleEventType }),
        });
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error saving sale mapping:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      if (companyId) {
        await fetch(`/api/company/${companyId}/activate`, {
          method: 'POST',
        });
      }
      router.replace('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g) => g !== goal));
    } else if ((goals?.length ?? 0) < 3) {
      setGoals([...goals, goal]);
    }
  };

  const toggleIntegration = (type: string) => {
    if (selectedIntegrations.includes(type)) {
      setSelectedIntegrations(selectedIntegrations.filter((i) => i !== type));
    } else {
      setSelectedIntegrations([...selectedIntegrations, type]);
    }
  };

  const renderStepContent = () => {
    switch (STEPS[currentStep]?.id) {
      case 'company':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Создание карточки бизнеса</h2>
              <p className="text-gray-400">Заполните информацию о вашей компании</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">
                  Название компании *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={companyData.name}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, name: e.target.value })
                    }
                    className="w-full pl-12"
                    placeholder="Название вашей компании"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">ОПФ *</label>
                <select
                  value={companyData.legalForm}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, legalForm: e.target.value })
                  }
                  className="w-full"
                >
                  <option value="">Выберите форму</option>
                  {LEGAL_FORMS.map((form) => (
                    <option key={form.value} value={form.value}>
                      {form.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Ниша *</label>
                <select
                  value={companyData.industry}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, industry: e.target.value })
                  }
                  className="w-full"
                >
                  <option value="">Выберите нишу</option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Страна</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={companyData.country}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, country: e.target.value })
                    }
                    className="w-full pl-12"
                    placeholder="Казахстан"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Город</label>
                <input
                  type="text"
                  value={companyData.city}
                  onChange={(e) =>
                    setCompanyData({ ...companyData, city: e.target.value })
                  }
                  className="w-full"
                  placeholder="Алматы"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Сайт</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    value={companyData.website}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, website: e.target.value })
                    }
                    className="w-full pl-12"
                    placeholder="https://"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={companyData.email}
                    onChange={(e) =>
                      setCompanyData({ ...companyData, email: e.target.value })
                    }
                    className="w-full pl-12"
                    placeholder="company@example.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-3">Модель продаж *</label>
              <div className="grid grid-cols-2 gap-3">
                {SALES_MODELS.map((model) => (
                  <button
                    key={model.value}
                    type="button"
                    onClick={() =>
                      setCompanyData({ ...companyData, salesModel: model.value })
                    }
                    className={`p-4 rounded-xl border transition-all text-left ${
                      companyData.salesModel === model.value
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-[#2A3058] hover:border-gray-500'
                    }`}
                  >
                    <model.icon className="w-6 h-6 text-cyan-400 mb-2" />
                    <div className="font-medium">{model.label}</div>
                    <div className="text-xs text-gray-400">{model.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="flex-1 bg-[#2A3058] rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-2 rounded-full transition-all"
                  style={{ width: `${calculateCompletion()}%` }}
                />
              </div>
              <span>{calculateCompletion()}% заполнено</span>
            </div>
          </motion.div>
        );

      case 'data-sources':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Выбор источников данных</h2>
              <p className="text-gray-400">Как вы хотите собирать данные?</p>
            </div>

            <div className="grid gap-4">
              <button
                type="button"
                onClick={() => setDataSourceMode('live')}
                className={`p-6 rounded-xl border transition-all text-left ${
                  dataSourceMode === 'live'
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-[#2A3058] hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-lg">Живые источники</span>
                      <span className="bg-cyan-400/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full">
                        Рекомендуется
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Gravora Tag, CRM, Google Analytics, рекламные кабинеты.
                      Real-time данные для максимальной точности.
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDataSourceMode('import')}
                className={`p-6 rounded-xl border transition-all text-left ${
                  dataSourceMode === 'import'
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-[#2A3058] hover:border-gray-500'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#2A3058] flex items-center justify-center">
                    <Database className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-1">Импорт истории</div>
                    <p className="text-gray-400 text-sm">
                      Excel, Google Sheets. Быстрый старт с историческими данными.
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </motion.div>
        );

      case 'integrations':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Подключение интеграций</h2>
              <p className="text-gray-400">Выберите источники данных для подключения</p>
            </div>

            <div className="grid gap-3">
              {INTEGRATIONS.map((integration) => (
                <button
                  key={integration.type}
                  type="button"
                  onClick={() => toggleIntegration(integration.type)}
                  className={`p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${
                    selectedIntegrations.includes(integration.type)
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-[#2A3058] hover:border-gray-500'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      selectedIntegrations.includes(integration.type)
                        ? 'bg-cyan-400/20'
                        : 'bg-[#2A3058]'
                    }`}
                  >
                    <integration.icon
                      className={`w-5 h-5 ${
                        selectedIntegrations.includes(integration.type)
                          ? 'text-cyan-400'
                          : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{integration.name}</span>
                      {integration.recommended && (
                        <span className="bg-green-400/20 text-green-400 text-xs px-2 py-0.5 rounded-full">
                          Рекомендуется
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">{integration.description}</div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedIntegrations.includes(integration.type)
                        ? 'border-cyan-400 bg-cyan-400'
                        : 'border-gray-500'
                    }`}
                  >
                    {selectedIntegrations.includes(integration.type) && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-400 text-center">
              Выбрано {selectedIntegrations?.length ?? 0} интеграций. Вы сможете добавить ещё позже.
            </p>
          </motion.div>
        );

      case 'goals':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Цели и ограничения</h2>
              <p className="text-gray-400">Укажите бизнес-цели (макс. 3)</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-3">Выберите цели</label>
                <div className="grid gap-3">
                  {BUSINESS_GOALS.map((goal) => (
                    <button
                      key={goal.value}
                      type="button"
                      onClick={() => toggleGoal(goal.value)}
                      disabled={
                        !goals.includes(goal.value) && (goals?.length ?? 0) >= 3
                      }
                      className={`p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${
                        goals.includes(goal.value)
                          ? 'border-cyan-400 bg-cyan-400/10'
                          : 'border-[#2A3058] hover:border-gray-500'
                      } ${
                        !goals.includes(goal.value) && (goals?.length ?? 0) >= 3
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      <goal.icon
                        className={`w-6 h-6 ${
                          goals.includes(goal.value)
                            ? 'text-cyan-400'
                            : 'text-gray-400'
                        }`}
                      />
                      <span className="font-medium">{goal.label}</span>
                      <div className="ml-auto">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            goals.includes(goal.value)
                              ? 'border-cyan-400 bg-cyan-400'
                              : 'border-gray-500'
                          }`}
                        >
                          {goals.includes(goal.value) && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Бюджет от ($/мес)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      className="w-full pl-12"
                      placeholder="1,000"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Бюджет до ($/мес)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className="w-full pl-12"
                      placeholder="10,000"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Размер команды
                </label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full pl-12"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'sales-mapping':
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Что считать продажей?</h2>
              <p className="text-gray-400">
                Выберите событие, которое означает успешную продажу
              </p>
            </div>

            <div className="grid gap-3">
              {SALE_EVENTS.map((event) => (
                <button
                  key={event.value}
                  type="button"
                  onClick={() => setSaleEventType(event.value)}
                  className={`p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${
                    saleEventType === event.value
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-[#2A3058] hover:border-gray-500'
                  }`}
                >
                  <code
                    className={`px-3 py-1 rounded-lg font-mono text-sm ${
                      saleEventType === event.value
                        ? 'bg-cyan-400/20 text-cyan-400'
                        : 'bg-[#2A3058] text-gray-400'
                    }`}
                  >
                    {event.label}
                  </code>
                  <span className="text-gray-400">{event.description}</span>
                  <div className="ml-auto">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        saleEventType === event.value
                          ? 'border-cyan-400 bg-cyan-400'
                          : 'border-gray-500'
                      }`}
                    >
                      {saleEventType === event.value && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Настройка завершена!</h2>
            <p className="text-gray-400 mb-8">
              Ваша компания готова к диагностике.
              <br />
              Перейдите на дашборд для просмотра метрик.
            </p>
            <div className="glass-effect rounded-xl p-6 text-left max-w-md mx-auto mb-8">
              <h3 className="font-semibold mb-4">Что будет дальше:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-400 text-xs font-bold">1</span>
                  </div>
                  <span className="text-gray-300">Сбор данных из подключенных источников</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-400 text-xs font-bold">2</span>
                  </div>
                  <span className="text-gray-300">Расчёт ключевых метрик (Formula Engine)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-400 text-xs font-bold">3</span>
                  </div>
                  <span className="text-gray-300">Анализ качества данных (ИИ Data Auditor)</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-cyan-400 text-xs font-bold">4</span>
                  </div>
                  <span className="text-gray-300">Выявление узких мест (ИИ Analyst)</span>
                </li>
              </ul>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (STEPS[currentStep]?.id) {
      case 'company':
        return (
          companyData.name &&
          companyData.legalForm &&
          companyData.industry &&
          companyData.salesModel
        );
      case 'data-sources':
        return dataSourceMode !== null;
      case 'integrations':
        return true; // Optional step
      case 'goals':
        return (goals?.length ?? 0) > 0;
      case 'sales-mapping':
        return saleEventType !== '';
      default:
        return true;
    }
  };

  const handleNext = async () => {
    switch (STEPS[currentStep]?.id) {
      case 'company':
        await handleSaveCompany();
        break;
      case 'data-sources':
        setCurrentStep(currentStep + 1);
        break;
      case 'integrations':
        await handleSaveIntegrations();
        break;
      case 'goals':
        await handleSaveGoals();
        break;
      case 'sales-mapping':
        await handleSaveSaleMapping();
        break;
      case 'complete':
        await handleComplete();
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/gravora-bg.png"
          alt=""
          fill
          className="object-cover opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1321]/90 via-[#0D1321]/80 to-[#0D1321]/95" />
      </div>
      {/* Header */}
      <header className="glass-effect relative z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/gravora-logo.jpg" 
              alt="GRAVORA" 
              width={160} 
              height={40} 
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="text-sm text-gray-400">
            Этап 0: Диагностика
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="glass-effect border-b border-[#2A3058] relative z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    index < currentStep
                      ? 'bg-green-500'
                      : index === currentStep
                      ? 'bg-cyan-500'
                      : 'bg-[#2A3058]'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <step.icon
                      className={`w-4 h-4 ${
                        index === currentStep ? 'text-white' : 'text-gray-500'
                      }`}
                    />
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 transition-all ${
                      index < currentStep ? 'bg-green-500' : 'bg-[#2A3058]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-2">
            {STEPS.map((step, index) => (
              <span
                key={step.id}
                className={`text-xs ${
                  index <= currentStep ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
        <div className="w-full max-w-2xl">
          <div className="glass-effect rounded-2xl p-8 card-shadow">
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#2A3058]">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Назад
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <span className="animate-pulse">Сохранение...</span>
                ) : STEPS[currentStep]?.id === 'complete' ? (
                  <>
                    Перейти на дашборд <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Продолжить <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
