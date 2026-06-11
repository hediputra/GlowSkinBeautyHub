/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Database, ShieldCheck, ShoppingCart, Truck, Award, ArrowRight, Layers, FileText, Printer } from 'lucide-react';

interface SimulationState {
  centerStock: number;
  mitraPoints: number;
  mitraTotalOrders: number;
  mitraSpent: number;
  logs: Array<{ id: string; timestamp: string; action: string; type: 'DATABASE' | 'EVENT' | 'API' }>;
}

export default function WorkflowSimulator() {
  const [activeStep, setActiveStep] = useState(0);
  
  // Interactive Live States within simulator
  const [simState, setSimState] = useState<SimulationState>({
    centerStock: 500,
    mitraPoints: 120,
    mitraTotalOrders: 14,
    mitraSpent: 42300000,
    logs: [
      { id: '1', timestamp: '10:00:02', action: 'Koneksi database PostgreSQL terjalin.', type: 'DATABASE' },
      { id: '2', timestamp: '10:00:05', action: 'Sesi login Agen "Siti" diverifikasi.', type: 'API' }
    ]
  });

  const steps = [
    {
      title: '1. Admin Merilis/Restock Produk',
      role: 'Pusat (Admin)',
      desc: 'Admin Pusat menginput produk baru "Glow Radiance Bright Serum" seharga Rp 99.000 dengan level harga Agen Rp 65.000, serta menambah stok awal sebanyak 500 botol ke dalam inventaris gudang pusat.',
      actionLabel: 'Disalurkan ke Inventaris Pusat',
      sqlQueries: [
        `-- 1. Insert data produk skincare baru ke tabel master
INSERT INTO products (sku, name, category, base_price, retail_price, points_reward)
VALUES ('SK_LIGHT_01', 'Glow Radiance Bright Serum', 'Serum', 35000, 99000, 5);`,
        `-- 2. Daftarkan harga khusus untuk tingkatan keagenan (Distributor, Agen, Reseller)
INSERT INTO product_tier_prices (product_id, tier, price, min_order_qty)
VALUES 
  ('prod-uuid', 'distributor', 55000, 250),
  ('prod-uuid', 'agen', 65000, 50),
  ('prod-uuid', 'reseller', 80000, 10);`,
        `-- 3. Set kuantitas stok fisik awal pusat ke gudang utama
INSERT INTO inventories (product_id, stock_qty, warehouse_location)
VALUES ('prod-uuid', 500, 'GUDANG_UTAMA');`
      ]
    },
    {
      title: '2. Agen Menaruh Repeat Order (RO)',
      role: 'Mitra (Siti - Level Agen)',
      desc: 'Siti melakukan repeat order 100 botol Serum dari HP-nya. Sistem mengunci harga khusus Agen (Rp 65.000, bukan Rp 99.000 retail). Total tagihan Rp 6.500.000, dan terakumulasi estimasi reward +500 poin.',
      actionLabel: 'Siti Mengajukan Checkout RO',
      sqlQueries: [
        `-- 1. Mengajukan Invoice order baru dari agen
INSERT INTO orders (id, mitra_id, total_amount, total_points_earned, payment_status, shipping_status)
VALUES ('invoice-uuid', 'siti-user-id', 6500000, 500, 'PAID', 'PENDING');`,
        `-- 2. Rekam rincian item produk yang dibeli
INSERT INTO order_items (order_id, product_id, quantity, unit_price, line_total, points_earned)
VALUES ('invoice-uuid', 'prod-uuid', 100, 65000, 6500000, 500);`
      ]
    },
    {
      title: '3. Admin Validasi & Pengiriman',
      role: 'Pusat (Logistik)',
      desc: 'Admin Pusat menyetujui invoice. Sistem menurunkan stok pusat secara otomatis dari 500 menjadi 400 pcs, mentransfer sisa stok ke kurir, serta secara real-time mengkredit +500 poin reward ke akun Siti.',
      actionLabel: 'Setujui & Kirim Barang',
      sqlQueries: [
        `-- 1. Kurangi stok real-time di tabel inventories pusat (Atomic Transaction)
UPDATE inventories 
SET stock_qty = stock_qty - 100 
WHERE product_id = 'prod-uuid';`,
        `-- 2. Catat audit log mutasi stok keluar untuk pelacakan opname pusat
INSERT INTO inventory_logs (product_id, change_qty, type, reference_id, notes)
VALUES ('prod-uuid', -100, 'OUT_ORDER', 'invoice-uuid', 'Repeat Order Agen Siti (Toko Rahma)');`,
        `-- 3. Tambahkan saldo poin reward langsung ke profil keagenan mitra
UPDATE mitra_profiles 
SET points_balance = points_balance + 500 
WHERE id = 'siti-user-id';`
      ]
    }
  ];

  const handleNextSimulation = () => {
    if (activeStep === 0) {
      // Step 1 to Step 2 transition
      const now = new Date().toLocaleTimeString();
      setSimState(prev => ({
        ...prev,
        logs: [
          { id: String(Date.now()), timestamp: now, action: 'Admin merilis Glow Radiance Bright Serum.', type: 'DATABASE' },
          { id: String(Date.now() + 1), timestamp: now, action: 'Inisialisasi 500 pcs produk di gudang pusat.', type: 'DATABASE' },
          ...prev.logs
        ]
      }));
      setActiveStep(1);
    } else if (activeStep === 1) {
      // Step 2 to Step 3 transition
      const now = new Date().toLocaleTimeString();
      setSimState(prev => ({
        ...prev,
        logs: [
          { id: String(Date.now()), timestamp: now, action: 'Siti melakukan repeat order 100 pcs Serum.', type: 'EVENT' },
          { id: String(Date.now() + 1), timestamp: now, action: 'Invoice #RO-2026-991 dibuat senilai Rp 6.500.000.', type: 'API' },
          ...prev.logs
        ]
      }));
      setActiveStep(2);
    } else if (activeStep === 2) {
      // Finalize Step 3 (Commit changes inside sim state!)
      const now = new Date().toLocaleTimeString();
      setSimState(prev => ({
        centerStock: prev.centerStock - 100,
        mitraPoints: prev.mitraPoints + 500,
        mitraTotalOrders: prev.mitraTotalOrders + 1,
        mitraSpent: prev.mitraSpent + 6500000,
        logs: [
          { id: String(Date.now()), timestamp: now, action: 'UPDATE inventories: Stok Gudang Utama -100.', type: 'DATABASE' },
          { id: String(Date.now() + 1), timestamp: now, action: 'UPDATE mitra_profiles: Tambah +500 points.', type: 'DATABASE' },
          { id: String(Date.now() + 2), timestamp: now, action: 'Audit log mutasi ditulis. Status order: SHIPPED.', type: 'DATABASE' },
          ...prev.logs
        ]
      }));
      setActiveStep(3);
    }
  };

  const handleResetSimulation = () => {
    setActiveStep(0);
    setSimState({
      centerStock: 500,
      mitraPoints: 120,
      mitraTotalOrders: 14,
      mitraSpent: 42300000,
      logs: [
        { id: '1', timestamp: '10:00:02', action: 'Koneksi database PostgreSQL terjalin.', type: 'DATABASE' },
        { id: '2', timestamp: '10:00:05', action: 'Sesi login Agen "Siti" diverifikasi.', type: 'API' }
      ]
    });
  };

  return (
    <div id="workflow-simulator-container" className="space-y-6">
      <div className="bg-gradient-to-r from-pink-50 to-slate-50 p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-sans text-xl text-slate-950 font-bold flex items-center gap-2">
            <Layers className="w-5 h-5 text-pink-500" />
            Simulator Siklus Transaksi Otonom Keagenan
          </h3>
          <p className="text-slate-650 text-xs md:text-sm mt-1 max-w-2xl leading-normal">
            Bagaimana interaksi data real-time bekerja? Jalankan simulasi interaktif ini untuk menyaksikan
            sinkronisasi instan antara <strong>Update Stok Pusat</strong>, <strong>Invoice Pembelian Agen</strong>, dan <strong>Penambahan Poin Reward</strong> secara dinamis.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
          <button
            id="btn-reset-simulator"
            onClick={handleResetSimulation}
            className="px-4 py-2 text-xs font-semibold text-slate-650 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-350 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-550" /> Reset Simulasi
          </button>
          
          <button
            id="btn-print-simulator"
            onClick={() => window.print()}
            className="no-print px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Cetak Alur Kerja
          </button>
        </div>
      </div>

      {/* Grid: Left side visual flow, Right side technical SQL/Logger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Visualizer Frame */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alur Pintu Ke Pintu</span>
              <span className="px-2.5 py-0.5 text-xs font-bold bg-pink-50 text-pink-600 rounded-full">
                {activeStep === 3 ? 'Siklus Selesai!' : `Tahap ${activeStep + 1} dari 3`}
              </span>
            </div>

            {/* Simulated Live Values Dash */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-4 rounded-xl mb-6 border border-slate-200/60">
              <div className="text-center p-2 border-r border-slate-200/50">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Stok Gudang Pusat</span>
                <span className="text-lg md:text-xl font-bold font-mono text-pink-600">{simState.centerStock} pcs</span>
              </div>
              <div className="text-center p-2 border-r border-slate-200/50">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Poin Mitra (Siti)</span>
                <span className="text-lg md:text-xl font-bold font-mono text-purple-600">+{simState.mitraPoints} Poin</span>
              </div>
              <div className="text-center p-2">
                <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Total Belanja (Siti)</span>
                <span className="text-xs md:text-sm font-bold font-mono text-slate-900 block mt-1.5">
                  Rp {simState.mitraSpent.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Dynamic Step Content */}
            <AnimatePresence mode="wait">
              {activeStep < 3 ? (
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold bg-pink-50 text-pink-600 border border-pink-100 rounded-lg">
                      {steps[activeStep].role}
                    </span>
                    <h4 className="font-sans font-bold text-slate-900 text-base border-l-2 border-pink-500 pl-2">
                      {steps[activeStep].title}
                    </h4>
                  </div>
                  <p className="text-slate-650 text-xs md:text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                    {steps[activeStep].desc}
                  </p>

                  {/* Flow Graphics */}
                  <div className="relative border border-slate-200/60 rounded-xl p-4 bg-slate-50/50 overflow-hidden flex items-center justify-around h-[120px]">
                    {/* Admin Gudang */}
                    <div className={`p-3 rounded-xl border transition-all text-center ${activeStep === 0 ? 'bg-pink-50 border-pink-300 scale-105' : 'bg-white border-slate-200'}`}>
                      <Database className="w-5 h-5 mx-auto text-pink-500 mb-1" />
                      <span className="text-[10px] font-bold text-slate-700 block">Warehousing</span>
                      <span className="text-[8px] text-slate-400">{simState.centerStock} pcs</span>
                    </div>

                    <ArrowRight className={`w-5 h-5 text-slate-300 ${activeStep === 1 ? 'animate-pulse text-pink-500' : ''}`} />

                    {/* Pembelian online */}
                    <div className={`p-3 rounded-xl border transition-all text-center ${activeStep === 1 ? 'bg-purple-50 border-purple-300 scale-105' : 'bg-white border-slate-200'}`}>
                      <ShoppingCart className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                      <span className="text-[10px] font-bold text-slate-700 block">Mitra RO</span>
                      <span className="text-[8px] text-slate-400">Rp 6.5M Invoice</span>
                    </div>

                    <ArrowRight className={`w-5 h-5 text-slate-300 ${activeStep === 2 ? 'animate-pulse text-pink-500' : ''}`} />

                    {/* Pengiriman & Reward */}
                    <div className={`p-3 rounded-xl border transition-all text-center ${activeStep === 2 ? 'bg-pink-50 border-pink-300 scale-105' : 'bg-white border-slate-200'}`}>
                      <Truck className="w-5 h-5 mx-auto text-pink-500 mb-1" />
                      <span className="text-[10px] font-bold text-slate-700 block">Delivery & Points</span>
                      <span className="text-[8px] text-slate-400">+{simState.mitraPoints} Pts</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-pink-50/60 rounded-2xl border border-pink-200/50 text-center space-y-3"
                >
                  <Award className="w-12 h-12 text-pink-500 mx-auto" />
                  <h4 className="font-sans font-bold text-slate-900 text-lg">Siklus Repeat Order Berhasil Diselesaikan!</h4>
                  <p className="text-slate-650 text-sm max-w-md mx-auto leading-relaxed">
                    Sistem otomatis menghentikan leak stok, mengunci harga Agen tanpa manual kalkulasi, dan melacak perolehan poin Siti tanpa intervensi manusia.
                  </p>
                  <button
                    id="btn-restart-from-end"
                    onClick={handleResetSimulation}
                    className="px-5 py-2 text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white rounded-lg shadow-md transition-colors"
                  >
                    Simulasi Lagi
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-4 flex justify-between items-center">
            <span className="text-xs text-slate-400 italic">
              Klik tombol aksi di kanan untuk melangkah ke tahap selanjutnya.
            </span>
            {activeStep < 3 && (
              <button
                id="btn-trigger-next-simulation"
                onClick={handleNextSimulation}
                className="px-5 py-2.5 text-xs font-bold text-white bg-pink-500 rounded-xl hover:bg-pink-600 transition-colors flex items-center gap-1 shadow-md shadow-pink-250"
              >
                <span>{steps[activeStep].actionLabel}</span>
                <Play className="w-3 h-3 fill-current" />
              </button>
            )}
          </div>
        </div>

        {/* Database Query & Technical Logs Panel */}
        <div className="lg:col-span-5 bg-slate-950 text-slate-350 p-5 rounded-2xl flex flex-col justify-between min-h-[420px] shadow-sm">
          <div>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-mono font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1.5">
                <Database className="w-4 h-4 text-pink-400" />
                Dapur Teknis (Proses SQL/API)
              </span>
              <span className="text-[10px] font-mono text-slate-500">Live PostgreSQL Console</span>
            </div>

            {/* Displaying target SQL rules for active slide */}
            {activeStep < 3 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-xs font-semibold text-stone-400">SQL DDL & Query Transaksional:</span>
                </div>
                <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 overflow-y-auto max-h-[220px]">
                  <pre className="text-[11px] font-mono leading-relaxed text-yellow-100/90 whitespace-pre">
                    {steps[activeStep].sqlQueries.join('\n\n')}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-950/40 p-4 border border-emerald-900 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Siklus Data Konsisten (ACID Compliant)</span>
                </div>
                <p className="text-[11px] text-emerald-300 leading-normal font-mono">
                  Seluruh mutasi stok dan poin dibungkus dalam PostgreSQL `TRANSACTION BEGIN ... COMMIT`. Jika satu query gagal (seperti stok tiba-tiba tidak cukup karena dibeli agen lain), sistem otomatis melakukan `ROLLBACK` total untuk mencegah salah hitung pembukuan secara otonom!
                </p>
              </div>
            )}
          </div>

          {/* Audit Logs Trail */}
          <div className="mt-4 border-t border-stone-800 pt-4">
            <span className="text-[10px] font-mono font-bold text-stone-500 block uppercase tracking-wider mb-2">
              System Audit Trail Log:
            </span>
            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 h-[100px] overflow-y-auto font-mono text-[10px] space-y-1.5">
              {simState.logs.map(log => (
                <div key={log.id} className="flex justify-between items-start gap-2 border-b border-stone-900/40 pb-1 last:border-0">
                  <span className="text-stone-500 shrink-0">[{log.timestamp}]</span>
                  <span className="text-stone-300 flex-1">{log.action}</span>
                  <span className={`text-[8px] px-1 py-0.5 rounded font-bold ${
                    log.type === 'DATABASE' ? 'bg-orange-950/60 text-orange-400 border border-orange-900/30' :
                    log.type === 'API' ? 'bg-purple-950/60 text-purple-400 border border-purple-900/30' :
                    'bg-sky-950/60 text-sky-400 border border-sky-900/30'
                  }`}>
                    {log.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
