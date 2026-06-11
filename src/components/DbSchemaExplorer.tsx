/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { RECOMMENDED_TABLES, MOCK_PRODUCTS } from '../dbData';
import { Database, Copy, Check, Calculator, Sparkles, AlertCircle, Layout, ArrowRight, Printer } from 'lucide-react';
import { motion } from 'motion/react';

export default function DbSchemaExplorer() {
  const [selectedTable, setSelectedTable] = useState(RECOMMENDED_TABLES[0]);
  const [copied, setCopied] = useState(false);
  
  // Pricing Simulator State
  const [inputHPP, setInputHPP] = useState(35000);
  const [inputRetail, setInputRetail] = useState(99000);
  
  // Custom distributor markups (%)
  const [distMargin, setDistMargin] = useState(57); // Distributor Price = inputHPP + margin
  const [agentMargin, setAgentMargin] = useState(85); // Agent Price
  const [resellerMargin, setResellerMargin] = useState(128); // Reseller Price

  const copySqlToClipboard = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculations for tier price simulator
  // Base HPP is 100%. We compute levels relative to HPP or as custom increments.
  const distPriceCalc = Math.round(inputHPP * (1 + distMargin / 100));
  const agentPriceCalc = Math.round(inputHPP * (1 + agentMargin / 100));
  const resellerPriceCalc = Math.round(inputHPP * (1 + resellerMargin / 100));

  // Profit margins for Brand Owner on each sale type (Pusat sells to Mitra)
  const marginPusatToDistPercentage = Math.round(((distPriceCalc - inputHPP) / distPriceCalc) * 100);
  const marginPusatToAgentPercentage = Math.round(((agentPriceCalc - inputHPP) / agentPriceCalc) * 100);
  const marginPusatToResellerPercentage = Math.round(((resellerPriceCalc - inputHPP) / resellerPriceCalc) * 100);
  const marginPusatToRetailPercentage = Math.round(((inputRetail - inputHPP) / inputRetail) * 100);

  // Profit margins for Mitras when they resell at Suggested Retail (HET)
  const profitDistToRetail = inputRetail - distPriceCalc;
  const profitAgentToRetail = inputRetail - agentPriceCalc;
  const profitResellerToRetail = inputRetail - resellerPriceCalc;

  const profitDistToRetailPercent = Math.round((profitDistToRetail / inputRetail) * 100);
  const profitAgentToRetailPercent = Math.round((profitAgentToRetail / inputRetail) * 100);
  const profitResellerToRetailPercent = Math.round((profitResellerToRetail / inputRetail) * 100);

  return (
    <div id="db-schema-explorer-container" className="space-y-8">
      {/* Introduction */}
      <div className="bg-gradient-to-r from-pink-50 to-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <h3 className="font-sans text-xl md:text-2xl text-slate-950 font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            Rasio Arsitektur & Skema Database (Efisien & Skalabel)
          </h3>
          <button
            id="print-db-schema-btn"
            onClick={() => window.print()}
            className="no-print shrink-0 flex items-center gap-2 px-4 py-2 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Cetak Dokumen
          </button>
        </div>
        <p className="text-slate-600 text-sm md:text-base leading-relaxed">
          Struktur data di bawah dirancang untuk mengatasi kompleksitas <strong>Multi-Tier Pricing</strong> 
          secara otonom menggunakan skema relasional murni. Alih-alih menduplikasi produk atau membuat kolom harga 
          tersendiri di tabel master, kami merekomendasikan tabel jembatan <code>product_tier_prices</code> agar 
          pemilik brand bisa memperbarui ribuan tier harga produk tanpa merusak integritas riwayat transaksi lama.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Table List & Column Schema Explorer */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col min-h-[500px]">
          <h4 className="font-sans font-bold text-slate-950 mb-4 flex items-center gap-2 text-base">
            <Database className="w-5 h-5 text-pink-500" />
            10 Tabel Inti Ekosistem Keagenan Skincare
          </h4>
          
          {/* Table quick selector chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {RECOMMENDED_TABLES.map((t) => (
              <button
                key={t.tableName}
                id={`btn-${t.tableName}`}
                onClick={() => setSelectedTable(t)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                  selectedTable.tableName === t.tableName
                    ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-100'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {t.tableName}
              </button>
            ))}
          </div>

          {/* Active Table Details */}
          <motion.div
            key={selectedTable.tableName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
              <h5 className="font-mono text-slate-800 font-bold text-sm bg-slate-200/60 px-2 py-0.5 rounded inline-block mb-2">
                CREATE TABLE {selectedTable.tableName}
              </h5>
              <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
                {selectedTable.description}
              </p>
            </div>

            {/* Column properties */}
            <div className="border border-slate-200/80 rounded-xl overflow-hidden mb-4 flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="p-3">Nama Kolom</th>
                      <th className="p-3">Tipe Data</th>
                      <th className="p-3">Constraint</th>
                      <th className="p-3">Deskripsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedTable.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-slate-50 text-slate-700 transition-colors">
                        <td className="p-3 font-mono font-bold text-pink-600">{col.name}</td>
                        <td className="p-3 font-mono text-slate-600">{col.type}</td>
                        <td className="p-3 font-mono text-slate-500 text-[11px] max-w-[150px] truncate" title={col.constraints || '-'}>
                          {col.constraints || '-'}
                        </td>
                        <td className="p-3 text-slate-600 leading-normal">{col.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SQL Script Code block to copy */}
            <div className="relative bg-stone-900 rounded-xl p-4 overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-mono text-stone-400">PostgreSQL DDL script</span>
                <button
                  id="btn-copy-sql"
                  onClick={() => copySqlToClipboard(selectedTable.sqlScript)}
                  className="flex items-center gap-1.5 text-stone-300 hover:text-white transition-colors bg-stone-800 hover:bg-stone-700 px-2.5 py-1 rounded text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin SQL</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-white text-xs font-mono overflow-x-auto max-h-[160px] leading-relaxed p-1">
                {selectedTable.sqlScript}
              </pre>
            </div>
          </motion.div>
        </div>

        {/* Multi-Tier Profit Margin Simulator */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h4 className="font-sans font-bold text-slate-950 mb-1 flex items-center gap-2 text-base">
            <Calculator className="w-5 h-5 text-pink-500" />
            Simulator Harga & Margin Keagenan
          </h4>
          <p className="text-slate-500 text-xs mb-5">
            Bantu Klien UMKM merancang rasio harga aman. Ubah nilai HPP dan diskon margin untuk memantau profit pusat vs agen.
          </p>

          <div className="space-y-4">
            {/* HPP & Retail suggested Prices inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  HPP (Modal Dasar)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-sm font-semibold">Rp</span>
                  <input
                    id="input-hpp"
                    type="number"
                    value={inputHPP}
                    onChange={(e) => setInputHPP(Math.max(1000, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-slate-800 text-sm font-semibold focus:outline-none focus:border-pink-300 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                  Harga Ritel HET (Konsumen)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400 text-sm font-semibold">Rp</span>
                  <input
                    id="input-retail"
                    type="number"
                    value={inputRetail}
                    onChange={(e) => setInputRetail(Math.max(inputHPP, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-slate-800 text-sm font-semibold focus:outline-none focus:border-pink-300 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Separator card */}
            <div className="border-t border-dashed border-slate-100 my-4"></div>

            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <span>Pengaturan Mark-up Dari HPP (%)</span>
            </h5>

            {/* Slider controls */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
              {/* Distributor markup */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Distributor Markup</span>
                  <span className="font-bold text-pink-600">+{distMargin}%</span>
                </div>
                <input
                  id="slider-dist-margin"
                  type="range"
                  min="10"
                  max="150"
                  value={distMargin}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDistMargin(val);
                    if (agentMargin <= val) setAgentMargin(val + 15);
                    if (resellerMargin <= val + 15) setResellerMargin(val + 30);
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>

              {/* Agent markup */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Agen Markup</span>
                  <span className="font-bold text-purple-600">+{agentMargin}%</span>
                </div>
                <input
                  id="slider-agent-margin"
                  type="range"
                  min="20"
                  max="200"
                  value={agentMargin}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > distMargin) {
                      setAgentMargin(val);
                      if (resellerMargin <= val) setResellerMargin(val + 15);
                    }
                  }}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              {/* Reseller markup */}
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Reseller Markup</span>
                  <span className="font-bold text-slate-700">+{resellerMargin}%</span>
                </div>
                <input
                  id="slider-reseller-margin"
                  type="range"
                  min="30"
                  max="250"
                  value={resellerMargin}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > agentMargin) setResellerMargin(val);
                  }}
                  className="w-full h-1.5 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-slate-800"
                />
              </div>
            </div>

            {/* Analysis Results */}
            <div className="space-y-2 mt-4">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                Hasil Analisis Omzet & Profit Margin:
              </span>

              {/* Distributor card */}
              <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-200/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Harga Distributor (RO Min. 250 pcs)</span>
                  <span className="text-sm font-bold text-slate-900">Rp {distPriceCalc.toLocaleString('id-ID')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Margin Pusat / Laba Mitra</span>
                  <span className="text-xs font-bold text-pink-700">
                    Pusat: {marginPusatToDistPercentage}% / Mitra: {profitDistToRetailPercent}%
                  </span>
                </div>
              </div>

              {/* Agent card */}
              <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Harga Agen (RO Min. 50 pcs)</span>
                  <span className="text-sm font-bold text-slate-900">Rp {agentPriceCalc.toLocaleString('id-ID')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Margin Pusat / Laba Mitra</span>
                  <span className="text-xs font-bold text-purple-700">
                    Pusat: {marginPusatToAgentPercentage}% / Mitra: {profitAgentToRetailPercent}%
                  </span>
                </div>
              </div>

              {/* Reseller card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Harga Reseller (RO Min. 10 pcs)</span>
                  <span className="text-sm font-bold text-slate-900">Rp {resellerPriceCalc.toLocaleString('id-ID')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Margin Pusat / Laba Mitra</span>
                  <span className="text-xs font-bold text-slate-700">
                    Pusat: {marginPusatToResellerPercentage}% / Mitra: {profitResellerToRetailPercent}%
                  </span>
                </div>
              </div>

              {/* Suggested consumer */}
              <div className="p-3 bg-slate-950 text-white rounded-xl flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs text-slate-300 block">Harga Jual Konsumen (HET)</span>
                  <span className="text-sm font-bold text-pink-400">Rp {inputRetail.toLocaleString('id-ID')}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-medium">Margin Pusat Bersih (Penjualan Langsung)</span>
                  <span className="text-xs font-bold text-emerald-400">
                    +{marginPusatToRetailPercentage}% Untung Bersih
                  </span>
                </div>
              </div>
            </div>

            {/* Guard block warning */}
            <div className="bg-pink-50/40 p-3 rounded-lg border border-pink-200/30 flex gap-2 items-start mt-3">
              <AlertCircle className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
              <p className="text-[10.5px] text-pink-850 leading-normal">
                <strong>Rekomendasi Ahli:</strong> Margin Distributor disarankan tidak terlalu ketat agar mereka memiliki likuiditas untuk membiayai pengiriman, rekrutmen reseller di daerah, atau sewa gudang cabang regional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
