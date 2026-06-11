/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Coins, 
  Sparkles, 
  Percent, 
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  Info,
  Calendar,
  Building
} from 'lucide-react';

interface TierPreset {
  name: string;
  distributors: number;
  distVolume: number;
  agen: number;
  agenVolume: number;
  resellers: number;
  resellerVolume: number;
  growthRate: number;
  description: string;
}

const PRESETS: TierPreset[] = [
  {
    name: 'Ekosistem Lokal Baru',
    distributors: 2,
    distVolume: 250,
    agen: 10,
    agenVolume: 50,
    resellers: 30,
    resellerVolume: 15,
    growthRate: 3,
    description: 'Awal rintisan brand kosmetik dengan jaringan agen lokal di satu karesidenan.'
  },
  {
    name: 'Ekosistem Nasional Berkembang',
    distributors: 6,
    distVolume: 500,
    agen: 30,
    agenVolume: 80,
    resellers: 150,
    resellerVolume: 20,
    growthRate: 6,
    description: 'Distribusi mapan lintas pulau dengan keaktifan repeat order yang stabil.'
  },
  {
    name: 'Imperium Kosmetik Sultan',
    distributors: 15,
    distVolume: 1000,
    agen: 100,
    agenVolume: 150,
    resellers: 500,
    resellerVolume: 35,
    growthRate: 10,
    description: 'Skala korporasi maklon kecantikan raksasa dengan viralitas marketing tinggi.'
  }
];

export default function AnnualRevenueForecast() {
  // Brand product settings
  const [msrp, setMsrp] = useState<number>(120000); // Retail consumer price

  // Sub-discounts per tier (fixed industry standard averages, adjustable visually in indicators)
  const distDiscount = 50; // 50% discount
  const agenDiscount = 35; // 35% discount
  const resellerDiscount = 20; // 20% discount

  // Partner counts & purchase levels per tier
  const [distributorCount, setDistributorCount] = useState<number>(6);
  const [distributorAOV, setDistributorAOV] = useState<number>(500); // average units bought monthly per distributor

  const [agenCount, setAgenCount] = useState<number>(30);
  const [agenAOV, setAgenAOV] = useState<number>(80); // average units bought monthly per agen

  const [resellerCount, setResellerCount] = useState<number>(150);
  const [resellerAOV, setResellerAOV] = useState<number>(20); // average units bought monthly per reseller

  const [monthlyGrowthRate, setMonthlyGrowthRate] = useState<number>(5); // monthly growth rate in percent %

  // Apply Preset Configs
  const handleApplyPreset = (preset: TierPreset) => {
    setDistributorCount(preset.distributors);
    setDistributorAOV(preset.distVolume);
    setAgenCount(preset.agen);
    setAgenAOV(preset.agenVolume);
    setResellerCount(preset.resellers);
    setResellerAOV(preset.resellerVolume);
    setMonthlyGrowthRate(preset.growthRate);
  };

  // Wholesale Unit Prices derived from MSRP
  const distUnitPrice = useMemo(() => msrp * (1 - distDiscount / 100), [msrp]);
  const agenUnitPrice = useMemo(() => msrp * (1 - agenDiscount / 100), [msrp]);
  const resellerUnitPrice = useMemo(() => msrp * (1 - resellerDiscount / 100), [msrp]);

  // Forecast 12 Months Projection Simulation with Growth
  const forecastData = useMemo(() => {
    const data = [];
    
    let currentDistributors = distributorCount;
    let currentAgen = agenCount;
    let currentResellers = resellerCount;

    let cumulativeTotal = 0;

    const rate = monthlyGrowthRate / 100;

    for (let month = 1; month <= 12; month++) {
      // Monthly product volume per tier
      const distUnits = currentDistributors * distributorAOV;
      const agenUnits = currentAgen * agenAOV;
      const resellerUnits = currentResellers * resellerAOV;

      // Revenue per tier
      const distRev = distUnits * distUnitPrice;
      const agenRev = agenUnits * agenUnitPrice;
      const resellerRev = resellerUnits * resellerUnitPrice;

      const totalMonthlyRev = distRev + agenRev + resellerRev;
      cumulativeTotal += totalMonthlyRev;

      data.push({
        name: `Bln ${month}`,
        'Distributor Sales': Math.round(distRev),
        'Agen Sales': Math.round(agenRev),
        'Reseller Sales': Math.round(resellerRev),
        'Total Pendapatan': Math.round(totalMonthlyRev),
        'Akumulasi Setahun': Math.round(cumulativeTotal),
        // Track growing counts
        distributors: Math.round(currentDistributors),
        agen: Math.round(currentAgen),
        resellers: Math.round(currentResellers),
        totalUnits: Math.round(distUnits + agenUnits + resellerUnits)
      });

      // Apply compound growth for next month
      currentDistributors *= (1 + rate);
      currentAgen *= (1 + rate);
      currentResellers *= (1 + rate);
    }

    return data;
  }, [
    distributorCount, distributorAOV, distUnitPrice,
    agenCount, agenAOV, agenUnitPrice,
    resellerCount, resellerAOV, resellerUnitPrice,
    monthlyGrowthRate
  ]);

  // Key totals from Year-End projections (Month 12)
  const annualPerformance = useMemo(() => {
    const lastMonth = forecastData[11];
    const totalAccumulated = lastMonth['Akumulasi Setahun'];
    const totalUnitsSoldYear = forecastData.reduce((sum, m) => sum + m.totalUnits, 0);
    
    // Average monthly run-rate
    const averageMonthlyRunrate = totalAccumulated / 12;

    return {
      annualCumulative: totalAccumulated,
      totalUnitsYear: totalUnitsSoldYear,
      monthlyRunRateEnd: lastMonth['Total Pendapatan'],
      finalDistributors: lastMonth.distributors,
      finalAgen: lastMonth.agen,
      finalResellers: lastMonth.resellers,
    };
  }, [forecastData]);

  return (
    <div id="annual-revenue-forecast-wrapper" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-pink-50 border border-pink-100 text-pink-600 rounded-2xl shrink-0">
            <Calendar className="w-6 h-6 animate-pulse text-pink-600" />
          </div>
          <div>
            <h4 className="font-sans font-extrabold text-slate-900 text-base md:text-lg flex items-center gap-1.5">
              Simulasi Proyeksi Pendapatan Tahunan (Annual Forecast)
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                12-Month Grow
              </span>
            </h4>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-sans animate-fade-in">
              Kalkulasikan proyeksi penjualan masa depan berdasarkan pertumbuhan kemitraan otonom, volume order berulang, dan penyesuaian harga grosir per tingkatan level agen.
            </p>
          </div>
        </div>
      </div>

      {/* QUICK PRESETS CARDS */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-mono">
          ⚡ Pilih Preset Ekosistem Kemitraan:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESETS.map((preset, idx) => {
            const isSelected = distributorCount === preset.distributors && resellerCount === preset.resellers && monthlyGrowthRate === preset.growthRate;
            return (
              <button
                key={idx}
                id={`forecast-preset-btn-${idx}`}
                onClick={() => handleApplyPreset(preset)}
                className={`p-3.5 rounded-2xl text-left border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/10 shadow-xs ring-1 ring-indigo-600/30'
                    : 'border-slate-200 bg-slate-55/30 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-extrabold text-slate-950 font-sans">{preset.name}</span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-550 leading-relaxed font-sans line-clamp-2">
                  {preset.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[9px] font-mono font-bold text-slate-450">
                  <span>D: {preset.distributors}</span>
                  <span>•</span>
                  <span>A: {preset.agen}</span>
                  <span>•</span>
                  <span>R: {preset.resellers}</span>
                  <span className="text-pink-600">({preset.growthRate}% Grow)</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* THREE SECTION GRID: PARAMETER INPUT SLIDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
        
        {/* Sliders Panels - Left 5 Cols */}
        <div className="lg:col-span-5 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-4">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/50">
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-pink-600" />
              <span className="text-xs font-extrabold text-slate-900 uppercase">Parameter Multi-Tier</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10.5px]">
              <span className="text-slate-400">Base MSRP:</span>
              <span className="text-slate-900 font-extrabold">Rp {msrp.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* MSRP Slider Control */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
              <span>Atur Patokan Harga Ritel Eceran (MSRP)</span>
              <input 
                type="number"
                value={msrp}
                onChange={(e) => setMsrp(Math.max(1000, Number(e.target.value)))}
                className="w-20 text-right text-[10px] p-0.5 border border-slate-200 rounded font-mono font-bold"
              />
            </div>
            <input 
              type="range"
              min="20000"
              max="250000"
              step="5000"
              value={msrp}
              onChange={(e) => setMsrp(Number(e.target.value))}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
            />
          </div>

          {/* DISTRIBUTOR TIER SLIDERS */}
          <div className="p-3 bg-white rounded-xl border border-slate-150 space-y-3">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[10px] font-extrabold text-pink-600 uppercase">TINGKAT DISTRIBUTOR</span>
              <span className="text-[9.5px] font-bold text-slate-400">Harga: Rp {distUnitPrice.toLocaleString('id-ID')}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-650">
                <span>Jumlah Distributor Aktif</span>
                <span className="font-mono font-bold text-slate-900">{distributorCount} Mitra</span>
              </div>
              <input 
                type="range"
                min="1"
                max="30"
                value={distributorCount}
                onChange={(e) => setDistributorCount(Number(e.target.value))}
                className="w-full h-1 bg-slate-150 rounded cursor-pointer accent-pink-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-650">
                <span>Rata-Rata Order Bulanan</span>
                <span className="font-mono font-bold text-slate-900">{distributorAOV} pcs/Blm</span>
              </div>
              <input 
                type="range"
                min="50"
                max="2500"
                step="50"
                value={distributorAOV}
                onChange={(e) => setDistributorAOV(Number(e.target.value))}
                className="w-full h-1 bg-slate-150 rounded cursor-pointer accent-pink-600"
              />
            </div>
          </div>

          {/* AGEN TIER SLIDERS */}
          <div className="p-3 bg-white rounded-xl border border-slate-150 space-y-3">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[10px] font-extrabold text-indigo-600 uppercase">TINGKAT AGEN</span>
              <span className="text-[9.5px] font-bold text-slate-400">Harga: Rp {agenUnitPrice.toLocaleString('id-ID')}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-650">
                <span>Jumlah Agen Aktif</span>
                <span className="font-mono font-bold text-slate-900">{agenCount} Agen</span>
              </div>
              <input 
                type="range"
                min="5"
                max="150"
                value={agenCount}
                onChange={(e) => setAgenCount(Number(e.target.value))}
                className="w-full h-1 bg-slate-150 rounded cursor-pointer accent-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-650">
                <span>Rata-Rata Order Bulanan</span>
                <span className="font-mono font-bold text-slate-900">{agenAOV} pcs/Bln</span>
              </div>
              <input 
                type="range"
                min="10"
                max="500"
                step="10"
                value={agenAOV}
                onChange={(e) => setAgenAOV(Number(e.target.value))}
                className="w-full h-1 bg-slate-150 rounded cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* RESELLER TIER SLIDERS */}
          <div className="p-3 bg-white rounded-xl border border-slate-150 space-y-3">
            <div className="flex items-center justify-between font-mono">
              <span className="text-[10px] font-extrabold text-purple-600 uppercase">TINGKAT RESELLER</span>
              <span className="text-[9.5px] font-bold text-slate-400">Harga: Rp {resellerUnitPrice.toLocaleString('id-ID')}</span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-650">
                <span>Jumlah Reseller Aktif</span>
                <span className="font-mono font-bold text-slate-900">{resellerCount} Akun</span>
              </div>
              <input 
                type="range"
                min="10"
                max="1000"
                step="10"
                value={resellerCount}
                onChange={(e) => setResellerCount(Number(e.target.value))}
                className="w-full h-1 bg-slate-150 rounded cursor-pointer accent-purple-600"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-medium text-slate-650">
                <span>Rata-Rata Order Bulanan</span>
                <span className="font-mono font-bold text-slate-900">{resellerAOV} pcs/Bln</span>
              </div>
              <input 
                type="range"
                min="2"
                max="100"
                step="2"
                value={resellerAOV}
                onChange={(e) => setResellerAOV(Number(e.target.value))}
                className="w-full h-1 bg-slate-150 rounded cursor-pointer accent-purple-600"
              />
            </div>
          </div>

          {/* COMPOUND GROWTH RATE */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-650 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Pertumbuhan Jaringan Bulanan (Compound MoM)
              </span>
              <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-md text-[11px] font-bold">
                +{monthlyGrowthRate}% / bulan
              </span>
            </div>
            <input 
              type="range"
              min="0"
              max="20"
              step="1"
              value={monthlyGrowthRate}
              onChange={(e) => setMonthlyGrowthRate(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

        </div>

        {/* Live Forecast Projections & Recharts - Right 7 Cols */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Key Output Performance metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 text-slate-800 opacity-20">
                <TrendingUp className="w-20 h-20" />
              </div>
              <span className="text-[9px] font-bold font-mono text-pink-500 uppercase tracking-widest block">
                Total Omset Tahun Ke-1
              </span>
              <span className="text-xl font-extrabold font-sans text-white block mt-1.5 leading-tight">
                Rp {annualPerformance.annualCumulative.toLocaleString('id-ID')}
              </span>
              <p className="text-[10px] text-slate-400 mt-2.5 leading-normal">
                Akumulasi seluruh pendapatan kotor distributor, agen & reseller selama 12 bulan penuh.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold font-mono text-indigo-650 uppercase tracking-widest block">
                  Run-Rate Omset Bulan 12
                </span>
                <span className="text-lg font-extrabold font-sans text-slate-900 block mt-1.5">
                  Rp {annualPerformance.monthlyRunRateEnd.toLocaleString('id-ID')} <span className="text-[10px] text-slate-450 font-normal">/bln</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-3 leading-normal">
                Kapasitas run-rate penjualan bulanan di akhir semester kedua berkat efek pertumbuhan linier.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-bold font-mono text-purple-650 uppercase tracking-widest block">
                  Produk Terjual Setahun
                </span>
                <span className="text-lg font-extrabold font-sans text-slate-900 block mt-1.5">
                  {annualPerformance.totalUnitsYear.toLocaleString('id-ID')} <span className="text-[10px] text-slate-450 font-normal">pcs</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-3 leading-normal">
                Total botol skincare tersalurkan. Memberikan daya tawar luar biasa ke pabrik maklon.
              </p>
            </div>

          </div>

          {/* RECHARTS Multi-Line Chart representation */}
          <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-4 md:p-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/40">
              <div>
                <span className="text-[9.5px] font-extrabold text-slate-450 uppercase tracking-widest block font-mono">
                  Grafik Proyeksi Bulanan Berjenjang
                </span>
                <h5 className="font-sans font-extrabold text-slate-900 text-xs">
                  Simbiosis Kontribusi Penjualan Per Level Mitra (Rp)
                </h5>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[9px] text-slate-500 font-sans font-bold">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span> Dist. Sales
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Agen Sales
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span> Reseller Sales
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-slate-900 rounded-full"></span> Combined Total
                </span>
              </div>
            </div>

            {/* RECHARTS LINE CANVAS */}
            <div className="h-60 sm:h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={forecastData}
                  margin={{ top: 10, right: 10, left: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748B', fontSize: 9.5, fontFamily: 'sans-serif' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(val) => {
                      if (val >= 1e6) return `Rp ${(val / 1e6).toFixed(0)}jt`;
                      return `Rp ${val / 1e3}rb`;
                    }}
                    tick={{ fill: '#64748B', fontSize: 9, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      return [`Rp ${Number(value).toLocaleString('id-ID')}`, name];
                    }}
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      borderRadius: '12px', 
                      border: 'none',
                      color: '#F8FAFC',
                      fontSize: '10.5px'
                    }}
                  />
                  
                  {/* Multi Line series */}
                  <Line 
                    type="monotone" 
                    dataKey="Distributor Sales" 
                    stroke="#DB2777" 
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Agen Sales" 
                    stroke="#4F46E5" 
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Reseller Sales" 
                    stroke="#7E22CE" 
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Total Pendapatan" 
                    stroke="#1E293B" 
                    strokeWidth={3.5}
                    dot={{ r: 3, fill: '#1E293B' }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Live Scale Multi-Tier Report Card */}
            <div className="grid grid-cols-3 gap-3 bg-white border border-slate-150 p-3 rounded-xl text-center text-[10.5px]">
              <div>
                <span className="text-[9px] text-slate-400 font-bold block">Distributor (M12)</span>
                <span className="font-extrabold text-slate-800 font-mono">{annualPerformance.finalDistributors} Mitra</span>
              </div>
              <div className="border-l border-slate-150">
                <span className="text-[9px] text-slate-400 font-bold block">Agen (M12)</span>
                <span className="font-extrabold text-slate-800 font-mono">{annualPerformance.finalAgen} Agen</span>
              </div>
              <div className="border-l border-slate-150">
                <span className="text-[9px] text-slate-400 font-bold block">Reseller (M12)</span>
                <span className="font-extrabold text-slate-800 font-mono">{annualPerformance.finalResellers} Akun</span>
              </div>
            </div>

            {/* Strategic Advice footnote */}
            <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-150 text-[10.5px] leading-relaxed text-amber-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-550 shrink-0 mt-0.5" />
              <div>
                <strong>Nasihat Finansial Pertumbuhan Berjenjang:</strong> Walaupun Distributor (diskon 50%) menyajikan margin profit satuan terkecil per produk untuk brand Anda, volume serap grosir mereka yang gigantik menjadikannya tulang punggung stabilitas kas utama. Lapis dengan reseller otonom berskala ritel untuk meraup laba satuan tinggi.
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
