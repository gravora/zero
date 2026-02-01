'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Target, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function WelcomeScreen() {
  const features = [
    {
      icon: Target,
      title: 'Стратегический интеллект',
      description: 'ИИ думает и действует быстрее любой команды',
    },
    {
      icon: Target,
      title: 'Гибридная система',
      description: 'Объединение ИИ-агентов и сотрудников',
    },
    {
      icon: TrendingUp,
      title: 'Рабочий процесс',
      description: 'Стратегия как действие, а не документ',
    },
    {
      icon: Zap,
      title: 'Быстрый запуск',
      description: 'Стратегия за 48 часов',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/gravora-bg.png"
          alt=""
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1321]/80 via-[#0D1321]/60 to-[#0D1321]/90" />
      </div>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect sticky top-0 z-50 relative"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/gravora-logo.jpg" 
              alt="GRAVORA" 
              width={160} 
              height={40} 
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="btn-primary flex items-center gap-2"
            >
              Войти / Начать <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="mb-6">
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
              Strategic Intelligence Platform
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Сила <span className="gradient-text">стратегического</span>
            <br />
            мышления
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            ИИ-платформа, которая помогает сформировать и реализовать
            стратегию роста через гибридную систему: ИИ-агенты + сотрудники
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login" className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
              Начать бесплатно <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto"
        >
          {[
            { value: '60%', label: 'Сокращение пути' },
            { value: '50%', label: 'Снижение потерь' },
            { value: '48ч', label: 'Быстрый запуск' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-6xl mx-auto w-full"
        >
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="glass-effect rounded-xl p-6 hover-glow transition-all cursor-pointer"
            >
              <feature.icon className="w-10 h-10 text-cyan-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="glass-effect mt-auto relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Image src="/gravora-logo.jpg" alt="GRAVORA" width={80} height={20} className="h-5 w-auto" />
            <span>© 2026 Все права защищены.</span>
          </div>
          <div className="text-gray-400 text-sm">
            GARAYEVA methodology
          </div>
        </div>
      </footer>
    </div>
  );
}
