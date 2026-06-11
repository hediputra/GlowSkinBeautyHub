/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  Plus, 
  UserPlus, 
  FileSpreadsheet, 
  X, 
  Package, 
  ShieldCheck, 
  MapPin, 
  Coins, 
  Flame, 
  CheckCircle, 
  Code,
  Layers,
  Sparkles,
  ClipboardCheck,
  AlertTriangle,
  Send,
  Database
} from 'lucide-react';
import { ProductData, MitraTier, MitraAccount } from '../types';
import { MOCK_PRODUCTS } from '../dbData';

interface QuickActionMenuProps {
  onSuccessNotification?: (message: string) => void;
}

export default function QuickActionMenu({ onSuccessNotification }: QuickActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'ADD_PRODUCT' | 'REGISTER_MITRA' | 'STOCK_OPNAME' | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [generatedSql, setGeneratedSql] = useState('');
  const [successDetails, setSuccessDetails] = useState<{ title: string; subtitle: string; icon: any; data: Array<{ label: string; value: string }> }>({
    title: '',
    subtitle: '',
    icon: Sparkles,
    data: []
  });

  // State for Add Product Form
  const [prodSku, setProdSku] = useState('SK_GLOW_05');
  const [prodName, setProdName] = useState('Glow Retinol Eye Essential');
  const [prodCategory, setProdCategory] = useState('Cream');
  const [prodBasePrice, setProdBasePrice] = useState(45000);
  const [prodRetailPrice, setProdRetailPrice] = useState(129000);
  const [prodDistributorPrice, setProdDistributorPrice] = useState(72000);
  const [prodAgenPrice, setProdAgenPrice] = useState(85000);
  const [prodResellerPrice, setProdResellerPrice] = useState(99000);
  const [prodPoints, setProdPoints] = useState(6);
  const [prodStock, setProdStock] = useState(500);

  // State for Register Mitra Form
  const [mitraName, setMitraName] = useState('Nurasiah S.Ag.');
  const [mitraShop, setMitraShop] = useState('Nungskincare Corner');
  const [mitraEmail, setMitraEmail] = useState('nurasiah.glow@gmail.com');
  const [mitraPhone, setMitraPhone] = useState('6285299991111');
  const [mitraTier, setMitraTier] = useState<MitraTier>('agen');
  const [mitraProvince, setMitraProvince] = useState('Sumatera Barat');
  const [mitraCity, setMitraCity] = useState('Padang');

  // State for Stock Opname Form
  const [opnameProductId, setOpnameProductId] = useState(MOCK_PRODUCTS[0]?.id || 'prod-001');
  const [opnamePhysical, setOpnamePhysical] = useState(1200);
  const [opnameReason, setOpnameReason] = useState('Fisik berlebih di rak cadangan');
  const [opnameAdmin, setOpnameAdmin] = useState('Bambang Logistik');

  // Auto sku generator when category / name changes
  useEffect(() => {
    if (prodName) {
      const sanitized = prodName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase();
      const code = prodCategory ? prodCategory.toUpperCase().slice(0, 3) : 'GLO';
      setProdSku(`SK_${code}_${sanitized}`);
    }
  }, [prodName, prodCategory]);

  const handleOpenAction = (action: 'ADD_PRODUCT' | 'REGISTER_MITRA' | 'STOCK_OPNAME') => {
    setIsOpen(false);
    setActiveModal(action);
    setShowSuccessScreen(false);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setShowSuccessScreen(false);
  };

  const submitAddProduct = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate dynamic SQL Script
    const sql = `-- 1. Sisipkan baris katalog baru ke tabel master products
INSERT INTO products (id, sku, name, category, base_price, retail_price, points_reward, description)
VALUES (
  '${crypto.randomUUID()}', 
  '${prodSku}', 
  '${prodName}', 
  '${prodCategory}', 
  ${prodBasePrice}, 
  ${prodRetailPrice}, 
  ${prodPoints},
  'Rilis cepat produk via portal Quick Action'
);

-- 2. Konfigurasi harga khusus multi-level keagenan (Tier pricing)
INSERT INTO product_tier_prices (product_id, tier, price, min_order_qty)
VALUES 
  ('uuid-referensi', 'distributor', ${prodDistributorPrice}, 250),
  ('uuid-referensi', 'agen', ${prodAgenPrice}, 50),
  ('uuid-referensi', 'reseller', ${prodResellerPrice}, 10);

-- 3. Inisialisasi kapasitas stok fisik untuk pergudangan
INSERT INTO inventories (product_id, stock_qty, warehouse_location, last_stock_opname)
VALUES ('uuid-referensi', ${prodStock}, 'GUDANG_PENGIRIMAN', CURRENT_TIMESTAMP);`;

    setGeneratedSql(sql);
    setSuccessDetails({
      title: 'Produk Baru Berhasil Didaftarkan!',
      subtitle: 'Skema database GlowSkin dikoordinasikan secara otonom dengan HPP, multi-level tier, dan limitasi logistik.',
      icon: Package,
      data: [
        { label: 'SKU Katalog', value: prodSku },
        { label: 'Nama Skincare', value: prodName },
        { label: 'Kategori Rilis', value: prodCategory },
        { label: 'Harga Ritel (HET)', value: `Rp ${prodRetailPrice.toLocaleString('id-ID')}` },
        { label: 'Stok Pusat Awal', value: `${prodStock} botol` },
        { label: 'Poin Reward per RO', value: `+${prodPoints} Poin` }
      ]
    });

    setShowSuccessScreen(true);
    if (onSuccessNotification) {
      onSuccessNotification(`Sukses menambah produk ${prodName}! SQL Insert digenerate.`);
    }

    // Trigger local storage logging so users see actions persist
    const currentActions = JSON.parse(localStorage.getItem('quick_actions_log') || '[]');
    currentActions.unshift({
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      type: 'PRODUK',
      text: `Menambahkan produk baru #${prodSku} - ${prodName} (Stok: ${prodStock})`
    });
    localStorage.setItem('quick_actions_log', JSON.stringify(currentActions));
  };

  const submitRegisterMitra = (e: React.FormEvent) => {
    e.preventDefault();

    const userId = crypto.randomUUID();
    const phoneClean = mitraPhone.startsWith('0') ? '62' + mitraPhone.slice(1) : mitraPhone;

    const sql = `-- 1. Daftarkan kredensial login utama dan status akun mitra
INSERT INTO users (id, name, email, password_hash, phone, role, status)
VALUES (
  '${userId}',
  '${mitraName}',
  '${mitraEmail}',
  '\\$2b\\$10\\$e347hY9281hsy91y29ha0s19has9a18sH1H2yHas9Yuhs81u2', -- SHA256 Hash
  '${phoneClean}',
  'MITRA',
  'ACTIVE'
);

-- 2. Sambungkan ke profil keagenan sesuai tingkatan level margin (tier)
INSERT INTO mitra_profiles (id, tier, province, city, shop_name, points_balance)
VALUES (
  '${userId}',
  '${mitraTier}',
  '${mitraProvince}',
  '${mitraCity}',
  '${mitraShop}',
  0
);`;

    setGeneratedSql(sql);
    setSuccessDetails({
      title: 'Mitra Keagenan Baru Terdaftar!',
      subtitle: 'Sistem telah mengalokasikan akun portal reseller/distributor, token koordinasi WhatsApp, dan melacak kota operasional.',
      icon: UserPlus,
      data: [
        { label: 'Nama Mitra', value: mitraName },
        { label: 'Nama Toko / Outlet', value: mitraShop },
        { label: 'Tingkatan (Tier)', value: mitraTier.toUpperCase() },
        { label: 'Email Aktivasi', value: mitraEmail },
        { label: 'No. WA Utama', value: `+${phoneClean}` },
        { label: 'Wewenang Wilayah', value: `${mitraCity}, ${mitraProvince}` }
      ]
    });

    setShowSuccessScreen(true);
    if (onSuccessNotification) {
      onSuccessNotification(`Koneksi divalidasi! Mitra "${mitraName}" terdaftar sebagai ${mitraTier.toUpperCase()}.`);
    }

    const currentActions = JSON.parse(localStorage.getItem('quick_actions_log') || '[]');
    currentActions.unshift({
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      type: 'MITRA',
      text: `Mendaftarkan mitra baru ${mitraName} ({${mitraTier.toUpperCase()}} - ${mitraCity})`
    });
    localStorage.setItem('quick_actions_log', JSON.stringify(currentActions));
  };

  const submitStockOpname = (e: React.FormEvent) => {
    e.preventDefault();

    const matchedProduct = MOCK_PRODUCTS.find(p => p.id === opnameProductId) || MOCK_PRODUCTS[0];
    const systemStock = matchedProduct ? matchedProduct.stockCenter : 500;
    const difference = opnamePhysical - systemStock;
    const diffText = difference === 0 ? 'Cocok (0)' : (difference > 0 ? `Surplus (+${difference})` : `Defisit (${difference})`);

    const sql = `-- 1. Sesuaikan stok fisik real-time ke gudang
UPDATE inventories
SET stock_qty = ${opnamePhysical}, last_stock_opname = CURRENT_TIMESTAMP
WHERE product_id = '${opnameProductId}';

-- 2. Tulis log histori mutasi audit penyesuaian (Stock Opname Log)
INSERT INTO inventory_logs (product_id, change_qty, type, reference_id, notes)
VALUES (
  '${opnameProductId}',
  ${difference},
  'ADJUSTMENT',
  'OPNAME-${Date.now().toString().slice(-6)}',
  'Stock Opname oleh ${opnameAdmin}. Alasan: ${opnameReason}'
);`;

    setGeneratedSql(sql);
    setSuccessDetails({
      title: 'Stock Opname Sukses Didokumentasikan!',
      subtitle: 'Koreksi log audit logistik disimpan. Selisih divalidasi dan dicatat ke dalam log mutasi inventories global.',
      icon: FileSpreadsheet,
      data: [
        { label: 'Nama Produk Skincare', value: matchedProduct?.name || 'Glow Radiance Bright Serum' },
        { label: 'Stok Sistem Database', value: `${systemStock} pcs` },
        { label: 'Stok Fisik Ditemukan', value: `${opnamePhysical} pcs` },
        { label: 'Selisih Produk (Diff)', value: diffText },
        { label: 'Alasan Opname', value: opnameReason },
        { label: 'Admin Penanggung Jawab', value: opnameAdmin }
      ]
    });

    setShowSuccessScreen(true);
    if (onSuccessNotification) {
      onSuccessNotification(`Opname audit selesai: ${diffText} botol skincare disinkronisasi.`);
    }

    const currentActions = JSON.parse(localStorage.getItem('quick_actions_log') || '[]');
    currentActions.unshift({
      id: String(Date.now()),
      timestamp: new Date().toLocaleTimeString(),
      type: 'OPNAME',
      text: `Menjalankan stock opname untuk ${matchedProduct?.name} (Koreksi: ${diffText})`
    });
    localStorage.setItem('quick_actions_log', JSON.stringify(currentActions));
  };

  return (
    <div id="quick-action-fab-system" className="relative">
      
      {/* FLOATING ACTION TRIGGER */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        
        {/* Speed Dial Menu Items on Open */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              className="flex flex-col items-end gap-2.5 mb-2.5"
            >
              {/* Option 1: Stock Opname */}
              <div className="flex items-center gap-2 group">
                <span className="bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700/60 shadow-lg whitespace-nowrap opacity-90 group-hover:opacity-100 transition-all">
                  Inisiasi Stock Opname
                </span>
                <button
                  id="fab-action-opname"
                  type="button"
                  onClick={() => handleOpenAction('STOCK_OPNAME')}
                  className="w-11 h-11 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-indigo-500/20 hover:scale-110 cursor-pointer transition-all"
                  title="Stock Opname"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                </button>
              </div>

              {/* Option 2: Register Mitra */}
              <div className="flex items-center gap-2 group">
                <span className="bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700/60 shadow-lg whitespace-nowrap opacity-90 group-hover:opacity-100 transition-all">
                  Daftarkan Mitra Baru
                </span>
                <button
                  id="fab-action-mitra"
                  type="button"
                  onClick={() => handleOpenAction('REGISTER_MITRA')}
                  className="w-11 h-11 bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-purple-500/20 hover:scale-110 cursor-pointer transition-all"
                  title="Daftar Mitra"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>

              {/* Option 3: Add Product */}
              <div className="flex items-center gap-2 group">
                <span className="bg-slate-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-700/60 shadow-lg whitespace-nowrap opacity-90 group-hover:opacity-100 transition-all">
                  Tambah Produk Baru
                </span>
                <button
                  id="fab-action-product"
                  type="button"
                  onClick={() => handleOpenAction('ADD_PRODUCT')}
                  className="w-11 h-11 bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-pink-500/20 hover:scale-110 cursor-pointer transition-all"
                  title="Tambah Produk"
                >
                  <Package className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master FAB Trigger */}
        <button
          id="fab-main-trigger"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4.5 py-3.5 rounded-full font-bold shadow-xl transition-all cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${
            isOpen 
              ? 'bg-slate-900 text-white ring-4 ring-slate-200/55' 
              : 'bg-pink-600 hover:bg-pink-500 text-white shadow-pink-600/35 ring-4 ring-pink-100'
          }`}
        >
          {isOpen ? (
            <>
              <X className="w-5 h-5 animate-spin-once" />
              <span className="text-xs tracking-wide">Tutup</span>
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 text-amber-300 animate-pulse" />
              <span className="text-xs tracking-wide">Aksi Cepat</span>
            </>
          )}
        </button>
      </div>

      {/* QUICK ACTIONS INTERACTIVE MODALS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              
              {/* Modal Core Header */}
              <div className="bg-slate-900 px-6 py-4.5 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-pink-600 rounded-lg text-white">
                    <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-sm tracking-wide">
                      {activeModal === 'ADD_PRODUCT' && 'Tambah Produk & Skema Harga Berjenjang'}
                      {activeModal === 'REGISTER_MITRA' && 'Pendaftaran Mitra Baru Sistem Keagenan'}
                      {activeModal === 'STOCK_OPNAME' && 'Inisiasi Stok Opname (Audit Logistik)'}
                    </h3>
                    <p className="text-[10.5px] text-slate-400">Hubungan Data Otonom & SQL Builder Terpadu</p>
                  </div>
                </div>
                <button
                  id="btn-close-modal-x"
                  type="button"
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-lg text-slate-450 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Body Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {!showSuccessScreen ? (
                  <>
                    <div className="bg-amber-50 rounded-xl border border-amber-150 p-3.5 text-[11px] leading-relaxed text-amber-800 flex items-start gap-2.5">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Instruksi Hubungan PostgreSQL Otonom:</strong> Rilis data di sini mensimulasikan penulisan ke skema cloud. Mengisi form akan membuat sistem secara otomatis mengkalkulasi selisih, HPP margin distributor, dan menyusun kueri kustom SQL representatif untuk pelaporan.
                      </div>
                    </div>

                    {/* ACTION FORM 1: ADD PRODUCT */}
                    {activeModal === 'ADD_PRODUCT' && (
                      <form id="form-add-product" onSubmit={submitAddProduct} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-2">
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Nama Produk Skincare</label>
                            <input
                              id="inp-prod-name"
                              type="text"
                              value={prodName}
                              onChange={(e) => setProdName(e.target.value)}
                              placeholder="Contoh: Premium Vitamin C Glow Glow Serum"
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Kategori Produk</label>
                            <select
                              id="inp-prod-category"
                              value={prodCategory}
                              onChange={(e) => setProdCategory(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                            >
                              <option value="Serum">Serum</option>
                              <option value="Moisturizer">Moisturizer</option>
                              <option value="Cream">Cream</option>
                              <option value="Sunscreen">Sunscreen</option>
                              <option value="Toner">Toner</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Generated SKU Kargo</label>
                            <input
                              id="inp-prod-sku"
                              type="text"
                              value={prodSku}
                              disabled
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Harga Pokok Produksi (HPP)</label>
                            <input
                              id="inp-prod-base-price"
                              type="number"
                              value={prodBasePrice}
                              onChange={(e) => setProdBasePrice(Number(e.target.value))}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Harga Pasar Konsumen (HET)</label>
                            <input
                              id="inp-prod-retail-price"
                              type="number"
                              value={prodRetailPrice}
                              onChange={(e) => setProdRetailPrice(Number(e.target.value))}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                          <span className="text-[11px] font-bold text-slate-800 block mb-2">💰 Level Distribusi Khusus (Harga Multi-Tier):</span>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase mb-1">Distributor Price (min 250 pcs)</label>
                              <input
                                id="inp-tier-distributor"
                                type="number"
                                value={prodDistributorPrice}
                                onChange={(e) => setProdDistributorPrice(Number(e.target.value))}
                                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-pink-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase mb-1">Agen Price (min 50 pcs)</label>
                              <input
                                id="inp-tier-agen"
                                type="number"
                                value={prodAgenPrice}
                                onChange={(e) => setProdAgenPrice(Number(e.target.value))}
                                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-pink-500 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase mb-1">Reseller Price (min 10 pcs)</label>
                              <input
                                id="inp-tier-reseller"
                                type="number"
                                value={prodResellerPrice}
                                onChange={(e) => setProdResellerPrice(Number(e.target.value))}
                                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:border-pink-500 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Stok Awal Gudang Pusat</label>
                            <input
                              id="inp-prod-stock"
                              type="number"
                              value={prodStock}
                              onChange={(e) => setProdStock(Number(e.target.value))}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Poin Reward per Item (RO)</label>
                            <input
                              id="inp-prod-points"
                              type="number"
                              value={prodPoints}
                              onChange={(e) => setProdPoints(Number(e.target.value))}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 shrink-0">
                          <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            id="btn-submit-product"
                            type="submit"
                            className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold font-sans shadow-md cursor-pointer flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" /> Konfirmasi & Simpan Katalog
                          </button>
                        </div>
                      </form>
                    )}

                    {/* ACTION FORM 2: REGISTER MITRA */}
                    {activeModal === 'REGISTER_MITRA' && (
                      <form id="form-register-mitra" onSubmit={submitRegisterMitra} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Nama Pemilik Akun (Sesuai KTP)</label>
                            <input
                              id="inp-mitra-name"
                              type="text"
                              value={mitraName}
                              onChange={(e) => setMitraName(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Nama Toko Skincare (Outlet)</label>
                            <input
                              id="inp-mitra-shop"
                              type="text"
                              value={mitraShop}
                              onChange={(e) => setMitraShop(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Alamat Email Mitra</label>
                            <input
                              id="inp-mitra-email"
                              type="email"
                              value={mitraEmail}
                              onChange={(e) => setMitraEmail(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Nomor WhatsApp Utama</label>
                            <input
                              id="inp-mitra-phone"
                              type="text"
                              value={mitraPhone}
                              onChange={(e) => setMitraPhone(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Tingkat Hak Keagenan (Tier)</label>
                            <select
                              id="inp-mitra-tier"
                              value={mitraTier}
                              onChange={(e) => setMitraTier(e.target.value as MitraTier)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                            >
                              <option value="distributor">Distributor Wilayah (Margin Maksimal)</option>
                              <option value="agen">Agen Wilayah Terpaut (Margin Menengah)</option>
                              <option value="reseller">Reseller Terdaftar (Margin Ritel)</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase mb-1">Lokasi Provinsi</label>
                              <input
                                id="inp-mitra-province"
                                type="text"
                                value={mitraProvince}
                                onChange={(e) => setMitraProvince(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] text-slate-500 uppercase mb-1">Lokasi Kota / Kab</label>
                              <input
                                id="inp-mitra-city"
                                type="text"
                                value={mitraCity}
                                onChange={(e) => setMitraCity(e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                                required
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 shrink-0">
                          <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            id="btn-submit-mitra"
                            type="submit"
                            className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold font-sans shadow-md cursor-pointer flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" /> Konfirmasi & Aktivasi Mitra
                          </button>
                        </div>
                      </form>
                    )}

                    {/* ACTION FORM 3: STOCK OPNAME */}
                    {activeModal === 'STOCK_OPNAME' && (
                      <form id="form-stock-opname" onSubmit={submitStockOpname} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Pilih Skincare untuk Diaudit</label>
                            <select
                              id="inp-opname-product"
                              value={opnameProductId}
                              onChange={(e) => setOpnameProductId(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none font-sans font-semibold text-slate-800"
                            >
                              {MOCK_PRODUCTS.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Stok Tercatata di Database Sistem</label>
                            <input
                              id="inp-opname-system-stock"
                              type="text"
                              value={`${MOCK_PRODUCTS.find(p => p.id === opnameProductId)?.stockCenter || 500} botol`}
                              disabled
                              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Hasil Fisik Aktual Ditemukan (Gudang)</label>
                            <input
                              id="inp-opname-physical"
                              type="number"
                              value={opnamePhysical}
                              onChange={(e) => setOpnamePhysical(Number(e.target.value))}
                              placeholder="Kuantitas stok real di tangan"
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none font-bold text-slate-900"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Alasan Penyesuaian Rekonsiliasi</label>
                            <select
                              id="inp-opname-reason"
                              value={opnameReason}
                              onChange={(e) => setOpnameReason(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                            >
                              <option value="Fisik berlebih di rak cadangan">Fisik berlebih di rak cadangan (Surplus)</option>
                              <option value="Ditemukan rusak di sudut palet logistik">Ditemukan rusak di sudut palet logistik (Defisit)</option>
                              <option value="Koreksi selisih salah input restock berkala">Koreksi selisih salah input restock berkala</option>
                              <option value="Penyelarasan audit bulanan gudang utama">Penyelarasan audit bulanan gudang utama</option>
                            </select>
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-650 uppercase mb-1">Petugas Admin Auditor Penanggung Jawab</label>
                            <input
                              id="inp-opname-admin"
                              type="text"
                              value={opnameAdmin}
                              onChange={(e) => setOpnameAdmin(e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:border-pink-500 focus:outline-none"
                              required
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 shrink-0">
                          <button
                            type="button"
                            onClick={handleCloseModal}
                            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            id="btn-submit-opname"
                            type="submit"
                            className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold font-sans shadow-md cursor-pointer flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" /> Sesuaikan Inventaris (Audit SQL)
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                ) : (
                  
                  /* ACTION SUCCESS SCREEN WITH INTERACTIVE SQL LOGGING */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="text-center py-4">
                      <div className="w-14 h-14 bg-emerald-100 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3.5 shadow-md">
                        <CheckCircle className="w-8 h-8" />
                      </div>
                      <h4 className="font-sans font-extrabold text-slate-900 text-base">{successDetails.title}</h4>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-normal">
                        {successDetails.subtitle}
                      </p>
                    </div>

                    {/* Receipt Columns Grid */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200/60 p-4.5 grid grid-cols-2 gap-x-6 gap-y-3">
                      {successDetails.data.map((item, id) => (
                        <div key={id} className="border-b border-dashed border-slate-200/85 pb-2">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">{item.label}</span>
                          <span className="text-xs font-extrabold text-slate-800 font-sans">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* SQL Kueri Box Container */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Code className="w-4 h-4 text-pink-500" />
                        Kueri Transaksi PostgreSQL Otonom (Generated):
                      </span>
                      <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-[10.5px] leading-relaxed border border-slate-800 overflow-x-auto relative">
                        <span className="absolute top-2.5 right-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          RAW SQL
                        </span>
                        <pre className="whitespace-pre">{generatedSql}</pre>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 shrink-0">
                      <button
                        id="btn-another-action"
                        type="button"
                        onClick={() => setShowSuccessScreen(false)}
                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        Lakukan Aksi Lain
                      </button>
                      <button
                        id="btn-close-modal-success"
                        type="button"
                        onClick={handleCloseModal}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold font-sans shadow-md cursor-pointer"
                      >
                        Selesai & Tutup
                      </button>
                    </div>
                  </motion.div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
