/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { REGIONS_LOMBOK_MEDAN } from '../dbData';
import { Search, MapPin, Phone, MessageSquare, ExternalLink, Sparkles, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ConsumerDemo() {
  const [selectedProvince, setSelectedProvince] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showWaMock, setShowWaMock] = useState(false);
  const [activeMitraMessage, setActiveMitraMessage] = useState<any>(null);

  // Dynamically extract unique provinces
  const provinces = Array.from(new Set(REGIONS_LOMBOK_MEDAN.map(m => m.province))).sort();

  // Dynamically get unique cities
  const getCitiesByProvince = (prov: string) => {
    const list = prov === 'ALL'
      ? REGIONS_LOMBOK_MEDAN
      : REGIONS_LOMBOK_MEDAN.filter(m => m.province === prov);
    return Array.from(new Set(list.map(m => m.city))).sort();
  };

  // Filter mitras based on location and search query
  const filteredMitras = REGIONS_LOMBOK_MEDAN.filter(m => {
    const matchesProvince = selectedProvince === 'ALL' || m.province === selectedProvince;
    const matchesCity = selectedCity === 'ALL' || m.city === selectedCity;
    const matchesTier = selectedTier === 'ALL' || m.tier === selectedTier;
    
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = query === '' ||
      m.name.toLowerCase().includes(query) ||
      m.shopName.toLowerCase().includes(query) ||
      m.city.toLowerCase().includes(query) ||
      m.province.toLowerCase().includes(query);

    return matchesProvince && matchesCity && matchesTier && matchesSearch;
  });

  const triggerMockWhatsApp = (mitra: any) => {
    setActiveMitraMessage({
      ...mitra,
      textTemplate: `Halo Kak ${mitra.name} (${mitra.shopName}), saya berkunjung dari Website Resmi Brand Skincare. Saya mau order item 'Glow Radiance Bright Serum' seharga Rp 99.000 sebanyak 1 pcs. Apakah stok tersedia di wilayah ${mitra.city} dan berapa estimasi ongkirnya? Terima kasih!`
    });
    setShowWaMock(true);
  };

  return (
    <div id="consumer-demo-container" className="space-y-6">
      
      {/* Intro card */}
      <div className="bg-pink-50/50 border border-slate-200/80 p-5 rounded-2xl shadow-sm">
        <h3 className="font-sans text-lg md:text-xl text-slate-950 font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
          Komponen Publik: Pencarian Agen Kosmetik Terdekat
        </h3>
        <p className="text-slate-600 text-xs md:text-sm mt-1 leading-relaxed">
          Fitur ini berada di landing-page publik e-commerce brand kosmetik Anda. Konsumen tidak perlu membayar ongkos kirim mahal dari pabrik pusat. Cukup cari wilayah kota Anda, sapa Agen Terdekat kami melalui WhatsApp, dan produk langsung diantar di hari yang sama!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Search layout Mock */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Antarmuka Konsumen</span>
            <h4 className="font-sans font-bold text-slate-900 text-sm mt-0.5">
              Cari Outlet & Nomor WhatsApp Distributor Terdekat Anda
            </h4>
          </div>

          {/* Form Filter with search bar and dynamic selects */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/50">
            {/* Search query box */}
            <div className="relative">
              <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Nama / Toko / Kata Kunci</label>
              <div className="relative">
                <input
                  id="input-search-consumer"
                  type="text"
                  placeholder="Ketik nama toko, kota, atau nama pemilik agen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 py-2.5 pl-9 pr-4 rounded-xl text-xs focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all placeholder:text-slate-400"
                />
                <Search className="w-4 h-4 text-slate-450 absolute left-3 top-3.5" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Pilih Provinsi</label>
                <select
                  id="select-province-consumer"
                  value={selectedProvince}
                  onChange={(e) => {
                    const prov = e.target.value;
                    setSelectedProvince(prov);
                    setSelectedCity('ALL'); // reset city on province selection change
                  }}
                  className="w-full bg-white border border-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
                >
                  <option value="ALL">Semua Provinsi ({provinces.length})</option>
                  {provinces.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Pilih Kota / Kabupaten</label>
                <select
                  id="select-city-consumer"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
                >
                  <option value="ALL">Semua Kota ({getCitiesByProvince(selectedProvince).length})</option>
                  {getCitiesByProvince(selectedProvince).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1 tracking-wider uppercase">Kategori Kemitraan</label>
                <select
                  id="select-tier-consumer"
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full bg-white border border-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs focus:outline-none focus:border-pink-500 transition-colors cursor-pointer"
                >
                  <option value="ALL">Semua Kemitraan</option>
                  <option value="distributor">Distributor</option>
                  <option value="agen">Agen</option>
                  <option value="reseller">Reseller</option>
                </select>
              </div>
            </div>

            {/* Quick Helper Badge filters */}
            {(selectedProvince !== 'ALL' || selectedCity !== 'ALL' || selectedTier !== 'ALL' || searchQuery !== '') && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-200/50">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Filter Aktif:</span>
                
                {selectedProvince !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-pink-50 border border-pink-100 text-pink-700 text-[10px] font-bold rounded-lg leading-normal">
                    Provinsi: {selectedProvince}
                    <button onClick={() => setSelectedProvince('ALL')} className="hover:text-pink-900 ml-0.5"><X className="w-3 h-3 stroke-[2.5px]" /></button>
                  </span>
                )}

                {selectedCity !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg leading-normal">
                    Kota: {selectedCity}
                    <button onClick={() => setSelectedCity('ALL')} className="hover:text-indigo-900 ml-0.5"><X className="w-3 h-3 stroke-[2.5px]" /></button>
                  </span>
                )}

                {selectedTier !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold rounded-lg leading-normal">
                    Level: {selectedTier.toUpperCase()}
                    <button onClick={() => setSelectedTier('ALL')} className="hover:text-purple-900 ml-0.5"><X className="w-3 h-3 stroke-[2.5px]" /></button>
                  </span>
                )}

                {searchQuery !== '' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 border border-slate-250 text-slate-700 text-[10px] font-bold rounded-lg leading-normal">
                    Kata Kunci: "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-slate-900 ml-0.5"><X className="w-3 h-3 stroke-[2.5px]" /></button>
                  </span>
                )}

                <button
                  onClick={() => {
                    setSelectedProvince('ALL');
                    setSelectedCity('ALL');
                    setSelectedTier('ALL');
                    setSearchQuery('');
                  }}
                  className="text-[9.5px] font-bold text-slate-500 hover:text-slate-900 underline ml-auto cursor-pointer"
                >
                  Reset Semua
                </button>
              </div>
            )}
          </div>

          {/* Result List */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-450 uppercase tracking-widest block">
              Ditemukan {filteredMitras.length} Agen {selectedCity === 'ALL' ? (selectedProvince === 'ALL' ? 'Nasional' : `di ${selectedProvince}`) : `di ${selectedCity}`}:
            </span>

            {filteredMitras.length === 0 ? (
              <div className="text-center p-8 text-slate-450 text-xs border border-dashed border-slate-200 rounded-xl">
                Tidak ada agen resmi terdaftar di area ini. Hubungi pusat untuk pendaftaran mitra pertama di kota ini!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMitras.map((m) => (
                  <div
                    key={m.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-pink-300 hover:shadow transition-all flex flex-col justify-between bg-white"
                  >
                    <div>
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                        m.tier === 'distributor' ? 'bg-red-100 text-red-700' :
                        m.tier === 'agen' ? 'bg-pink-100 text-pink-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {m.tier.toUpperCase()} RESMI
                      </span>
                      <h5 className="font-sans font-bold text-slate-900 text-sm mt-3 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                        {m.shopName}
                      </h5>
                      <span className="text-xs text-slate-500 block mt-1">Nama Pemilik: {m.name}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Area Operasional: {m.city}, {m.province}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button
                        id={`btn-wa-action-${m.id}`}
                        onClick={() => triggerMockWhatsApp(m)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp Pembelian</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Informational sidebar detailing SEO Advantages */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h5 className="font-sans font-bold text-slate-900 text-sm mb-3 border-l-2 border-pink-500 pl-2">Keuntungan Keagenan Lokal</h5>
            <ul className="space-y-3 text-xs text-slate-650 leading-relaxed">
              <li className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0"></span>
                <span><strong>Konversi Melompat Tinggi:</strong> Konsumen cenderung langsung klik order saat tahu barang dikirim dari kota asal mereka, menghemat waktu tunggu kiriman.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0"></span>
                <span><strong>Pemasaran Mandiri:</strong> Fitur router ini membidani kerja sama mutualisme. Brand pusat mendatangkan leads, mitra lokal menyelesaikan penjualan fisik.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 shrink-0"></span>
                <span><strong>Minimalisir Ongkir:</strong> Biaya kirim produk kosmetik yang sering kali menyamai harga masker/serum eceran kini dipotong hingga 80%.</span>
              </li>
            </ul>
          </div>

          {/* Interactive Simulated Whatsapp Window inside the flow */}
          <AnimatePresence>
            {showWaMock && activeMitraMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#efeae2] rounded-2xl border border-slate-350 shadow-xl overflow-hidden"
              >
                {/* Header WA */}
                <div className="bg-[#075e54] p-3 text-white flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-stone-150 flex items-center justify-center text-[#075e54] font-bold text-xs shadow">
                      {activeMitraMessage.name.charAt(0)}
                    </div>
                    <div>
                      <h6 className="text-xs font-bold block">{activeMitraMessage.shopName}</h6>
                      <span className="text-[9px] text-emerald-200 block">Online (Simulasi Chat)</span>
                    </div>
                  </div>
                  <button
                    id="btn-close-wa"
                    onClick={() => setShowWaMock(false)}
                    className="p-1 hover:bg-white/10 rounded cursor-pointer"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Message Body */}
                <div className="p-4 h-[180px] overflow-y-auto space-y-3 flex flex-col justify-end">
                  <div className="bg-white p-3 rounded-lg shadow text-[11px] text-stone-800 leading-normal max-w-[85%] self-end relative border-t-2 border-emerald-500 animate-slide-in">
                    <p className="font-semibold text-[9px] text-[#075e54] mb-0.5">Template Order WhatsApp:</p>
                    {activeMitraMessage.textTemplate}
                    <span className="text-[8px] text-stone-400 text-right block mt-1">10:43 AM</span>
                  </div>
                </div>

                {/* Simulated Chat Input */}
                <div className="p-2.5 bg-stone-50 border-t border-stone-200 flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="Kirim pesan rujukan..."
                    className="flex-1 bg-white border border-stone-200 rounded-full px-3 py-1.5 text-[11px] text-stone-400 focus:outline-none"
                  />
                  <button
                    id="btn-send-mock-wa"
                    onClick={() => {
                      alert(`Pesan simulasi WhatsApp berhasil terkirim ke Agen: ${activeMitraMessage.name}!`);
                      setShowWaMock(false);
                    }}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
