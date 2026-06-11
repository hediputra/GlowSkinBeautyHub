/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MessageSquare, 
  Copy, 
  Check, 
  Flame, 
  Filter,
  RefreshCw,
  Coins,
  DollarSign,
  Medal,
  Store,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { MOCK_MITRAS } from '../dbData';
import { MitraAccount, MitraTier } from '../types';

interface MitraLeaderboardItem extends MitraAccount {
  trend: 'UP' | 'DOWN' | 'STEADY';
  rankChange: number;
}

export default function MitraLeaderboard() {
  // Rich local state initialized with MOCK_MITRAS, enhanced with trends
  const [mitras, setMitras] = useState<MitraLeaderboardItem[]>(() => {
    return MOCK_MITRAS.map((mitra, index) => {
      // Seed some initial trends
      let trend: 'UP' | 'DOWN' | 'STEADY' = 'STEADY';
      let rankChange = 0;
      if (index === 0) { trend = 'UP'; rankChange = 2; }
      else if (index === 1) { trend = 'UP'; rankChange = 1; }
      else if (index === 2) { trend = 'DOWN'; rankChange = -1; }
      
      return {
        ...mitra,
        trend,
        rankChange
      };
    });
  });

  const [activeTierFilter, setActiveTierFilter] = useState<'ALL' | MitraTier>('ALL');
  const [activeSortBy, setActiveSortBy] = useState<'SPENT' | 'POINTS'>('SPENT');
  const [selectedMitraId, setSelectedMitraId] = useState<string | null>('usr-001');
  const [copiedText, setCopiedText] = useState(false);
  const [congratulatoryMessage, setCongratulatoryMessage] = useState('');

  // Settle customized WhatsApp congratulatory template message
  React.useEffect(() => {
    const selected = mitras.find(m => m.id === selectedMitraId);
    if (selected) {
      const tierLabel = selected.tier.charAt(0).toUpperCase() + selected.tier.slice(1);
      const text = `Halo Kak ${selected.name}! 🌟\n\nSelamat! Toko Anda *${selected.shopName}* (${selected.city}) berhasil menempati peringkat premium dalam *Mitra Leaderboard BeautyHub* minggu ini!\n\nDetail Performa Anda:\n• Level Mitra: ${tierLabel}\n• Poin Terkumpul: *${selected.pointsAccumulated} Poin*\n• Total Belanja RO: *Rp ${selected.totalOrderSpent.toLocaleString('id-ID')}*\n\nTerus tingkatkan repeat order Anda dan klaim reward emas antam atau motor impian di portal kemitraan. Terima kasih atas loyalitas hebat Anda bersama brand lokal kami! 🚀❤️`;
      setCongratulatoryMessage(text);
    }
  }, [selectedMitraId, mitras]);

  // Handle live simulated sales growth
  const simulateSalesGrowth = () => {
    setMitras(prevMitras => {
      // Copy list
      const updated = [...prevMitras];
      
      // Select 1 or 2 random partners to receive a massive repeat order burst
      const randomIndex = Math.floor(Math.random() * updated.length);
      const secondRandom = (randomIndex + 1) % updated.length;
      
      // Give them a random sales booster
      const pointBooster = Math.floor(Math.random() * 45) + 15; // 15-60 points
      const salesBooster = pointBooster * 200000; // Rp 3jt - Rp 12jt spent booster
      
      updated[randomIndex] = {
        ...updated[randomIndex],
        pointsAccumulated: updated[randomIndex].pointsAccumulated + pointBooster,
        totalOrderSpent: updated[randomIndex].totalOrderSpent + salesBooster,
        totalOrdersCount: updated[randomIndex].totalOrdersCount + 1,
      };

      updated[secondRandom] = {
        ...updated[secondRandom],
        pointsAccumulated: updated[secondRandom].pointsAccumulated + Math.floor(pointBooster / 2),
        totalOrderSpent: updated[secondRandom].totalOrderSpent + Math.floor(salesBooster / 2),
        totalOrdersCount: updated[secondRandom].totalOrdersCount + 1,
      };

      // Recalculate ranks based on selected sort metric
      const sortedMetric = [...updated].sort((a, b) => {
        if (activeSortBy === 'SPENT') {
          return b.totalOrderSpent - a.totalOrderSpent;
        } else {
          return b.pointsAccumulated - a.pointsAccumulated;
        }
      });

      // Map back to update trends relative to old positions
      return updated.map(m => {
        const oldIndex = prevMitras.findIndex(pm => pm.id === m.id);
        const newIndex = sortedMetric.findIndex(sm => sm.id === m.id);
        
        let trend: 'UP' | 'DOWN' | 'STEADY' = 'STEADY';
        let rankChange = oldIndex - newIndex;

        if (rankChange > 0) {
          trend = 'UP';
        } else if (rankChange < 0) {
          trend = 'DOWN';
          rankChange = Math.abs(rankChange);
        } else {
          trend = m.trend; // preserve or default
          rankChange = 0;
        }

        return {
          ...m,
          trend,
          rankChange
        };
      });
    });
  };

  // Reset leaderboard to initial values
  const resetLeaderboard = () => {
    const fresh = MOCK_MITRAS.map((mitra, index) => {
      let trend: 'UP' | 'DOWN' | 'STEADY' = 'STEADY';
      let rankChange = 0;
      if (index === 0) { trend = 'UP'; rankChange = 2; }
      else if (index === 1) { trend = 'UP'; rankChange = 1; }
      else if (index === 2) { trend = 'DOWN'; rankChange = -1; }
      return {
        ...mitra,
        trend,
        rankChange
      };
    });
    setMitras(fresh);
    setSelectedMitraId('usr-001');
  };

  // Filter & Sort core partners list
  const filteredAndSortedMitras = mitras
    .filter(m => activeTierFilter === 'ALL' || m.tier === activeTierFilter)
    .sort((a, b) => {
      if (activeSortBy === 'SPENT') {
        return b.totalOrderSpent - a.totalOrderSpent;
      } else {
        return b.pointsAccumulated - a.pointsAccumulated;
      }
    });

  // Top 3 partners for the Podiums
  const topThree = filteredAndSortedMitras.slice(0, 3);
  const reorderedPodiums = [];
  if (topThree[1]) reorderedPodiums.push({ item: topThree[1], rank: 2 }); // Rank 2 on Left
  if (topThree[0]) reorderedPodiums.push({ item: topThree[0], rank: 1 }); // Rank 1 in Center
  if (topThree[2]) reorderedPodiums.push({ item: topThree[2], rank: 3 }); // Rank 3 on Right

  // Rank 4+ partners for the list
  const remainingMitras = filteredAndSortedMitras.slice(3);

  const handleCopy = () => {
    navigator.clipboard.writeText(congratulatoryMessage);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div id="mitra-leaderboard-panel" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 border border-amber-100 shrink-0">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-sans font-extrabold text-slate-900 text-base md:text-lg flex items-center gap-1.5">
              Mitra Leaderboard & Ranking Performa
              <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                GlowSkin Live
              </span>
            </h4>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
              Pantau mitra agen, distributor, dan reseller dengan volume order dan akumulasi poin loyalitas tertinggi secara berkala.
            </p>
          </div>
        </div>

        {/* Action simulators */}
        <div className="flex items-center gap-2">
          <button
            id="btn-simulate-sales"
            onClick={simulateSalesGrowth}
            className="flex items-center gap-1.5 px-4.5 py-2.5 bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-pink-150 cursor-pointer hover:scale-[1.02]"
          >
            <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Simulasikan Belanja Mitra</span>
          </button>

          <button
            id="btn-reset-leaderboard"
            onClick={resetLeaderboard}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Reset Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* FILTER & SORT LEVEL TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
        
        {/* Tier filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider px-2 pr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            id="filter-leaderboard-all"
            onClick={() => setActiveTierFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTierFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            Semua Tingkat
          </button>
          <button
            id="filter-leaderboard-distributor"
            onClick={() => setActiveTierFilter('distributor')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTierFilter === 'distributor'
                ? 'bg-pink-600 text-white'
                : 'text-slate-650 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            Distributor
          </button>
          <button
            id="filter-leaderboard-agen"
            onClick={() => setActiveTierFilter('agen')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTierFilter === 'agen'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-655 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            Agen
          </button>
          <button
            id="filter-leaderboard-reseller"
            onClick={() => setActiveTierFilter('reseller')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTierFilter === 'reseller'
                ? 'bg-purple-600 text-white'
                : 'text-slate-660 hover:bg-slate-200/50 hover:text-slate-900'
            }`}
          >
            Reseller
          </button>
        </div>

        {/* Sort switch */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider px-1">Urutan:</span>
          <div className="bg-white border border-slate-200 rounded-lg p-0.5 flex gap-0.5">
            <button
              id="sort-leaderboard-spent"
              onClick={() => setActiveSortBy('SPENT')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                activeSortBy === 'SPENT'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Volume RO (Rp)
            </button>
            <button
              id="sort-leaderboard-points"
              onClick={() => setActiveSortBy('POINTS')}
              className={`px-2.5 py-1 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                activeSortBy === 'POINTS'
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Poin Loyalitas
            </button>
          </div>
        </div>

      </div>

      {/* TOP 3 PODIUM DISPLAY */}
      {topThree.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end pt-4">
          
          <div className="md:col-span-7 bg-slate-50/40 border border-slate-100 rounded-2xl p-4 md:p-6 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Podium Pemuncak Kinerja Wilayah
              </span>
            </div>

            {/* Simulated Podium container */}
            <div className="flex items-end justify-center gap-3 sm:gap-6 pt-16 max-w-md mx-auto w-full">
              
              {reorderedPodiums.map(({ item, rank }) => {
                const colors = {
                  1: { border: 'border-amber-400', banner: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-800' },
                  2: { border: 'border-slate-350', banner: 'bg-slate-400', bg: 'bg-slate-100', text: 'text-slate-800' },
                  3: { border: 'border-amber-652', banner: 'bg-amber-600', bg: 'bg-orange-50', text: 'text-amber-900' }
                }[rank] || { border: 'border-slate-200', banner: 'bg-slate-200', bg: 'bg-white', text: 'text-slate-700' };

                const heightClass = {
                  1: 'h-36 sm:h-44 bg-gradient-to-t from-amber-100/70 to-amber-50/50 border-amber-300 shadow bg-opacity-70',
                  2: 'h-28 sm:h-34 bg-slate-100/50 border-slate-200',
                  3: 'h-22 sm:h-26 bg-emerald-50/10 bg-orange-50/30 border-orange-200'
                }[rank];

                return (
                  <motion.div
                    key={item.id}
                    layoutId={`podium-${item.id}`}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={() => setSelectedMitraId(item.id)}
                    className="flex flex-col items-center flex-1 cursor-pointer group"
                  >
                    {/* User profile bubble above column */}
                    <div className="relative mb-2 flex flex-col items-center">
                      
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-sans font-extrabold text-xs shadow-md group-hover:scale-105 transition-transform ${colors.border} bg-white`}>
                        {item.name.charAt(0)}
                      </div>
                      
                      {/* Badge Ribbon */}
                      <div className={`absolute -bottom-1 text-[9px] text-white font-extrabold px-1.5 py-0.2 rounded-full shadow-sm ${colors.banner}`}>
                        #{rank}
                      </div>
                    </div>

                    {/* Name block */}
                    <div className="text-center w-full px-1 mb-1">
                      <p className="text-[11px] font-extrabold text-slate-800 truncate leading-tight">{item.name.split(' ')[0]}</p>
                      <p className="text-[9px] text-slate-450 truncate font-mono uppercase tracking-wider">{item.city}</p>
                    </div>

                    {/* Column Pillar */}
                    <div className={`w-full rounded-t-xl border border-b-0 flex flex-col items-center justify-start p-2 text-center relative overflow-hidden ${heightClass} ${selectedMitraId === item.id ? 'ring-2 ring-pink-500' : ''}`}>
                      <div className="space-y-1.5 pt-2">
                        {/* Display metric */}
                        {activeSortBy === 'SPENT' ? (
                          <div className="flex flex-col max-w-full truncate">
                            <span className="text-[10px] font-mono font-extrabold text-slate-800 leading-tight">
                              Rp {(item.totalOrderSpent / 1e6).toFixed(1)}jt
                            </span>
                            <span className="text-[8px] text-slate-450 uppercase block font-bold leading-normal">
                              Belanja RO
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col max-w-full">
                            <span className="text-[10px] font-mono font-extrabold text-pink-600 leading-tight">
                              {item.pointsAccumulated}
                            </span>
                            <span className="text-[8px] text-slate-450 uppercase block font-bold leading-normal">
                              Poin
                            </span>
                          </div>
                        )}

                        {/* Order count badge */}
                        <div className="bg-white/85 text-slate-700 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-slate-200">
                          {item.totalOrdersCount} Resi
                        </div>
                      </div>

                      {/* Sparkle background decoration on Rank 1 */}
                      {rank === 1 && (
                        <div className="absolute -bottom-3 text-amber-500/10 pointer-events-none">
                          <Trophy className="w-16 h-16" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

            </div>
          </div>

          {/* ACTIVE SELECTED PARTNER & CONGRATULATIONS PANEL */}
          <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-5 border border-slate-800 shadow-xl text-white h-full flex flex-col justify-between">
            {(() => {
              const selectedMitra = mitras.find(m => m.id === selectedMitraId) || topThree[0];
              if (!selectedMitra) return null;

              return (
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-extrabold text-pink-500 uppercase tracking-widest bg-pink-950/40 px-2 py-0.5 border border-pink-900/40 rounded-md">
                        Apresiasi Kemitraan Otonom
                      </span>
                      <div className="flex items-center gap-1 font-mono text-[9px] text-slate-400">
                        <Store className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{selectedMitra.shopName.slice(0, 20)}...</span>
                      </div>
                    </div>

                    <div className="pb-3 border-b border-slate-800/80">
                      <p className="text-sm font-sans font-extrabold text-white line-clamp-1">
                        {selectedMitra.name}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-pink-500" /> Profil: {selectedMitra.city}, {selectedMitra.province}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 bg-slate-950/50 p-3 rounded-xl border border-slate-850/50 font-mono">
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider block">Akumulasi Belanja</span>
                        <span className="text-xs font-bold text-white block mt-0.5">
                          Rp {selectedMitra.totalOrderSpent.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider block">Saldo Poin</span>
                        <span className="text-xs font-bold text-amber-400 block mt-0.5 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" /> {selectedMitra.pointsAccumulated} Poin
                        </span>
                      </div>
                    </div>

                    {/* Message Box */}
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-450 uppercase flex items-center gap-1 font-mono">
                        <MessageSquare className="w-3.5 h-3.5 text-pink-500" />
                        Pesan Selamat WhatsApp (Generated):
                      </span>
                      <textarea
                        className="w-full bg-slate-950 text-slate-300 p-2.5 rounded-lg border border-slate-800 font-sans text-[10.5px] leading-relaxed resize-none focus:outline-none focus:border-pink-500 h-28"
                        value={congratulatoryMessage}
                        onChange={(e) => setCongratulatoryMessage(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      id="btn-copy-wa-message"
                      onClick={handleCopy}
                      className="w-full py-2.5 rounded-xl text-xs font-bold font-sans bg-pink-600 hover:bg-pink-500 text-white transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.01]"
                    >
                      {copiedText ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-300" />
                          <span>Berhasil Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Pesan WA Syukuran</span>
                        </>
                      )}
                    </button>
                    <p className="text-[9px] text-slate-500 text-center mt-1.5 leading-normal">
                      Gunakan pesan di atas untuk langsung diaplikasikan ke WhatsApp Blast guna memupuk loyalitas kemitraan lokal Anda secara instan.
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl">
          <p className="text-slate-500 text-sm">Tidak ada mitra terpilih untuk filter terpilih ini.</p>
        </div>
      )}

      {/* DETAILED RATING LIST */}
      <div className="space-y-3.5 pt-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-extrabold text-slate-950 uppercase tracking-widest block">
            Daftar Peringkat Lengkap
          </span>
          <span className="text-[10px] text-slate-450 font-medium">
            Menampilkan {filteredAndSortedMitras.length} dari {mitras.length} Mitra Kosmetik Aktif
          </span>
        </div>

        {/* List mapping with Framer Motion */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedMitras.map((mitra, index) => {
              const isSelected = mitra.id === selectedMitraId;
              const globalRank = index + 1;

              // Rank accent styles
              const rankStyles = {
                1: 'bg-amber-100 text-amber-800 border-amber-300',
                2: 'bg-slate-100 text-slate-800 border-slate-300',
                3: 'bg-orange-100 text-orange-850 border-orange-300'
              }[globalRank] || 'bg-slate-50 text-slate-550 border-slate-200';

              return (
                <motion.div
                  key={mitra.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onClick={() => setSelectedMitraId(mitra.id)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50/20 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    
                    {/* Position Label Or Medal Icon for Rank 1-3 */}
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-sans font-extrabold text-xs shrink-0 ${rankStyles}`}>
                      {globalRank <= 3 ? (
                        <Medal className="w-4 h-4" />
                      ) : (
                        globalRank
                      )}
                    </div>

                    {/* Profile avatar text */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-extrabold text-slate-900 text-sm">{mitra.name}</span>
                        
                        {/* Tier labels */}
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          mitra.tier === 'distributor' 
                            ? 'bg-pink-100 text-pink-700' 
                            : mitra.tier === 'agen' 
                            ? 'bg-indigo-100 text-indigo-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {mitra.tier}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500 font-sans mt-0.5">
                        <span className="font-semibold text-slate-650">{mitra.shopName}</span>
                        <span className="text-slate-300">•</span>
                        <span>{mitra.city}, {mitra.province}</span>
                        <span className="text-slate-300">•</span>
                        <span className="font-mono text-slate-500 font-bold">{mitra.totalOrdersCount} Repeat Orders</span>
                      </div>
                    </div>
                  </div>

                  {/* Right hand side metrics & trend indicators */}
                  <div className="flex items-center gap-4.5 text-right font-mono">
                    
                    <div className="space-y-0.5">
                      {/* Highlighted primary metric based on sort switcher */}
                      <p className="text-xs font-extrabold text-slate-900">
                        Rp {mitra.totalOrderSpent.toLocaleString('id-ID')}
                      </p>
                      <p className="text-[10px] text-slate-450 font-bold flex items-center justify-end gap-1">
                        <Coins className="w-3 h-3 text-pink-600 shrink-0" />
                        <span>{mitra.pointsAccumulated} Poin</span>
                      </p>
                    </div>

                    {/* Trend and rank placement delta */}
                    <div className="w-12 flex flex-col items-center justify-center shrink-0 border-l border-slate-100 pl-3">
                      {mitra.trend === 'UP' && (
                        <div className="flex flex-col items-center text-emerald-600 text-center" title="Tren Naik">
                          <TrendingUp className="w-4 h-4 animate-bounce" />
                          <span className="text-[8.5px] font-bold font-mono">+{mitra.rankChange || 1} M</span>
                        </div>
                      )}
                      {mitra.trend === 'DOWN' && (
                        <div className="flex flex-col items-center text-red-500 text-center" title="Tren Turun">
                          <TrendingDown className="w-4 h-4" />
                          <span className="text-[8.5px] font-bold font-mono">-{mitra.rankChange || 1} M</span>
                        </div>
                      )}
                      {mitra.trend === 'STEADY' && (
                        <div className="flex flex-col items-center text-slate-400 text-center" title="Keadaan Stabil">
                          <Minus className="w-4 h-4" />
                          <span className="text-[8.5px] font-bold font-mono">STABIL</span>
                        </div>
                      )}
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
