/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TableDefinition, ProductData, RewardItem, MarketingKit, MitraAccount } from './types';

export const RECOMMENDED_TABLES: TableDefinition[] = [
  {
    tableName: 'users',
    description: 'Menyimpan kredensial login utama dan data registrasi akun, baik untuk Admin Pusat maupun Mitra (Distributor, Agen, Reseller).',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'ID unik pengguna' },
      { name: 'name', type: 'VARCHAR(150)', constraints: 'NOT NULL', description: 'Nama lengkap pengguna sesuai KTP/Toko' },
      { name: 'email', type: 'VARCHAR(100)', constraints: 'UNIQUE NOT NULL', description: 'Alamat email untuk login' },
      { name: 'password_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Hash password terenkripsi (BCrypt/Argon2)' },
      { name: 'phone', type: 'VARCHAR(20)', constraints: 'UNIQUE NOT NULL', description: 'Nomor WhatsApp aktif untuk koordinasi' },
      { name: 'role', type: 'VARCHAR(20)', constraints: "NOT NULL DEFAULT 'MITRA'", description: "Role pengguna: 'ADMIN' atau 'MITRA'" },
      { name: 'status', type: 'VARCHAR(20)', constraints: "NOT NULL DEFAULT 'ACTIVE'", description: "Status akun: 'ACTIVE', 'SUSPENDED', atau 'PENDING'" },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP', description: 'Waktu pendaftaran akun' }
    ],
    sqlScript: `CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'MITRA', -- 'ADMIN', 'MITRA'
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    tableName: 'mitra_profiles',
    description: 'Menyimpan data profil keagenan spesifik termasuk tingkatan tier harga, wilayah keagenan (lokasi GPS/Kota/Provinsi), sponsor, dan saldo poin reward terakumulasi.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE', description: 'Terhubung langsung dengan tabel users' },
      { name: 'tier', type: 'VARCHAR(20)', constraints: "NOT NULL CHECK (tier IN ('distributor', 'agen', 'reseller', 'retail'))", description: 'Tingkatan keagenan yang menentukan harga beli produk' },
      { name: 'province', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Provinsi untuk pencarian Keagenan terdekat' },
      { name: 'city', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Kota/Kabupaten wilayah kepatuhan distribusi' },
      { name: 'shop_name', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Nama Toko/Oultet kosmetik mitra' },
      { name: 'points_balance', type: 'INT', constraints: 'NOT NULL DEFAULT 0 CHECK (points_balance >= 0)', description: 'Jumlah poin aktif yang bisa ditukarkan hadiah' },
      { name: 'sponsor_id', type: 'UUID', constraints: 'REFERENCES users(id) ON DELETE SET NULL', description: 'ID Upline/Sponsor (Mendukung rekonsiliasi komisi/omzet bertingkat)' },
      { name: 'updated_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP', description: 'Waktu pembaruan profil terakhir' }
    ],
    sqlScript: `CREATE TABLE mitra_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('distributor', 'agen', 'reseller', 'retail')),
  province VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  shop_name VARCHAR(100) NOT NULL,
  points_balance INT NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
  sponsor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Upline referral
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_mitra_location ON mitra_profiles (province, city);`
  },
  {
    tableName: 'products',
    description: 'Menu katalog utama produk skincare dengan harga ritel dasar (suggested consumer price) serta harga pokok produksi (base price).',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'ID unik produk skincare' },
      { name: 'sku', type: 'VARCHAR(50)', constraints: 'UNIQUE NOT NULL', description: 'Stock Keeping Unit untuk integrasi sistem logistik' },
      { name: 'name', type: 'VARCHAR(150)', constraints: 'NOT NULL', description: 'Nama produk skincare (misal: "Serum Retinol Intensive")' },
      { name: 'category', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Kategori (Serum, Cleanser, Toner, Sunscreen)' },
      { name: 'base_price', type: 'NUMERIC(12,2)', constraints: 'NOT NULL', description: 'Harga Pokok Produksi (HPP) internal admin' },
      { name: 'retail_price', type: 'NUMERIC(12,2)', constraints: 'NOT NULL', description: 'Harga Jual Rekomendasi ke Konsumen Akhir (HET)' },
      { name: 'points_reward', type: 'INT', constraints: 'NOT NULL DEFAULT 1', description: 'Jumlah poin yang didapatkan Mitra per pcs saat repeat order' },
      { name: 'image_url', type: 'TEXT', constraints: '', description: 'S3/CDN Link url gambar produk' },
      { name: 'description', type: 'TEXT', constraints: '', description: 'Penjelasan manfaat, BPOM, dan bahan aktif kosmetik' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP', description: 'Waktu rilis produk' }
    ],
    sqlScript: `CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  base_price NUMERIC(12,2) NOT NULL, -- HPP
  retail_price NUMERIC(12,2) NOT NULL, -- Harga Pasar (Retail)
  points_reward INT NOT NULL DEFAULT 1, -- Poin per botol
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    tableName: 'product_tier_prices',
    description: 'Tabel inti harga bertingkat untuk multi-tier keagenan. Menentukan harga spesifik per level mitra (distributor, agen, reseller) beserta regulasi minimal pembelian.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'ID unik relasi harga' },
      { name: 'product_id', type: 'UUID', constraints: 'REFERENCES products(id) ON DELETE CASCADE', description: 'Reference ke ID tabel produk' },
      { name: 'tier', type: 'VARCHAR(20)', constraints: 'NOT NULL', description: 'Level mitra: distributor, agen, reseller' },
      { name: 'price', type: 'NUMERIC(12,2)', constraints: 'NOT NULL', description: 'Harga khusus untuk level mitra tersebut' },
      { name: 'min_order_qty', type: 'INT', constraints: 'NOT NULL DEFAULT 1', description: 'Minimal beli untuk mendapatkan harga khusus ini' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP', description: 'Tanggal input relasi harga' }
    ],
    sqlScript: `CREATE TABLE product_tier_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('distributor', 'agen', 'reseller')),
  price NUMERIC(12,2) NOT NULL,
  min_order_qty INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, tier) -- Satu produk hanya punya satu harga per tier
);`
  },
  {
    tableName: 'inventories',
    description: 'Menyimpan data stok fisik pusat secara real-time untuk mengontrol pergerakan alokasi barang.',
    columns: [
      { name: 'product_id', type: 'UUID', constraints: 'PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE', description: 'Terhubung dengan produk tunggal' },
      { name: 'stock_qty', type: 'INT', constraints: 'NOT NULL DEFAULT 0 CHECK (stock_qty >= 0)', description: 'Jumlah stok fisik yang tersedia di gudang pusat' },
      { name: 'warehouse_location', type: 'VARCHAR(100)', constraints: "NOT NULL DEFAULT 'GUDANG_UTAMA'", description: 'Nama lokasi rak/gudang penyimpanan' },
      { name: 'last_stock_opname', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP', description: 'Waktu rekonsiliasi fisik terakhir' }
    ],
    sqlScript: `CREATE TABLE inventories (
  product_id UUID PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  stock_qty INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  warehouse_location VARCHAR(100) NOT NULL DEFAULT 'GUDANG_UTAMA',
  last_stock_opname TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    tableName: 'inventory_logs',
    description: 'Tabel audit trail mutasi stok, mencatat log histori masuk barang (restock), keluar barang (repeat order agen), atau penyesuaian (stock opname).',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'ID acuan audit' },
      { name: 'product_id', type: 'UUID', constraints: 'REFERENCES products(id) ON DELETE CASCADE', description: 'ID produk yang bermutasi' },
      { name: 'change_qty', type: 'INT', constraints: 'NOT NULL', description: 'Kuantitas mutasi (Contoh: -50 jika keluar, +100 jika restock)' },
      { name: 'type', type: 'VARCHAR(30)', constraints: "NOT NULL CHECK (type IN ('IN_RESTOCK', 'OUT_ORDER', 'ADJUSTMENT'))", description: 'Sifat mutasi barang' },
      { name: 'reference_id', type: 'VARCHAR(100)', constraints: '', description: 'ID Order Transaksi atau ID Admin yang bertanggung-jawab' },
      { name: 'notes', type: 'TEXT', constraints: '', description: 'Keterangan tambahan mutasi' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP', description: 'Waktu persis pencatatan mutasi' }
    ],
    sqlScript: `CREATE TABLE inventory_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  change_qty INT NOT NULL, -- Positif untuk penambahan, Negatif untuk pengurangan
  type VARCHAR(30) NOT NULL CHECK (type IN ('IN_RESTOCK', 'OUT_ORDER', 'ADJUSTMENT')),
  reference_id VARCHAR(100), -- ID Order/Invoice, atau ID Dokumen Rujukan
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    tableName: 'orders',
    description: 'Pusat data transaksi repeat order (RO) dari mitra ke pabrik/kantor pusat, lengkap status pembayaran dan pengiriman barang.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'ID Invoice penjualan kosmetik' },
      { name: 'mitra_id', type: 'UUID', constraints: 'NOT NULL REFERENCES users(id)', description: 'Akun Mitra pemesan' },
      { name: 'total_amount', type: 'NUMERIC(14,2)', constraints: 'NOT NULL', description: 'Total pembayaran bersih setelah dipotong diskon keagenan' },
      { name: 'total_points_earned', type: 'INT', constraints: 'NOT NULL DEFAULT 0', description: 'Total perolehan poin transaksi RO ini' },
      { name: 'payment_status', type: 'VARCHAR(30)', constraints: "NOT NULL DEFAULT 'UNPAID'", description: "Kondisi pembayaran: 'UNPAID', 'PAID', atau 'REFUNDED'" },
      { name: 'shipping_status', type: 'VARCHAR(30)', constraints: "NOT NULL DEFAULT 'PENDING'", description: "Kondisi muatan barang: 'PENDING', 'PACKING', 'SHIPPED', atau 'DELIVERED'" },
      { name: 'tracking_code', type: 'VARCHAR(100)', constraints: '', description: 'Nomor resi kurir logistik (JNE/J&T/Sicepat)' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP', description: 'Tanggal pesanan dibuat oleh mitra' }
    ],
    sqlScript: `CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mitra_id UUID NOT NULL REFERENCES users(id),
  total_amount NUMERIC(14,2) NOT NULL,
  total_points_earned INT NOT NULL DEFAULT 0,
  payment_status VARCHAR(30) NOT NULL DEFAULT 'UNPAID', -- 'UNPAID', 'PAID'
  shipping_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SHIPPED', 'DELIVERED'
  tracking_code VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  },
  {
    tableName: 'order_items',
    description: 'Rincian detail barang dalam sebuah nomor invoice transaksi keagenan.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'ID baris detail order' },
      { name: 'order_id', type: 'UUID', constraints: 'REFERENCES orders(id) ON DELETE CASCADE', description: 'Referensi ke invoice utama' },
      { name: 'product_id', type: 'UUID', constraints: 'REFERENCES products(id)', description: 'ID produk skincare yang dipesan' },
      { name: 'quantity', type: 'INT', constraints: 'NOT NULL CHECK (quantity > 0)', description: 'Banyaknya botol/pcs yang dibeli' },
      { name: 'unit_price', type: 'NUMERIC(12,2)', constraints: 'NOT NULL', description: 'Harga satuan berdasarkan tier mitra pemesan saat waktu transaksi' },
      { name: 'line_total', type: 'NUMERIC(12,2)', constraints: 'NOT NULL', description: 'Total perkalian: quantity x unit_price' },
      { name: 'points_earned', type: 'INT', constraints: 'NOT NULL', description: 'Points_reward x quantity' }
    ],
    sqlScript: `CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  points_earned INT NOT NULL,
  UNIQUE(order_id, product_id)
);`
  },
  {
    tableName: 'rewards',
    description: 'Daftar hadiah impian/insentif yang disediakan oleh pemilik brand bagi mitra kosmetik berprestasi.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'ID reward' },
      { name: 'name', type: 'VARCHAR(150)', constraints: 'NOT NULL', description: 'Nama hadiah (Contoh: "Logam Mulia Antam 5 Gram", "Vespa Primavera")' },
      { name: 'points_required', type: 'INT', constraints: 'NOT NULL CHECK (points_required > 0)', description: 'Ambang batas penukaran poin' },
      { name: 'description', type: 'TEXT', constraints: '', description: 'Syarat & ketentuan klaim hadiah' },
      { name: 'image_url', type: 'TEXT', constraints: '', description: 'Foto visual menarik hadiah' },
      { name: 'active', type: 'BOOLEAN', constraints: 'NOT NULL DEFAULT TRUE', description: 'Apakah promo reward masih aktif' }
    ],
    sqlScript: `CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  points_required INT NOT NULL CHECK (points_required > 0),
  description TEXT,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);`
  },
  {
    tableName: 'reward_claims',
    description: 'Histori penukaran poin mitra menjadi hadiah fisik, untuk pemantauan validasi oleh staf admin.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY DEFAULT gen_random_uuid()', description: 'ID transaksi klaim' },
      { name: 'mitra_id', type: 'UUID', constraints: 'NOT NULL REFERENCES users(id)', description: 'Akun Mitra pengklaim' },
      { name: 'reward_id', type: 'UUID', constraints: 'NOT NULL REFERENCES rewards(id)', description: 'ID Hadiah yang ditukarkan' },
      { name: 'points_spent', type: 'INT', constraints: 'NOT NULL', description: 'Poin yang dikurangi dari saldo mitr_profiles' },
      { name: 'status', type: 'VARCHAR(30)', constraints: "NOT NULL DEFAULT 'PROSES' CHECK (status IN ('PROSES', 'DISETUJUI', 'DIKIRIM', 'SELESAI'))", description: 'Status penanganan klaim' },
      { name: 'shipping_address', type: 'TEXT', constraints: 'NOT NULL', description: 'Tujuan pengiriman hadiah mitra' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP', description: 'Tanggal penukaran diajukan' }
    ],
    sqlScript: `CREATE TABLE reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mitra_id UUID NOT NULL REFERENCES users(id),
  reward_id UUID NOT NULL REFERENCES rewards(id),
  points_spent INT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PROSES', -- 'PROSES', 'DISETUJUI', 'SELESAI'
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  }
];

export const MOCK_PRODUCTS: ProductData[] = [
  {
    id: 'prod-001',
    sku: 'SK_LIGHT_01',
    name: 'Glow Radiance Bright Serum',
    category: 'Serum',
    basePrice: 35000,
    retailPrice: 99000,
    distributorPrice: 55000,
    agenPrice: 65000,
    resellerPrice: 80000,
    stockCenter: 1250,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    pointsAwarded: 5,
    description: 'Serum pencerah kulit intens dengan formulasi 10% Niacinamide dan Ekstrak Sakura untuk menyamarkan noda hitam dalam 7 hari.'
  },
  {
    id: 'prod-002',
    sku: 'SK_ACNE_02',
    name: 'Acne Barrier Purifying Moisturizer',
    category: 'Moisturizer',
    basePrice: 42000,
    retailPrice: 119000,
    distributorPrice: 65000,
    agenPrice: 78000,
    resellerPrice: 95000,
    stockCenter: 840,
    image: 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&q=80&w=400',
    pointsAwarded: 6,
    description: 'Krim pelembab gel ringan yang diformulasikan khusus dengan Centella Asiatica dan Mugwort untuk menenangkan jerawat meradang.'
  },
  {
    id: 'prod-003',
    sku: 'SK_CREAM_03',
    name: 'Retinol Youth Renewal Night Cream',
    category: 'Cream',
    basePrice: 48000,
    retailPrice: 139000,
    distributorPrice: 78000,
    agenPrice: 92000,
    resellerPrice: 110000,
    stockCenter: 620,
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&q=80&w=400',
    pointsAwarded: 8,
    description: 'Krim malam anti-aging premium dengan Encapsulated Retinol 1% untuk mengencangkan pori kulit dan menyamarkan garis halus.'
  },
  {
    id: 'prod-004',
    sku: 'SK_SUNS_04',
    name: 'Watery Tinted Chemical Sunscreen SPF 50+',
    category: 'Sunscreen',
    basePrice: 28000,
    retailPrice: 79000,
    distributorPrice: 42000,
    agenPrice: 52000,
    resellerPrice: 65000,
    stockCenter: 2100,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=400',
    pointsAwarded: 4,
    description: 'Tabir surya harian berbahan dasar air yang memberikan perlindungan UV tinggi sekaligus efek rona natural pada kulit.'
  }
];

export const MOCK_REWARDS: RewardItem[] = [
  {
    id: 'rew-001',
    name: '0.5 Gram Logam Mulia Antam Certicard',
    pointsRequired: 80,
    image: 'https://images.unsplash.com/photo-1610375228911-c4ab47a08e1b?auto=format&fit=crop&q=80&w=400',
    description: 'Emas murni batangan bersertifikat resmi dari Antam untuk penambah aset finansial mitra.',
    claimedCount: 42
  },
  {
    id: 'rew-002',
    name: 'Smart TV Xiaomi 43-inch UHD 4K',
    pointsRequired: 450,
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=400',
    description: 'Android TV pintar layar lebar beresolusi tinggi untuk melengkapi kenyamanan outlet kosmetik Anda.',
    claimedCount: 14
  },
  {
    id: 'rew-003',
    name: 'iPad 10th Gen 64GB Wifi Cellular',
    pointsRequired: 1200,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400',
    description: 'Tablet produktivitas tinggi untuk menunjang kebutuhan pembukuan order dan materi editing promosi agen.',
    claimedCount: 5
  },
  {
    id: 'rew-004',
    name: 'Motor Honda Scoopy Terbaru 2026',
    pointsRequired: 5500,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=400',
    description: 'Sepeda motor skuter retro idaman sebagai hadiah utama mobilitas operasional COD atau promosi luring.',
    claimedCount: 2
  }
];

export const MOCK_MARKETING_KITS: MarketingKit[] = [
  {
    id: 'kit-001',
    title: 'Visual Banner Aesthetic Serum (Feeds IG)',
    category: 'PRODUCT_FOTO',
    fileUrl: 'glow_serum_feeds_flatlay.jpg',
    fileSize: '4.2 MB',
    captionText: '✨ CAPTION TEMPLATE ✨\n\nPunya noda hitam yang gak kunjung hilang? 😭\nItu tandanya kulit kamu butuh asupan Niacinamide konsentrasi tinggi!\n\nGlow Radiance Bright Serum mengandung 10% Niacinamide + Sakura Extract yang teruji menyamarkan flek hitam dan bikin kulit mulus bersinar cuma dalam 7 hari lho! 😍\n\nYuk, amankan punyamu sekarang juga sebelum kehabisan! Klik link di bio ya 💖\n\n#GlowRadiancePremium #SerumBPOM #SkincareLokal #BrandSkincareViral',
    downloadsCount: 184
  },
  {
    id: 'kit-002',
    title: 'Video Ulasan Tekstur Moisturizer (TikTok/Reels)',
    category: 'VIDEO_TESTIMONI',
    fileUrl: 'moisturizer_centella_tiktok_review.mp4',
    fileSize: '18.7 MB',
    captionText: '👀 CAPTION TEMPLATE 👀\n\nNo more bumpy skin! 👋 Gel bening dari Acne Barrier Purifying Moisturizer se-ringan itu pas dibaur di muka berjerawat. Sensasi adem Centella-nya langsung calming kulit kemerahan seketika!\n\nPraktis dipakai pagi & malam! Beli di seller resmi ber-ID Card ya dear! Biar dapet produk original ✨\n\n#AcneBarrierGel #SkincareJerawat #SembuhDariJerawat #EksfoliasiKamera',
    downloadsCount: 312
  },
  {
    id: 'kit-003',
    title: 'Copywriting Edukasi Anti-Aging Retinol',
    category: 'COPYWRITING',
    fileUrl: 'retinol_copywriting_guide.txt',
    fileSize: '12 KB',
    captionText: '🚨 COPYWRITING EDUKATIF RETINOL - COCOK UNTUK BROADCAST WA 🚨\n\n"Mbak, umur berapa sih idealnya pakai Retinol?" 🤔\n\nBanyak banget yang nanya hal ini. Faktanya, sejak menginjak usia 20 tahun, produksi kolagen kulit alami kita berkurang 1% tiap tahunnya lho! Makanya garis halus mulai mengintip.\n\nSolusinya? Mulai pakai Retinol Youth Renewal Night Cream 2-3 kali seminggu secara berkala. Formulasi Encapsulated Retinol 1% di dalamnya amsyong banget buat:\n✅ Mengencangkan pori-pori wajah\n✅ Membantu regenerasi kulit baru\n✅ Meminimalkan keriput halus\n\nKonsultasikan tipe kulitmu sekarang ke kami ya! 📲 Chat WA kami di nomor tertera.',
    downloadsCount: 245
  },
  {
    id: 'kit-004',
    title: 'Poster Cetak Banner Toko Kosmetik Luring',
    category: 'POSTER',
    fileUrl: 'banner_kosmetik_resmi_agen_cetak.pdf',
    fileSize: '35.4 MB',
    captionText: 'Poster resolusi tinggi (High-Res 300 DPI) siap cetak ukuran 1x1.5 meter untuk spanduk depan toko kosmetik mitra. Memiliki kolom kosong di sudut kanan bawah yang dapat diisi nama Toko Mitra dan nomor WhatsApp Anda sendiri.',
    downloadsCount: 96
  }
];

export const MOCK_MITRAS: MitraAccount[] = [
  {
    id: 'usr-001',
    name: 'Ahmad Syarifudin (GlowBeauty)',
    email: 'ahmad.syarif@gmail.com',
    phone: '628123456781',
    tier: 'distributor',
    province: 'Jawa Timur',
    city: 'Surabaya',
    pointsAccumulated: 385,
    totalOrdersCount: 22,
    totalOrderSpent: 124500000,
    shopName: 'GlowBeauty Cosmetics Surabaya'
  },
  {
    id: 'usr-002',
    name: 'Siti Rahmawati',
    email: 'rahma.beauty@yahoo.com',
    phone: '628574321098',
    tier: 'agen',
    province: 'Jawa Barat',
    city: 'Bandung',
    pointsAccumulated: 190,
    totalOrdersCount: 14,
    totalOrderSpent: 42300000,
    shopName: 'Rahma Skincare Store'
  },
  {
    id: 'usr-003',
    name: 'Dewi Lestari Official',
    email: 'dewi.beautyhouse@gmail.com',
    phone: '628198765432',
    tier: 'agen',
    province: 'DKI Jakarta',
    city: 'Jakarta Selatan',
    pointsAccumulated: 175,
    totalOrdersCount: 12,
    totalOrderSpent: 38700000,
    shopName: 'Beauty House South Jakarta'
  },
  {
    id: 'usr-004',
    name: 'Eka Putri Ningsih',
    email: 'ekaputri.reseller@gmail.com',
    phone: '628221234567',
    tier: 'reseller',
    province: 'Jawa Tengah',
    city: 'Semarang',
    pointsAccumulated: 45,
    totalOrdersCount: 8,
    totalOrderSpent: 7500000,
    shopName: 'Eka Glowy Shop'
  },
  {
    id: 'usr-005',
    name: 'Budi Santoso Hermawan',
    email: 'budi.santoso@gmail.com',
    phone: '6281312344321',
    tier: 'reseller',
    province: 'DI Yogyakarta',
    city: 'Sleman',
    pointsAccumulated: 35,
    totalOrdersCount: 4,
    totalOrderSpent: 4600000,
    shopName: 'Budi Cosmetic Corner'
  }
];

export const REGIONS_LOMBOK_MEDAN = [
  ...MOCK_MITRAS,
  {
    id: 'usr-006',
    name: 'Sarah Siregar (Medan Jaya)',
    email: 'sarah.medan@gmail.com',
    phone: '6281288889991',
    tier: 'distributor',
    province: 'Sumatera Utara',
    city: 'Medan',
    pointsAccumulated: 520,
    totalOrdersCount: 31,
    totalOrderSpent: 189000000,
    shopName: 'Medan Jaya Kosmetik'
  },
  {
    id: 'usr-007',
    name: 'Anisa Khairun (Medan Glow)',
    email: 'anisa.khair@gmail.com',
    phone: '6285322223334',
    tier: 'agen',
    province: 'Sumatera Utara',
    city: 'Medan',
    pointsAccumulated: 140,
    totalOrdersCount: 9,
    totalOrderSpent: 22000000,
    shopName: 'Medan Glow Store'
  },
  {
    id: 'usr-008',
    name: 'Lalu Hendra (Lombok Care)',
    email: 'lalu.hendra@gmail.com',
    phone: '6287866665551',
    tier: 'distributor',
    province: 'Nusa Tenggara Barat',
    city: 'Mataram (Lombok)',
    pointsAccumulated: 300,
    totalOrdersCount: 18,
    totalOrderSpent: 92000000,
    shopName: 'Lombok Care Cosmetics'
  },
  {
    id: 'usr-009',
    name: 'Baiq Nurul (Reseller Mataram)',
    email: 'baiq.nurul@gmail.com',
    phone: '6281988887776',
    tier: 'reseller',
    province: 'Nusa Tenggara Barat',
    city: 'Mataram (Lombok)',
    pointsAccumulated: 65,
    totalOrdersCount: 6,
    totalOrderSpent: 12500000,
    shopName: 'Baiq Beauty Care'
  }
];
