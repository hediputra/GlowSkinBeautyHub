/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DbSchemaExplorer from './components/DbSchemaExplorer';
import WorkflowSimulator from './components/WorkflowSimulator';
import MitraPortalDemo from './components/MitraPortalDemo';
import ConsumerDemo from './components/ConsumerDemo';
import MarketingPitchDeck from './components/MarketingPitchDeck';
import QuickActionMenu from './components/QuickActionMenu';

import {
  Database,
  Layers,
  Sparkles,
  ShoppingBag,
  Users,
  Briefcase,
  TrendingUp,
  Instagram,
  FileSpreadsheet,
  Cpu,
  BookmarkCheck,
  Building,
  BellRing
} from 'lucide-react';

type AppTab = 'DATABASE' | 'WORKFLOW' | 'MITRA' | 'CONSUMER' | 'MARKETING';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('DATABASE');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const tabsConfig = [
    {
      id: 'DATABASE',
      label: 'Skema Database & Harga',
      desc: 'Multitier Pricing & ERD',
      icon: Database
    },
    {
      id: 'WORKFLOW',
      label: 'Siklus Alur Kerja (Workflow)',
      desc: 'Real-time Stock & Points Sync',
      icon: Layers
    },
    {
      id: 'MITRA',
      label: 'Sandbox Portal Mitra App',
      desc: 'Mitra Repeat Order & Kit',
      icon: ShoppingBag
    },
    {
      id: 'CONSUMER',
      label: 'Web Publik: Cari Agen',
      desc: 'WhatsApp Router Ongkir',
      icon: Users
    },
    {
      id: 'MARKETING',
      label: 'Komersial & Pitching Agensi',
      desc: 'Business Model & Sales Copy',
      icon: Briefcase
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-pink-100 selection:text-pink-900 pb-12">
      
      {/* Premium Elegant Header Banner */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-pink-600 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
              <span>Sistem Manajemen Keagenan Skincare</span>
            </div>
            <h1 className="font-sans text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center shadow-md shadow-pink-200 text-white font-bold text-sm">G</div>
              <span>GlowSkin <span className="text-pink-500 font-medium">BeautyHub</span></span>
            </h1>
            <p className="text-slate-500 text-xs md:text-sm mt-0.5">
              Blueprint Arsitektur, Teknis, dan Strategi Pemasaran Software untuk Brand Skincare UMKM
            </p>
          </div>

          {/* Quick Stats or Metadata */}
          <div className="flex flex-wrap gap-2 md:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-sm">
              <Building className="w-3.5 h-3.5" />
              UMKM Skincare/Kosmetik lokal
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-pink-50 text-pink-700 border border-pink-100 shadow-sm">
              <Cpu className="w-3.5 h-3.5" />
              Serverless Postgres Ready
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60 shadow-sm">
              <BookmarkCheck className="w-3.5 h-3.5" />
              White-label Solution
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        
        {/* Navigation Tabs bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id.toLowerCase()}`}
                onClick={() => setActiveTab(tab.id as AppTab)}
                className={`p-4 rounded-2xl text-left border flex flex-col justify-between transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-950 border-slate-950 text-white shadow-xl shadow-slate-950/10 scale-[1.02]'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-650 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start w-full mb-3">
                  <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-pink-500 text-white' : 'bg-pink-50 text-pink-600'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                  )}
                </div>
                <div>
                  <span className={`block font-bold text-xs md:text-[13px] leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
                    {tab.label}
                  </span>
                  <span className={`block text-[10px] mt-0.5 ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                    {tab.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Box with transition animations */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 min-h-[500px] shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'DATABASE' && <DbSchemaExplorer />}
              {activeTab === 'WORKFLOW' && <WorkflowSimulator />}
              {activeTab === 'MITRA' && <MitraPortalDemo />}
              {activeTab === 'CONSUMER' && <ConsumerDemo />}
              {activeTab === 'MARKETING' && <MarketingPitchDeck />}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Real-time floating Notification Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 w-11/12 max-w-md"
          >
            <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-white shrink-0">
              <BellRing className="w-4 h-4 text-amber-300 animate-bounce" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold font-sans">Sinyal Otonom Database</p>
              <p className="text-[11px] text-slate-300 leading-tight mt-0.5">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white text-xs font-bold pl-2 cursor-pointer"
            >
              Tutup
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Speed Dial / Quick Action FAB Component */}
      <QuickActionMenu onSuccessNotification={showToast} />

      {/* Footer Branding */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-slate-200/60 text-center">
        <p className="text-slate-400 text-xs text-center">
          © 2026 BeautyHub Digital Ecosystem. Dirancang secara profesional sebagai cetak biru platform keagenan komersial.
        </p>
      </footer>
    </div>
  );
}
