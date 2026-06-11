/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ShieldCheck, 
  Cpu, 
  PhoneCall, 
  Lock, 
  Sparkles, 
  Clock, 
  BookOpen, 
  X, 
  CheckCircle2, 
  CornerDownRight,
  Info 
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'onboarding' | 'support' | 'security';
  question: string;
  answer: string;
  bullets?: string[];
  badge?: string;
}

const FAQ_ITEMS: FAQItem[] = [
  // Category 1: Onboarding
  {
    id: 'ob-1',
    category: 'onboarding',
    question: 'Bagaimana proses onboarding awal bagi UMKM Kosmetik/Skincare baru?',
    answer: 'Proses onboarding dirancang agar selesai dalam waktu kurang dari 7 hari kerja melalui 4 tahap asistensi personal:',
    bullets: [
      'Migrasi Data Mitra: Tim kami membantu menyusun ulang list agen, reseller, dan distributor dari format lama (Excel/WhatsApp) ke database aman BeautyHub.',
      'Sesi Setup Brand Admin: Pelatihan intensif (via Zoom/Meet) selama 2 jam untuk mendaftarkan katalog SKU produk, menyusun diskon/margin berjenjang, dan menetapkan aturan komisi.',
      'Aktivasi Portal Otonom: Setiap mitra penjualan Anda didelegasikan link unik agar bisa log in mandiri ke dashboard masing-masing.',
      'Sesi Go-Live & Launching: Pendampingan real-time dari Account Manager kami pada waktu peluncuran perdana guna meminimalkan hambatan order.'
    ],
    badge: 'Paling Populer'
  },
  {
    id: 'ob-2',
    category: 'onboarding',
    question: 'Apakah mitra lama kami (reseller/distributor) perlu membayar biaya pendaftaran portal?',
    answer: 'Sama sekali TIDAK. Skema portal mandiri reseller, agen, maupun distributor adalah 100% GRATIS dan dibebaskan dari biaya admin bulanan. Biaya subscription atau lisensi software sepenuhnya ditanggung oleh Anda selaku pemilik brand utama (Brand Owner/UMKM) sesuai paket volume mitra aktif yang dipilih.',
  },
  {
    id: 'ob-3',
    category: 'onboarding',
    question: 'Apakah ada kontrak mengikat minimal atau masa percobaan?',
    answer: 'BeautyHub menganut sistem pembayaran fleksibel "Pay-As-You-Grow" secara bulanan (tanpa kontrak tahunan wajib). Kami juga menyediakan garansi trial gratis 14 hari penuh dengan seluruh fitur premium aktif agar Anda bisa menguji fungsionalitas sistem secara langsung sebelum memutuskan berlangganan.',
  },

  // Category 2: Technical Support
  {
    id: 'sup-1',
    category: 'support',
    question: 'Bagaimana tim teknis mendampingi operasional harian kami bila terjadi kendala?',
    answer: 'Kami menyediakan support multi-kanal terintegrasi yang menjamin operasional rantai suplai Anda tidak terganggu:',
    bullets: [
      'Dedicated Customer Success (CS) Manager: Akses jalur hotline khusus via Telegram/WhatsApp VIP untuk respon kilat di bawah 15 menit harian.',
      'Layanan Darurat SLA 1 Jam: Jika terjadi kendala server krusial, tim engineer siaga penuh 24/7 untuk pemulihan instan di bawah kesepakatan Service Level Agreement (SLA).',
      'Pendidikan & Dokumentasi Mandiri: Akses instan ke video panduan berdurasi pendek dan manual interaktif di dalam platform.',
      'Pembaruan Sistem Rutin: Setiap 2 minggu sekali, kami menggulirkan optimasi performa dan fitur baru yang otomatis ter-update tanpa menyita down-time server.'
    ],
    badge: 'High SLA'
  },
  {
    id: 'sup-2',
    category: 'support',
    question: 'Bagaimana jika perangkat HP atau jaringan reseller di pelosok daerah sangat lambat?',
    answer: 'Aplikasi portal BeautyHub dirancang dengan arsitektur "Offline-Resilient Micro-Frontends" berkebutuhan bandwidth ultra-rendah. Aplikasi hanya mengunduh data teks esensial (kurang dari 25 Kilobytes per transaksi) dan menyimpan history transaksi secara lokal saat sinyal putus, kemudian menyinkronkannya kembali ketika sinyal stabil. UI didesain sangat ringan dan bersahabat untuk ponsel berspesifikasi low-end (Android RAM 2GB).',
  },

  // Category 3: Security & Data Standards
  {
    id: 'sec-1',
    category: 'security',
    question: 'Bagaimana standar keamanan data serta privasi jaringan mitra kami dijaga?',
    answer: 'Kami menjamin kerahasiaan data pelanggan, omset, dan jaringan kemitraan Anda sebagai prioritas tertinggi demi menghindari kebocoran data kompetitor:',
    bullets: [
      'Enkripsi Data En-Route & At-Rest: Seluruh basis data dienkripsi menggunakan algoritma standar militer Advanced Encryption Standard (AES-256) serta protokol transit TLS 1.3.',
      'Isolasi Database Cloud-Natively: Struktur penyimpanan data antar-klien diisolasi secara logis menggunakan skema multi-tenant Firestore yang aman. Brand lain tidak pernah bisa memetakan atau menyusup ke info internal Anda.',
      'Protokol Anti-Poaching Reseller: Kami menerapkan sensor otomatis di mana detail kontak reseller atau data dropshipper disembunyikan menggunakan masking bintang (*). Anggota tim admin internal Anda hanya dapat mengakses jika didelegasikan izin Role-Based Access Control (RBAC).',
      'Pencadangan Data Otomatis: Backup harian otomatis ke sistem cloud multi-region untuk memastikan tidak ada data transaksi berharga yang hilang akibat kesalahan operasional manusia.'
    ],
    badge: 'Enterprise Grade'
  },
  {
    id: 'sec-2',
    category: 'security',
    question: 'Siapakah pemilik sah seluruh data transaksi dan kemitraan dalam BeautyHub?',
    answer: 'Seluruh hak milik intelektual dan konten data (IP & Data Ownership) adalah milik Anda selaku Brand Owner 100%. Kami bertindak murni selaku penyedia infrastruktur pemrosesan software terenkripsi. Anda memiliki hak mutlak kapan pun untuk mengekspor atau menghapus basis data kemitraan tersebut secara utuh dari server kami dalam format CSV/JSON terstandar.',
  }
];

export default function BusinessFAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'onboarding' | 'support' | 'security'>('all');
  const [expandedId, setExpandedId] = useState<string | null>('ob-1');

  // Toggle FAQ collapse
  const handleToggle = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Filter items based on query and active category tab
  const filteredFAQs = useMemo(() => {
    return FAQ_ITEMS.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery = query === '' ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        (item.bullets && item.bullets.some(b => b.toLowerCase().includes(query)));

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div id="business-faq-wrapper" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      
      {/* SECTION HEADER BLOCK */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-pink-50 border border-pink-100 text-pink-600 rounded-2xl shrink-0">
            <HelpCircle className="w-6 h-6 text-pink-600 animate-pulse" />
          </div>
          <div>
            <h4 id="faq-heading-text" className="font-sans font-extrabold text-slate-900 text-base md:text-lg flex items-center gap-1.5 flex-wrap">
              Pusat Pertanyaan Pembaca (Business & Tech FAQ)
              <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-[10.5px] font-extrabold rounded-full uppercase tracking-wider">
                Support & Security
              </span>
            </h4>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-sans">
              Jawaban lengkap seputar cara integrasi bisnis kosmetik Anda, SLA bantuan teknis, dan standar kepatuhan privasi data di BeautyHub.
            </p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH INTEGRATION ROW */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50">
          <button
            id="faq-tab-all"
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200/50'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Semua Topik
          </button>
          
          <button
            id="faq-tab-onboarding"
            onClick={() => setActiveCategory('onboarding')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeCategory === 'onboarding'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Onboarding {FAQ_ITEMS.filter(f => f.category === 'onboarding').length}
          </button>

          <button
            id="faq-tab-support"
            onClick={() => setActiveCategory('support')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeCategory === 'support'
                ? 'bg-indigo-650 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Dukungan Teknis {FAQ_ITEMS.filter(f => f.category === 'support').length}
          </button>

          <button
            id="faq-tab-security"
            onClick={() => setActiveCategory('security')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeCategory === 'security'
                ? 'bg-purple-650 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Keamanan Data {FAQ_ITEMS.filter(f => f.category === 'security').length}
          </button>
        </div>

        {/* Live Fuzzy Keyword Search bar */}
        <div className="relative min-w-[240px] md:w-80">
          <input
            id="faq-search-input"
            type="text"
            placeholder="Cari FAQ proses, garansi, server..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 py-2 pl-9 pr-8 rounded-2xl text-xs focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder:text-slate-400 font-sans"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* ACCORDION BLOCK OF QUESTIONS */}
      <div className="space-y-3">
        {filteredFAQs.length === 0 ? (
          <div className="bg-slate-50 border border-slate-150 border-dashed rounded-2xl p-8 text-center">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-900">Kata kunci pencarian tidak ditemukan</p>
            <p className="text-[11px] text-slate-450 mt-1">Coba masukkan istilah populer seperti 'Reseller', 'Enkripsi', atau 'Hotline CS'.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-4 px-4 py-1.5 bg-slate-200 hover:bg-slate-350 text-slate-800 text-[11px] font-bold rounded-xl transition-colors cursor-pointer"
            >
              Setel Ulang Filter
            </button>
          </div>
        ) : (
          filteredFAQs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                id={`faq-accordion-item-${faq.id}`}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-pink-500/80 bg-pink-50/5 shadow-xs ring-1 ring-pink-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                {/* Header (Interactive Button) */}
                <button
                  onClick={() => handleToggle(faq.id)}
                  className="w-full text-left p-4 md:p-5 flex items-start justify-between gap-3 cursor-pointer focus:outline-none"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-1.5 py-0.2 rounded text-[8.5px] uppercase font-bold tracking-wider ${
                        faq.category === 'onboarding'
                          ? 'bg-pink-100 text-pink-700'
                          : faq.category === 'support'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {faq.category === 'onboarding' ? 'Onboarding' : faq.category === 'support' ? 'Sistem & Support' : 'Sandi & Security'}
                      </span>
                      {faq.badge && (
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[8.5px] font-extrabold rounded flex items-center gap-0.5 font-mono">
                          <Sparkles className="w-2.5 h-2.5" />
                          {faq.badge}
                        </span>
                      )}
                    </div>
                    <h5 className="font-sans font-extrabold text-slate-900 text-xs md:text-sm">
                      {faq.question}
                    </h5>
                  </div>
                  <span className={`p-1.5 rounded-xl border mt-0.5 shrink-0 transition-transform ${
                    isExpanded ? 'bg-pink-50 border-pink-200 text-pink-600 rotate-180' : 'bg-slate-50 border-slate-200 text-slate-550'
                  }`}>
                    <ChevronDown className="w-4 h-4 stroke-[2.5px]" />
                  </span>
                </button>

                {/* Body (AnimatePresence) */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="border-t border-slate-150/60"
                    >
                      <div className="p-4 md:p-5 pt-3 space-y-3 bg-slate-50/30 text-xs text-slate-650 leading-relaxed font-sans">
                        <p className="font-semibold text-slate-800">{faq.answer}</p>
                        
                        {/* Render bullets detail checklist if existing */}
                        {faq.bullets && (
                          <div className="space-y-2 mt-2 bg-white border border-slate-150 p-4 rounded-xl shadow-xs">
                            {faq.bullets.map((bullet, bIndex) => {
                              const [boldText, normalText] = bullet.split(': ');
                              return (
                                <div key={bIndex} className="flex items-start gap-2.5 leading-relaxed">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                  <p className="text-[11.5px] text-slate-600">
                                    <strong className="text-slate-905 font-bold font-sans">{boldText}:</strong> {normalText}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* FOOTER CALL-TO-ACTION FOR EXTRA CLIENT CONSULTATIONS */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1">
          <span className="text-[9px] font-bold font-mono text-pink-400 uppercase tracking-widest block">
            Masih Butuh Informasi Ekstra?
          </span>
          <h5 className="font-sans font-extrabold text-white text-sm md:text-base flex items-center gap-1.5">
            Dapatkan Sesi Konsultasi Sistem 1-on-1 Eksklusif
          </h5>
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
            Ingin mencocokkan skenario diskon, konfigurasi master SKU, atau mendiskusikan implementasi kustom integrasi POS? CS Engineer kami siap membantu lewat panggilan demo khusus.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
          <a
            id="faq-cta-whatsapp"
            href="https://wa.me/628123456789?text=Halo%20BeautyHub%2C%20saya%20tertarik%20tanya%20onboarding%20brand%20kosmetik"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-550 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-950/20 text-center flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            WhatsApp VIP CS
          </a>
          
          <button
            id="faq-cta-demo"
            onClick={() => alert("Sesi demonstrasi kustom virtual terjadwalkan. Tim support BeautyHub akan menghubungi e-mail Anda segera!")}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center gap-1 border border-slate-200 cursor-pointer"
          >
            Jadwalkan Live Demo
            <CornerDownRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

    </div>
  );
}
