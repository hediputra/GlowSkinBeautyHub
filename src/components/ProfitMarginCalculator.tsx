/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Percent, 
  HelpCircle, 
  DollarSign, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Coins, 
  UserCheck, 
  TrendingUp, 
  ArrowRight,
  Info
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function ProfitMarginCalculator() {
  // Input parameters for the product
  const [retailMSRP, setRetailMSRP] = useState<number>(120000); // Harga Jual Eceran (MSRP)
  const [productionHPP, setProductionHPP] = useState<number>(35000); // Harga Pokok Produksi (HPP) / Modal

  // Margin/Discount percentages (Diskon dari MSRP)
  const [distributorDiscount, setDistributorDiscount] = useState<number>(50); // 50% discount
  const [agenDiscount, setAgenDiscount] = useState<number>(35); // 35% discount
  const [resellerDiscount, setResellerDiscount] = useState<number>(20); // 20% discount

  // Ensure productionHPP doesn't exceed MSRP
  const validatedHPP = useMemo(() => {
    return Math.min(productionHPP, retailMSRP - 5000);
  }, [productionHPP, retailMSRP]);

  // Calculations for Brand Owner (UMKM) Selling to Tiers
  // 1. Selling to Distributor
  const distributorPrice = useMemo(() => {
    return retailMSRP * (1 - distributorDiscount / 100);
  }, [retailMSRP, distributorDiscount]);

  const brandProfitFromDistributor = useMemo(() => {
    return distributorPrice - validatedHPP;
  }, [distributorPrice, validatedHPP]);

  const brandMarginFromDistributorPercent = useMemo(() => {
    if (distributorPrice === 0) return 0;
    return (brandProfitFromDistributor / distributorPrice) * 100;
  }, [brandProfitFromDistributor, distributorPrice]);

  // 2. Selling to Agen
  const agenPrice = useMemo(() => {
    return retailMSRP * (1 - agenDiscount / 100);
  }, [retailMSRP, agenDiscount]);

  const brandProfitFromAgen = useMemo(() => {
    return agenPrice - validatedHPP;
  }, [agenPrice, validatedHPP]);

  const brandMarginFromAgenPercent = useMemo(() => {
    if (agenPrice === 0) return 0;
    return (brandProfitFromAgen / agenPrice) * 100;
  }, [brandProfitFromAgen, agenPrice]);

  // 3. Selling to Reseller
  const resellerPrice = useMemo(() => {
    return retailMSRP * (1 - resellerDiscount / 100);
  }, [retailMSRP, resellerDiscount]);

  const brandProfitFromReseller = useMemo(() => {
    return resellerPrice - validatedHPP;
  }, [resellerPrice, validatedHPP]);

  const brandMarginFromResellerPercent = useMemo(() => {
    if (resellerPrice === 0) return 0;
    return (brandProfitFromReseller / resellerPrice) * 100;
  }, [brandProfitFromReseller, resellerPrice]);

  // Partner's own margin when they sell to the end user at Retail Price (MSRP)
  const partnerMargins = useMemo(() => {
    const distMargin = retailMSRP - distributorPrice;
    const agenMargin = retailMSRP - agenPrice;
    const resMargin = retailMSRP - resellerPrice;

    return {
      distributor: {
        pricePaid: distributorPrice,
        profitEarnedRaw: distMargin,
        profitPercent: (distMargin / retailMSRP) * 100
      },
      agen: {
        pricePaid: agenPrice,
        profitEarnedRaw: agenMargin,
        profitPercent: (agenMargin / retailMSRP) * 100
      },
      reseller: {
        pricePaid: resellerPrice,
        profitEarnedRaw: resMargin,
        profitPercent: (resMargin / retailMSRP) * 100
      }
    };
  }, [retailMSRP, distributorPrice, agenPrice, resellerPrice]);

  // Recharts Data
  const chartData = useMemo(() => {
    return [
      {
        name: 'Distributor',
        'Harga Beli': Math.round(distributorPrice),
        'Keuntungan Owner': Math.round(brandProfitFromDistributor),
        'Keuntungan Partner': Math.round(partnerMargins.distributor.profitEarnedRaw),
        HPP: Math.round(validatedHPP)
      },
      {
        name: 'Agen',
        'Harga Beli': Math.round(agenPrice),
        'Keuntungan Owner': Math.round(brandProfitFromAgen),
        'Keuntungan Partner': Math.round(partnerMargins.agen.profitEarnedRaw),
        HPP: Math.round(validatedHPP)
      },
      {
        name: 'Reseller',
        'Harga Beli': Math.round(resellerPrice),
        'Keuntungan Owner': Math.round(brandProfitFromReseller),
        'Keuntungan Partner': Math.round(partnerMargins.reseller.profitEarnedRaw),
        HPP: Math.round(validatedHPP)
      }
    ];
  }, [
    distributorPrice, brandProfitFromDistributor, partnerMargins,
    agenPrice, brandProfitFromAgen, resellerPrice, brandProfitFromReseller, validatedHPP
  ]);

  return (
    <div id="profit-margin-calculator-wrapper" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-pink-50 border border-pink-100 text-pink-600 rounded-2xl shrink-0">
            <Percent className="w-6 h-6 animate-pulse text-pink-600" />
          </div>
          <div>
            <h4 className="font-sans font-extrabold text-slate-900 text-base md:text-lg flex items-center gap-1.5">
              Kalkulator Margin Profit & Harga Berjenjang
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Multi-Tier Engine
              </span>
            </h4>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed font-sans">
              Simulasikan struktur keuntungan produk Anda untuk setiap level kemitraan (Distributor, Agen, vs Reseller) demi menjamin loyalitas rantai suplai.
            </p>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: INPUT OPTIONS & REALTIME CALCULATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Inputs & Sliders) - 5 Cols */}
        <div className="lg:col-span-5 bg-slate-50/50 border border-slate-100 rounded-2xl p-5 space-y-5">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200/50">
            <Layers className="w-4 h-4 text-pink-500" />
            <span className="text-xs font-bold text-slate-900 uppercase">Input Struktur Biaya Unit</span>
          </div>

          {/* Pricing inputs */}
          <div className="space-y-4">
            
            {/* Input 1: MSRP */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-650 flex items-center gap-1">
                  Harga Jual Konsumen (MSRP)
                </span>
                <span className="font-mono text-slate-900 bg-white px-2.5 py-0.5 border border-slate-200 rounded-lg shadow-xs">
                  Rp {retailMSRP.toLocaleString('id-ID')}
                </span>
              </div>
              <input
                id="slider-msrp-price"
                type="range"
                min="20000"
                max="300000"
                step="5000"
                value={retailMSRP}
                onChange={(e) => setRetailMSRP(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-650"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>Rp 20.000</span>
                <span>Rp 160.000</span>
                <span>Rp 300.000</span>
              </div>
            </div>

            {/* Input 2: COGS / HPP */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-650 flex items-center gap-1">
                  HPP Produksi / Modal Satuan
                </span>
                <span className="font-mono text-slate-900 bg-white px-2.5 py-0.5 border border-slate-200 rounded-lg shadow-xs">
                  Rp {validatedHPP.toLocaleString('id-ID')}
                </span>
              </div>
              <input
                id="slider-hpp-price"
                type="range"
                min="5000"
                max="150000"
                step="2500"
                value={productionHPP}
                onChange={(e) => setProductionHPP(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>Rp 5.000</span>
                <span>Rp 77.500</span>
                <span>Rp 150.000</span>
              </div>
            </div>

          </div>

          <div className="flex items-center gap-1.5 pt-2 pb-2 border-b border-slate-200/50">
            <Percent className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold text-slate-900 uppercase">Potongan Harga Per Level (% MSRP)</span>
          </div>

          {/* Tier Discounts Slider Input */}
          <div className="space-y-4">
            
            {/* Distributor Discount Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-650 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-pink-600 rounded-full"></span>
                  Distributor (Diskon)
                </span>
                <span className="font-mono text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-md text-[11px] border border-pink-100">
                  {distributorDiscount}% Off
                </span>
              </div>
              <input
                id="slider-distributor-discount"
                type="range"
                min="40"
                max="65"
                step="1"
                value={distributorDiscount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setDistributorDiscount(val);
                  // Maintain hierarchy cascades
                  if (val <= agenDiscount) setAgenDiscount(Math.max(15, val - 10));
                }}
                className="w-full h-1.2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
              />
              <span className="text-[9px] text-slate-400 font-semibold block leading-tight font-sans">
                Harga Jual ke Distributor: <span className="text-slate-700 font-bold font-mono">Rp {distributorPrice.toLocaleString('id-ID')}</span>
              </span>
            </div>

            {/* Agen Discount Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-650 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
                  Agen (Diskon)
                </span>
                <span className="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md text-[11px] border border-indigo-100">
                  {agenDiscount}% Off
                </span>
              </div>
              <input
                id="slider-agen-discount"
                type="range"
                min="25"
                max="45"
                step="1"
                value={agenDiscount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  // Ensure scale constraints
                  if (val < distributorDiscount) {
                    setAgenDiscount(val);
                    if (val <= resellerDiscount) setResellerDiscount(Math.max(5, val - 10));
                  }
                }}
                className="w-full h-1.2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <span className="text-[9px] text-slate-400 font-semibold block leading-tight font-sans">
                Harga Jual ke Agen: <span className="text-slate-700 font-bold font-mono">Rp {agenPrice.toLocaleString('id-ID')}</span>
              </span>
            </div>

            {/* Reseller Discount Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-650 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-purple-600 rounded-full"></span>
                  Reseller (Diskon)
                </span>
                <span className="font-mono text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-md text-[11px] border border-purple-100">
                  {resellerDiscount}% Off
                </span>
              </div>
              <input
                id="slider-reseller-discount"
                type="range"
                min="10"
                max="25"
                step="1"
                value={resellerDiscount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val < agenDiscount) setResellerDiscount(val);
                }}
                className="w-full h-1.2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <span className="text-[9px] text-slate-400 font-semibold block leading-tight font-sans">
                Harga Jual ke Reseller: <span className="text-slate-700 font-bold font-mono">Rp {resellerPrice.toLocaleString('id-ID')}</span>
              </span>
            </div>

          </div>

        </div>

        {/* Right Column (Live Results & Visual Layouts) - 7 Cols */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* DISTRIBUTOR METRIC CARD */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-wider font-mono">Distributor Sell</span>
                  <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                </div>
                <div className="mt-2 font-mono">
                  <p className="text-[9px] text-slate-450 uppercase font-bold">Harga Jual Unit</p>
                  <p className="text-base font-extrabold text-slate-900">
                    Rp {distributorPrice.toLocaleString('id-ID')}
                  </p>
                  
                  <p className="text-[9px] text-slate-450 uppercase font-bold mt-2">Margin UMKM (Laba)</p>
                  <p className="text-sm font-bold text-slate-800">
                    Rp {brandProfitFromDistributor.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-200/60 pt-2.5 mt-3 text-[10px] text-slate-500">
                Laba Owner: <strong className="text-slate-800 font-bold">{brandMarginFromDistributorPercent.toFixed(0)}%</strong>
              </div>
            </div>

            {/* AGEN METRIC CARD */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider font-mono">Agen Sell</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                </div>
                <div className="mt-2 font-mono">
                  <p className="text-[9px] text-slate-450 uppercase font-bold">Harga Jual Unit</p>
                  <p className="text-base font-extrabold text-slate-900">
                    Rp {agenPrice.toLocaleString('id-ID')}
                  </p>
                  
                  <p className="text-[9px] text-slate-450 uppercase font-bold mt-2">Margin UMKM (Laba)</p>
                  <p className="text-sm font-bold text-slate-800">
                    Rp {brandProfitFromAgen.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-200/60 pt-2.5 mt-3 text-[10px] text-slate-500">
                Laba Owner: <strong className="text-slate-800 font-bold">{brandMarginFromAgenPercent.toFixed(0)}%</strong>
              </div>
            </div>

            {/* RESELLER METRIC CARD */}
            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider font-mono">Reseller Sell</span>
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                </div>
                <div className="mt-2 font-mono">
                  <p className="text-[9px] text-slate-450 uppercase font-bold">Harga Jual Unit</p>
                  <p className="text-base font-extrabold text-slate-900">
                    Rp {resellerPrice.toLocaleString('id-ID')}
                  </p>
                  
                  <p className="text-[9px] text-slate-450 uppercase font-bold mt-2">Margin UMKM (Laba)</p>
                  <p className="text-sm font-bold text-slate-800">
                    Rp {brandProfitFromReseller.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-200/60 pt-2.5 mt-3 text-[10px] text-slate-500">
                Laba Owner: <strong className="text-slate-800 font-bold">{brandMarginFromResellerPercent.toFixed(0)}%</strong>
              </div>
            </div>

          </div>

          {/* VISUAL CHARTS BREAKDOWN: STACKED BAR CHART SHOWING HPP vs BRAND PROFIT vs PARTNER MARGIN */}
          <div className="bg-slate-50/50 rounded-2xl border border-slate-200/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-extrabold text-slate-450 uppercase tracking-wider font-mono">
                Visualisasi Alokasi Margin Unit (Rp)
              </span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1 font-mono">
                <Sparkles className="w-3.5 h-3.5" /> MSRP: Rp {retailMSRP.toLocaleString('id-ID')}
              </span>
            </div>

            {/* BAR CHART CANVAS */}
            <div className="h-44 sm:h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#64748B' }} stroke="#CBD5E1" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#475569', fontWeight: 'bold' }} stroke="#CBD5E1" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '10px', color: '#FFF', fontSize: '10.5px' }}
                    formatter={(value: any, name: string) => {
                      return [`Rp ${Number(value).toLocaleString('id-ID')}`, name];
                    }}
                  />
                  <Legend verticalAlign="top" height={24} iconSize={8} wrapperStyle={{ fontSize: '9.5px', fontFamily: 'sans-serif' }} />
                  {/* Stacked bars represent elements that sum up to MSRP or sell prices */}
                  <Bar dataKey="HPP" stackId="a" fill="#94A3B8" name="Modal Produks / HPP" radius={[4, 0, 0, 4]} />
                  <Bar dataKey="Keuntungan Owner" stackId="a" fill="#0EA5E9" name="Laba Bersih Owner (UMKM)" />
                  <Bar dataKey="Keuntungan Partner" stackId="a" fill="#10B981" name="Laba Re-seller / Mitra Anda" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Strategic Consultation text */}
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-150 text-[10.5px] leading-relaxed text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>Tips Kemitraan:</strong> Selisih warna hijau mewakili magnet margin keuntungan bagi mitra Anda saat menjual ke retail eceran. Semakin tinggi diskon margin partner yang Anda tentukan, semakin bersemangat mitra mendistribusikan produk Anda secara masif di pasar lokal.
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
