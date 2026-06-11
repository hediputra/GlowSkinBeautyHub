/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Calculator, 
  TrendingUp, 
  Users, 
  Coins, 
  Sparkles, 
  Percent, 
  ArrowUpRight, 
  Check, 
  HelpCircle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

interface PresetConfig {
  name: string;
  agencySize: number;
  avgOrder: number;
  marginPerPiece: number;
  description: string;
}

const PRESETS: PresetConfig[] = [
  {
    name: 'UMKM Pemula (Kecil)',
    agencySize: 25,
    avgOrder: 15,
    marginPerPiece: 15000,
    description: 'Cocok untuk produsen skincare lokal baru dengan rintisan puluhan reseller aktif.'
  },
  {
    name: 'Brand Berkembang (Menengah)',
    agencySize: 120,
    avgOrder: 35,
    marginPerPiece: 25000,
    description: 'Model distribusi mapan di 2-3 provinsi dengan jaringan agen & reseller teratur.'
  },
  {
    name: 'Sultan Brand (Skala Besar)',
    agencySize: 450,
    avgOrder: 60,
    marginPerPiece: 35000,
    description: 'Platform maklon skincare berskala nasional dengan ribuan repeat order bulanan.'
  }
];

export default function ProjectedRevenueCalculator() {
  // Input parameters
  const [agencySize, setAgencySize] = useState<number>(120);
  const [avgOrder, setAvgOrder] = useState<number>(35);
  const [marginPerPiece, setMarginPerPiece] = useState<number>(25000);

  // Help tooltips visibility
  const [showRoiHelp, setShowRoiHelp] = useState(false);

  // Calculate Subscription Tiers based on Agency Size (Mitra count)
  const subscriptionConfig = useMemo(() => {
    if (agencySize <= 50) {
      return {
        name: 'Starter Tier (UMKM)',
        price: 299000,
        description: 'Mendukung hingga 50 mitra penjualan',
        badgeColor: 'bg-emerald-100 text-emerald-800'
      };
    } else if (agencySize <= 250) {
      return {
        name: 'Grow Tier (Scale)',
        price: 799000,
        description: 'Mendukung hingga 250 mitra penjualan',
        badgeColor: 'bg-indigo-100 text-indigo-800'
      };
    } else {
      return {
        name: 'Enterprise Tier (Pro Scale)',
        price: 1499000,
        description: 'Mendukung mitra tak terbatas & Prioritas Bandwidth',
        badgeColor: 'bg-pink-100 text-pink-800 font-bold'
      };
    }
  }, [agencySize]);

  // Handle Preset Clicks
  const handleApplyPreset = (preset: PresetConfig) => {
    setAgencySize(preset.agencySize);
    setAvgOrder(preset.avgOrder);
    setMarginPerPiece(preset.marginPerPiece);
  };

  // Math Calculations
  const totalVolume = useMemo(() => {
    return agencySize * avgOrder;
  }, [agencySize, avgOrder]);

  const grossRevenueEst = useMemo(() => {
    // Estimasi harga ecer rata-rata per skincare pcs Rp 125,000
    return totalVolume * 125000;
  }, [totalVolume]);

  const monthlyProfitEst = useMemo(() => {
    return totalVolume * marginPerPiece;
  }, [totalVolume, marginPerPiece]);

  const netProfitAfterSub = useMemo(() => {
    return monthlyProfitEst - subscriptionConfig.price;
  }, [monthlyProfitEst, subscriptionConfig]);

  const roiPercent = useMemo(() => {
    if (subscriptionConfig.price === 0) return 0;
    return (monthlyProfitEst / subscriptionConfig.price) * 100;
  }, [monthlyProfitEst, subscriptionConfig]);

  const roiMultiplier = useMemo(() => {
    return (monthlyProfitEst / subscriptionConfig.price).toFixed(0);
  }, [monthlyProfitEst, subscriptionConfig]);

  // Generate 6-Month cumulative trajectory data for Recharts
  const projectionData = useMemo(() => {
    const data = [];
    let cumulativeProfit = 0;
    let cumulativeSubFee = 0;
    
    // Ramp up simulation factor per month
    const rampFactors = [0.6, 0.8, 1.0, 1.15, 1.3, 1.5];

    for (let month = 1; month <= 6; month++) {
      const factor = rampFactors[month - 1];
      const monthlyVol = Math.round(totalVolume * factor);
      const monthlyProfit = monthlyVol * marginPerPiece;
      const subFee = subscriptionConfig.price;

      cumulativeProfit += monthlyProfit;
      cumulativeSubFee += subFee;

      data.push({
        name: `Bulan ${month}`,
        'Volume Produk': monthlyVol,
        'Keuntungan Bersih (Laba)': monthlyProfit,
        'Akumulasi Laba': cumulativeProfit,
        'Biaya Langganan Platform': subFee,
        'Akumulasi Biaya Platform': cumulativeSubFee
      });
    }
    return data;
  }, [totalVolume, marginPerPiece, subscriptionConfig]);

  return (
    <div id="projected-revenue-wrapper" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-pink-50 border border-pink-100 text-pink-600 rounded-2xl shrink-0">
            <Calculator className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-sans font-extrabold text-slate-900 text-base md:text-lg flex items-center gap-1.5">
              Kalkulator Proyeksi Pendapatan & ROI UMKM
              <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Interactive Model
              </span>
            </h4>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
              Kalkulasi rasio pengembalian investasi (ROI) serta biaya paket berlangganan otonom berdasarkan skala jaringan kemitraan Anda.
            </p>
          </div>
        </div>
      </div>

      {/* QUICK PRESET SELECTORS */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">
          ⚡ Pilih Preset Cepat Skala Bisnis Skincare:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESETS.map((preset, index) => {
            const isMatched = agencySize === preset.agencySize && avgOrder === preset.avgOrder && marginPerPiece === preset.marginPerPiece;
            return (
              <button
                key={index}
                id={`preset-btn-${index}`}
                onClick={() => handleApplyPreset(preset)}
                className={`p-3.5 rounded-2xl text-left border cursor-pointer transition-all ${
                  isMatched
                    ? 'border-pink-500 bg-pink-50/20 shadow-sm ring-1 ring-pink-500/50'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-350'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-slate-950 font-sans">{preset.name}</span>
                  {isMatched && (
                    <span className="w-4 h-4 rounded-full bg-pink-600 flex items-center justify-center text-white">
                      <Check className="w-2.5 h-2.5 stroke-[3px]" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-550 leading-relaxed font-sans line-clamp-2">
                  {preset.description}
                </p>
                <div className="mt-2.5 flex items-center gap-2 text-[9.5px] font-mono font-bold text-slate-400">
                  <span>{preset.agencySize} Mitra</span>
                  <span>•</span>
                  <span>{preset.avgOrder} Pcs/Bln</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* THREE-COLUMN LAYOUT: SLIDERS, GENERAL STATS BOARD, DETAIL TIERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Sliders Input Column (4-Cols) */}
        <div className="lg:col-span-5 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-5.5">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/50">
            <Layers className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-bold text-slate-900 uppercase">Parameter Input Operasional</span>
          </div>

          {/* Slider 1: Agency Size */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-650 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-pink-500" />
                Jumlah Mitra Keagenan (Reseller/Agen)
              </span>
              <span className="font-mono text-slate-900 bg-white px-2.5 py-0.5 border border-slate-200 rounded-lg shadow-xs">
                {agencySize} Mitra
              </span>
            </div>
            <input
              id="slider-agency-size"
              type="range"
              min="10"
              max="500"
              step="5"
              value={agencySize}
              onChange={(e) => setAgencySize(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600 dark:accent-pink-500"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>Min: 10</span>
              <span>Med: 250</span>
              <span>Max: 500</span>
            </div>
          </div>

          {/* Slider 2: Average Order */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-650 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-indigo-500" />
                Rata-rata Repeat Order (pcs/mitra/bulan)
              </span>
              <span className="font-mono text-slate-900 bg-white px-2.5 py-0.5 border border-slate-200 rounded-lg shadow-xs">
                {avgOrder} Pcs
              </span>
            </div>
            <input
              id="slider-avg-order"
              type="range"
              min="5"
              max="150"
              step="5"
              value={avgOrder}
              onChange={(e) => setAvgOrder(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>Min: 5 pcs</span>
              <span>Med: 75 pcs</span>
              <span>Max: 150 pcs</span>
            </div>
          </div>

          {/* Slider 3: Profit Margin per Piece */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-650 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-purple-500" />
                Kisaran Margin Laba Bersih (Rp/piece)
              </span>
              <span className="font-mono text-slate-900 bg-white px-2.5 py-0.5 border border-slate-200 rounded-lg shadow-xs">
                Rp {marginPerPiece.toLocaleString('id-ID')}
              </span>
            </div>
            <input
              id="slider-margin-piece"
              type="range"
              min="5000"
              max="100000"
              step="2500"
              value={marginPerPiece}
              onChange={(e) => setMarginPerPiece(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>Rp 5.000</span>
              <span>Rp 50.000</span>
              <span>Rp 100.000</span>
            </div>
          </div>
        </div>

        {/* Real-time calculated Profit Metrics Board (7-Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            
            {/* Box 1: Estimated Volumes */}
            <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] font-extrabold text-slate-450 uppercase tracking-wider block font-mono">
                  Volume Distribusi
                </span>
                <span className="text-xl font-extrabold text-slate-900 font-sans block mt-1">
                  {totalVolume.toLocaleString('id-ID')} pcs / bln
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                Total botol skincare yang tersalurkan dari gudang pusat ke gerbang reseller per bulan.
              </p>
            </div>

            {/* Box 2: Platform subscription fee mapping */}
            <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] font-extrabold text-slate-450 uppercase tracking-wider block font-mono flex items-center justify-between">
                  <span>Biaya Software</span>
                  <span className={`px-2 py-0.2 rounded text-[8.5px] ${subscriptionConfig.badgeColor}`}>
                    {subscriptionConfig.name.split(' ')[0]}
                  </span>
                </span>
                <span className="text-xl font-extrabold text-slate-900 font-sans block mt-1">
                  Rp {subscriptionConfig.price.toLocaleString('id-ID')} <span className="text-[10px] text-slate-450 font-normal">/bln</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-550 mt-1 line-clamp-2 leading-normal">
                {subscriptionConfig.name}: {subscriptionConfig.description}.
              </p>
            </div>

            {/* Box 3: Total Gross Sales Est */}
            <div className="bg-slate-50 border border-slate-200/70 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] font-extrabold text-slate-450 uppercase tracking-wider block font-mono">
                  Estimasi Omset (Gross)
                </span>
                <span className="text-lg font-extrabold text-slate-900 font-sans block mt-1">
                  Rp {grossRevenueEst.toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                Asumsi harga ritel rata-rata pasar Rp 125.000 per skincare botol.
              </p>
            </div>

            {/* Box 4: Laba Bersih Bulanan */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute right-2 top-2 text-emerald-500/10">
                <TrendingUp className="w-12 h-12" />
              </div>
              <div>
                <span className="text-[9.5px] font-extrabold text-emerald-600 uppercase tracking-wider block font-mono">
                  Estimasi Laba Bersih
                </span>
                <span className="text-lg font-extrabold text-emerald-900 font-sans block mt-1">
                  Rp {monthlyProfitEst.toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-[10px] text-emerald-700/80 mt-2 leading-relaxed">
                Setelah dipotong HPP Produksi, operasional, & komisi berjenjang mitra.
              </p>
            </div>

          </div>

          {/* Premium ROI / Business Scalability Callout Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-extrabold text-pink-500 tracking-wider uppercase font-mono block">
                Skalabilitas Finansial Platform
              </span>
              <p className="text-normal font-sans font-extrabold text-white">
                Rasio Pengembalian Investasi & ROI Software
              </p>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Efisiensi biaya digital tinggi. Setiap rupiah yang Anda keluarkan untuk software BeautyHub menghasilkan laba balik berlipat-lipat.
              </p>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl min-w-[120px] text-center shrink-0">
              <span className="text-[8.5px] text-slate-500 font-bold uppercase block">Rasio Yield</span>
              <p className="text-lg font-black text-amber-400 font-mono mt-0.5">
                {roiMultiplier}x LIPAT
              </p>
              <span className="text-[9px] text-emerald-400 font-bold font-mono">
                +{roiPercent.toLocaleString('id-ID', { maximumFractionDigits: 0 })}% ROI
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* RECHARTS TRAJECTORY GRAPH OVER 6 MONTHS */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-4 md:p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/50">
          <div>
            <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block font-mono">
              Visualisasi Finansial 1 Semester
            </span>
            <h5 className="font-sans font-extrabold text-slate-900 text-sm">
              Proyeksi Akumulasi Laba Bersih vs Biaya Berlangganan Platform
            </h5>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-sans">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-pink-500 rounded-sm"></span> Akumulasi Laba (Rp)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-slate-900 rounded-sm"></span> Akumulasi Biaya Platform (Rp)
            </span>
          </div>
        </div>

        {/* RECHARTS SVG AREA CHART CANVAS */}
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={projectionData}
              margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DB2777" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#DB2777" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E293B" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1E293B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'sans-serif' }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis 
                tickFormatter={(val) => {
                  if (val >= 1e6) return `Rp ${(val / 1e6).toFixed(1)}jt`;
                  return `Rp ${val / 1e3}rb`;
                }}
                tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value: any, name: string) => {
                  const numberVal = Number(value);
                  return [
                    `Rp ${numberVal.toLocaleString('id-ID')}`, 
                    name
                  ];
                }}
                contentStyle={{ 
                  backgroundColor: '#0F172A', 
                  borderRadius: '12px', 
                  border: 'none',
                  color: '#F8FAFC',
                  fontSize: '11px',
                  fontFamily: 'sans-serif'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="Akumulasi Laba" 
                stroke="#DB2777" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorProfit)" 
              />
              <Area 
                type="monotone" 
                dataKey="Akumulasi Biaya Platform" 
                stroke="#1E293B" 
                strokeWidth={1.5} 
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorSub)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Explanations */}
        <div className="bg-amber-50/50 rounded-xl border border-amber-150 p-3.5 text-[11px] leading-relaxed text-amber-800 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong>Keterangan Proyeksi Skalabilitas Bisnis:</strong> Grafik di atas mensimulasikan pertumbuhan bertahap performa bisnis kosmetik Anda selama 6 bulan dengan asumsi perluasan agen (ramp-up factor) berkisar dari 60% s.d. 150% dari volume normal saat ini. Biaya berlangganan aplikasi software BeautyHub tetap datar dan sangat terprediksi, menjamin margin profit Anda bertumbuh maksimal tanpa dibebani kenaikan biaya software penunjang yang eksponensial.
          </div>
        </div>

      </div>

    </div>
  );
}
