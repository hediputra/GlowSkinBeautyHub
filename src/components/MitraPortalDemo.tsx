/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { MOCK_PRODUCTS, MOCK_REWARDS, MOCK_MARKETING_KITS } from '../dbData';
import { MitraTier, ProductData, MarketingKit } from '../types';
import { ShoppingCart, Award, CheckCircle, Tag, Sparkles, LogIn, FileDown, Eye, Copy, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function MitraPortalDemo() {
  const [activeTier, setActiveTier] = useState<MitraTier>('agen');
  const [mitraPoints, setMitraPoints] = useState(240);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [copiedKitId, setCopiedKitId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'BELANJA' | 'REWARDS' | 'KIT'>('BELANJA');

  const getTierPrice = (product: ProductData, tier: MitraTier) => {
    switch (tier) {
      case 'distributor': return product.distributorPrice;
      case 'agen': return product.agenPrice;
      case 'reseller': return product.resellerPrice;
      default: return product.retailPrice;
    }
  };

  const getMinQty = (tier: MitraTier) => {
    switch (tier) {
      case 'distributor': return 250;
      case 'agen': return 50;
      case 'reseller': return 10;
      default: return 1;
    }
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      const copy = { ...cart };
      delete copy[productId];
      setCart(copy);
    } else {
      setCart({ ...cart, [productId]: qty });
    }
  };

  // Calculates total price & points in cart
  const cartSubtotal = Object.keys(cart).reduce((sum, pId) => {
    const product = MOCK_PRODUCTS.find(p => p.id === pId);
    if (!product) return sum;
    const qty = Number(cart[pId]);
    return sum + (getTierPrice(product, activeTier) * qty);
  }, 0);

  const cartTotalPoints = Object.keys(cart).reduce((sum, pId) => {
    const product = MOCK_PRODUCTS.find(p => p.id === pId);
    if (!product) return sum;
    const qty = Number(cart[pId]);
    return sum + (product.pointsAwarded * qty);
  }, 0);

  // checkout handler
  const handleCheckout = () => {
    if (Object.keys(cart).length === 0) return;

    const itemsOrdered = Object.keys(cart).map((pId) => {
      const product = MOCK_PRODUCTS.find(p => p.id === pId)!;
      const qty = Number(cart[pId]);
      return {
        productName: product.name,
        qty,
        unitPrice: getTierPrice(product, activeTier),
        lineTotal: getTierPrice(product, activeTier) * qty,
        points: product.pointsAwarded * qty
      };
    });

    const invId = `INV-RO-${Math.floor(100000 + Math.random() * 900000)}`;
    setLastInvoice({
      invoiceNo: invId,
      items: itemsOrdered,
      subtotal: cartSubtotal,
      pointsEarned: cartTotalPoints,
      tierApplied: activeTier
    });

    // Update mitras point balance dynamically
    setMitraPoints(prev => prev + cartTotalPoints);
    setCart({}); // clear cart
    setShowOrderSuccess(true);
  };

  const handleCopyKit = (kit: MarketingKit) => {
    if (kit.captionText) {
      navigator.clipboard.writeText(kit.captionText);
      setCopiedKitId(kit.id);
      setTimeout(() => setCopiedKitId(null), 2500);
    }
  };

  return (
    <div id="mitra-portal-demo-container" className="space-y-6">
      
      {/* Simulation Header */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <span className="text-xs font-bold text-pink-600 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Demo Sandbox Portal Mitra
          </span>
          <h4 className="font-sans font-bold text-slate-900 text-sm">
            Simulasikan Pengalaman Berbelanja & Repeat Order dari Sisi Mitra
          </h4>
        </div>
        
        {/* Tier changer simulation */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          <LogIn className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-500">Log in sebagai:</span>
          <select
            id="select-mitra-tier-sim"
            value={activeTier}
            onChange={(e) => {
              setActiveTier(e.target.value as MitraTier);
              setCart({}); // reset cart on tier change to prevent mismatch
            }}
            className="text-xs font-bold text-slate-800 bg-none border-none focus:outline-none cursor-pointer"
          >
            <option value="distributor">Distributor Resmi</option>
            <option value="agen">Agen Terdaftar</option>
            <option value="reseller">Reseller Terdaftar</option>
            <option value="retail">Retail (Konsumen Biasa)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Portal interface */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          {/* Mock App Bar */}
          <div className="bg-slate-950 px-6 py-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
              <span className="font-sans font-bold text-xs md:text-sm tracking-wider text-pink-400">GLOWSKIN PORTAL MITRA</span>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="bg-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/5">
                <Award className="w-3.5 h-3.5 text-pink-400" />
                <span className="font-bold text-slate-100">{mitraPoints} Poin Reward</span>
              </div>
              <span className="font-bold text-pink-300">Level: {activeTier.toUpperCase()}</span>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="border-b border-slate-200 flex bg-slate-50 text-xs text-slate-600 font-semibold">
            <button
              id="tab-mitra-belanja"
              onClick={() => setActiveTab('BELANJA')}
              className={`flex-1 py-3 text-center transition-all ${
                activeTab === 'BELANJA' ? 'bg-white border-b-2 border-pink-500 text-pink-600 font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Belanja Repeat Order (RO)
            </button>
            <button
              id="tab-mitra-rewards"
              onClick={() => setActiveTab('REWARDS')}
              className={`flex-1 py-3 text-center transition-all ${
                activeTab === 'REWARDS' ? 'bg-white border-b-2 border-pink-500 text-pink-600 font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Tukarkan Poin ({MOCK_REWARDS.length} Rewards)
            </button>
            <button
              id="tab-mitra-kit"
              onClick={() => setActiveTab('KIT')}
              className={`flex-1 py-3 text-center transition-all ${
                activeTab === 'KIT' ? 'bg-white border-b-2 border-pink-500 text-pink-600 font-bold' : 'hover:bg-slate-100'
              }`}
            >
              Marketing Kit ({MOCK_MARKETING_KITS.length} Aset)
            </button>
          </div>

          {/* Portal Tab Contents */}
          <div className="p-6 flex-1 min-h-[400px]">
            
            {/* 1. SHOP REPEAT ORDER TAB */}
            {activeTab === 'BELANJA' && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs flex items-start gap-2 text-slate-700">
                  <Info className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                  <div>
                    <strong>Sistem Keagenan Aktif:</strong> Karena level akun Anda merupakan <strong>{activeTier.toUpperCase()}</strong>,
                    Anda diwajibkan membeli dengan minimal pemesanan awal sebanyak <strong>{getMinQty(activeTier)} pcs</strong> per transaksi 
                    untuk bisa melakukan pemesanan (aturan disesuaikan demi disiplin suplai).
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_PRODUCTS.map((prod) => {
                    const price = getTierPrice(prod, activeTier);
                    const retail = prod.retailPrice;
                    const saved = retail - price;
                    const qtyInCart = cart[prod.id] || 0;

                    return (
                      <div key={prod.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-pink-300 hover:shadow transition-all bg-white">
                        <div className="relative h-[120px] bg-slate-100 overflow-hidden">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover animate-fade-in"
                          />
                          <span className="absolute top-2 left-2 bg-slate-950/90 text-pink-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-white/5">
                            +{prod.pointsAwarded} Pts / pc
                          </span>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              {prod.category}
                            </span>
                            <h5 className="font-sans font-bold text-slate-900 text-sm mt-0.5">
                              {prod.name}
                            </h5>
                            <p className="text-slate-500 text-[11px] leading-normal mt-1 block h-[38px] overflow-hidden line-clamp-2">
                              {prod.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-baseline">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Harga Tier Anda:</span>
                              <span className="text-sm font-bold text-pink-600 font-mono">
                                Rp {price.toLocaleString('id-ID')}
                              </span>
                              {saved > 0 && (
                                <span className="text-[9px] text-emerald-600 font-bold block">
                                  Hemat Rp {saved.toLocaleString('id-ID')} (vs Retail)
                                </span>
                              )}
                            </div>
                            
                            {/* Quantity controller */}
                            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-55 bg-slate-50">
                              <button
                                id={`btn-dec-${prod.id}`}
                                onClick={() => updateCartQty(prod.id, qtyInCart - 1)}
                                className="px-2.5 py-1 text-xs text-slate-550 font-bold hover:bg-slate-200 active:bg-slate-300 transition-colors cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-bold text-slate-800 min-w-[20px] text-center">
                                {qtyInCart}
                              </span>
                              <button
                                id={`btn-inc-${prod.id}`}
                                onClick={() => updateCartQty(prod.id, qtyInCart + 1)}
                                className="px-2.5 py-1 text-xs text-slate-550 font-bold hover:bg-slate-200 active:bg-slate-300 transition-colors cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. REWARDS REDEMPTION TAB */}
            {activeTab === 'REWARDS' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-pink-50 to-slate-50 p-3 rounded-lg border border-slate-250/75 text-xs text-slate-700">
                  <strong>Poin Loyalitas Keagenan:</strong> Tukarkan akumulasi poin berbelanja Anda dengan bermacam
                  hadiah impian penunjang operasional bisnis keagenan Anda. Hadiah akan dikirim langsung ke alamat fisik Toko Anda.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_REWARDS.map(rew => {
                    const isRedeemable = mitraPoints >= rew.pointsRequired;
                    return (
                      <div key={rew.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex bg-white hover:border-pink-200 hover:shadow transition-all">
                        <div className="w-24 h-24 shrink-0 bg-slate-100">
                          <img
                            src={rew.image}
                            alt={rew.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="font-sans font-bold text-slate-900 text-xs leading-snug">
                              {rew.name}
                            </h5>
                            <p className="text-[10px] text-slate-500 leading-normal mt-0.5 line-clamp-2">
                              {rew.description}
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs font-bold text-pink-600 block">
                              {rew.pointsRequired} Pts
                            </span>
                            <button
                              id={`btn-redeem-${rew.id}`}
                              disabled={!isRedeemable}
                              onClick={() => {
                                if (isRedeemable) {
                                  setMitraPoints(prev => prev - rew.pointsRequired);
                                  alert(`Penukaran Reward "${rew.name}" berhasil diajukan! Staf admin kami akan segera mensurvei kelayakan data dan mengabari Anda.`);
                                }
                              }}
                              className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                                isRedeemable
                                  ? 'bg-pink-500 hover:bg-pink-600 text-white cursor-pointer shadow-sm'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              {isRedeemable ? 'Klaim' : 'Poin Kurang'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. MARKETING KIT DOWNLOAD TAB */}
            {activeTab === 'KIT' && (
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-705 text-slate-755">
                  <strong>Branding Kit Center:</strong> Portal materi branding agar promosi seragam di media sosial.
                  Unduh foto estetik, video UGC testimoni, dan copas caption untuk melipatgandakan omzet keagenan Anda.
                </div>

                <div className="space-y-3">
                  {MOCK_MARKETING_KITS.map(kit => (
                    <div key={kit.id} className="p-4 border border-slate-205 border-slate-200 rounded-xl bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between gap-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            kit.category === 'PRODUCT_FOTO' ? 'bg-pink-100 text-pink-700' :
                            kit.category === 'VIDEO_TESTIMONI' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {kit.category.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{kit.fileSize}</span>
                        </div>
                        <h5 className="font-sans font-bold text-slate-900 text-xs md:text-sm">
                          {kit.title}
                        </h5>
                        <p className="text-slate-500 text-xs max-w-xl line-clamp-2 italic font-sans">
                          "{kit.captionText}"
                        </p>
                      </div>

                      <div className="flex md:flex-col justify-end gap-2 shrink-0">
                        <button
                          id={`btn-copy-caption-${kit.id}`}
                          onClick={() => handleCopyKit(kit)}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        >
                          {copiedKitId === kit.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Salin Caption</span>
                            </>
                          )}
                        </button>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            alert(`File "${kit.fileUrl}" simulasi unduh sukses!`);
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-pink-500 hover:bg-pink-650 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow shadow-pink-1000 shadow-pink-100"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>Download Media</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Cart and invoice summaries */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <h4 className="font-sans font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm">
              <ShoppingCart className="w-4 h-4 text-pink-500" />
              Keranjang Belanja Otonom
            </h4>

            {Object.keys(cart).length === 0 ? (
              <div className="p-8 text-center text-slate-450 text-xs space-y-1">
                <ShoppingCart className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
                <p>Keranjang masih kosong.</p>
                <p className="text-[10px] text-slate-400">Atur quantity produk di samping untuk menambah RO.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-slate-200/50 max-h-[220px] overflow-y-auto pr-1">
                  {Object.keys(cart).map((pId) => {
                    const product = MOCK_PRODUCTS.find(p => p.id === pId)!;
                    const price = getTierPrice(product, activeTier);
                    const qty = Number(cart[pId]);
                    return (
                      <div key={pId} className="py-2.5 flex justify-between items-start text-xs">
                        <div>
                          <span className="font-bold text-slate-800 block">{product.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {qty} pcs x Rp {price.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <span className="font-bold font-mono text-slate-800">
                          Rp {(price * qty).toLocaleString('id-ID')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-solid border-slate-200 pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Estimasi Reward Poin:</span>
                    <span className="font-bold text-pink-600">+{cartTotalPoints} Poin</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-900 font-bold border-t border-slate-200/30 pt-1.5">
                    <span>Total Belanja:</span>
                    <span className="font-mono text-pink-600">Rp {cartSubtotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                {/* Submit button with Minimum rules validation */}
                {cartSubtotal > 0 && (
                  <div>
                    <button
                      id="btn-execute-checkout-mitra"
                      onClick={handleCheckout}
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-pink-100 cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Ajukan Repeat Order</span>
                    </button>
                    <span className="text-[9px] text-slate-400 text-center block mt-2 leading-relaxed">
                      Harga terpotong otonom diskon level {activeTier.toUpperCase()}.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Success Invoice Modal representation */}
          <AnimatePresence>
            {showOrderSuccess && lastInvoice && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-950 text-slate-200 p-5 rounded-2xl border border-slate-900 shadow-xl relative overflow-hidden"
              >
                {/* Background glow decorator */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-pink-500/10 rounded-full blur-xl"></div>
                
                <h5 className="font-sans font-bold text-sm text-pink-400 flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Order Berhasil Diajukan!
                </h5>
                
                <div className="space-y-2 text-[11px] font-mono mb-4 text-slate-300">
                  <div className="flex justify-between">
                    <span>No Invoice:</span>
                    <span className="font-bold text-white">{lastInvoice.invoiceNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Poin Dikreditkan:</span>
                    <span className="font-bold text-pink-400">+{lastInvoice.pointsEarned} Pts</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-850 pt-2 font-bold text-white">
                    <span>Grand Total:</span>
                    <span>Rp {lastInvoice.subtotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal mb-3">
                  Poin Anda langsung terakumulasi secara real-time ke database. Stok gudang pusat telah dikunci untuk dipersiapkan proses packing oleh logistik.
                </p>

                <button
                  id="btn-close-invoice"
                  onClick={() => setShowOrderSuccess(false)}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Tutup Notifikasi
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
