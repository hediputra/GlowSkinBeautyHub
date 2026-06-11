/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PitchCard {
  title: string;
  subTitle: string;
  problem: string;
  solution: string;
  roiHighlight: string;
  iconName: string;
}

export interface BusinessModelDetail {
  modeName: string;
  recommendedPrice: string;
  description: string;
  pros: string[];
  cons: string[];
  verdict: string;
}

export const VALUE_PROPOSITIONS: PitchCard[] = [
  {
    title: 'Manajemen Multi-Tier Pricing',
    subTitle: 'Harga Otomatis Sesuai Level Keagenan',
    problem: 'Sering terjadi konflik harga akibat agen/reseller yang perang harga atau salah hitung diskon secara manual di Excel/WhatsApp.',
    solution: 'Sistem mengenali level akun login mitra secara instan. Distributor, Agen, dan Reseller hanya bisa melihat & membeli dengan harga khusus mereka. Tertutup, rapi, dan saling menjaga margin masing-masing.',
    roiHighlight: '100% Kebocoran harga teratasi, menghemat 15+ jam kerja manual rekap orderan/bukti transfer setiap minggunya.',
    iconName: 'ShieldAlert'
  },
  {
    title: 'Poin Reward Keagenan Otomatis',
    subTitle: 'Loyalitas Tanpa Batas Tanpa Bingung Ngitung',
    problem: 'Mitra tidak loyal, mudah pindah ke kompetitor (brand kecantikan lain) karena tidak ada ikatan sistem insentif yang transparan.',
    solution: 'Setiap kali distributor atau agen melakukan repeat order (RO) di aplikasi mereka, poin langsung terakumulasi otomatis ke dalam akun profil mereka. Mereka bisa memantau live poin untuk ditukarkan emas antam atau motor.',
    roiHighlight: 'Meningkatkan tingkat retensi repeat order unit mitra hingga 45% karena termotivasi mengejar target poin reward.',
    iconName: 'Gift'
  },
  {
    title: 'Cari Agen Terdekat (WhatsApp Router)',
    subTitle: 'Ubah Trafik Landing Page Jadi Penjualan Lokal',
    problem: 'Banyak konsumen retail terhambat ongkir mahal dari gudang pusat, sedang stok agen di daerah tidak laku akibat kurang terekspos.',
    solution: 'Landing page publik menyediakan peta integrasi instan. Calon konsumen hanya perlu memilih Kota/Provinsi mereka, dan sistem langsung menampilkan WhatsApp Agen Resmi terdekat dengan pesan order otomatis.',
    roiHighlight: 'Mengurangi keraguan ongkir mahal konsumen, melariskan perputaran produk di gudang Agen Anda (Mitra makin royal).',
    iconName: 'Locate'
  },
  {
    title: 'Pusat Materi Marketing (Kit Center)',
    subTitle: 'Mitra Tinggal Copas, Penjualan Meluas',
    problem: 'Agen dan reseller malas promosi karena tidak bisa edit foto, tidak pintar merangkai kata promosi (copywriting), atau materi tidak seragam.',
    solution: 'Admin pusat mengunggah foto produk HD, testimoni video, dan copywriting edukasi di satu portal terpadu. Mitra tinggal unduh sekali klik dari aplikasi keagenan mereka untuk langsung diposting di WA Status atau IG Feeds.',
    roiHighlight: 'Menerapkan branding yang seragam, melipatgandakan sebaran konten promosi brand skincare di media sosial hingga 5x lipat.',
    iconName: 'FolderArrowDown'
  }
];

export const BUSINESS_MODELS: BusinessModelDetail[] = [
  {
    modeName: '1. Model Jasa Sewa Bulanan (SaaS / Subscription)',
    recommendedPrice: 'Rp 650.000 - Rp 1.500.000 / Bulan',
    description: 'Anda menghosting aplikasi di server agensi Anda. Brand skincare membayar biaya langganan bulanan atau tahunan untuk memakai infrastruktur sistem CRM keagenan ini.',
    pros: [
      'Arus kas berulang yang dapat diprediksi (Predictable Recurring Revenue) untuk kelangsungan agensi.',
      'Klien tidak perlu pusing menyiapkan hosting atau pemeliharaan server sendiri.',
      'Sangat mudah melakukan upsell fitur tambahan atau peningkatan batasan (seperti maksimal kuota stok atau maksimal jumlah agen).'
    ],
    cons: [
      'Agensi bertanggung jawab penuh menjaga server selalu uptime 24/7.',
      'Klien UMKM biasanya sangat sensitif terhadap biaya bulanan yang terus-menerus berjalan jika penjualan mereka sedang lesu.'
    ],
    verdict: 'SANGAT DIREKOMENDASIKAN untuk stabilitas jangka panjang agensi Anda. Berikan free trial 14 hari untuk menurunkan barrier to entry.'
  },
  {
    modeName: '2. Model Beli Putus (One-Off / White-label)',
    recommendedPrice: 'Rp 12.000.000 - Rp 25.000.000 (Sekali Bayar)',
    description: 'Klien membayar penuh di awal untuk kepemilikan software. Kode dipasangkan langsung ke server VPS dan domain pribadi milik brand skincare tersebut.',
    pros: [
      'Mendapatkan suntikan kas segar dalam jumlah besar secara cepat (ideal untuk menambah modal agensi).',
      'Tanggung jawab maintenance server jangka panjang beralih ke klien (kecuali mereka mengambil kontrak maintenance tambahan).',
      'Sangat disukai oleh brand kecantikan berskala agak besar yang protektif terhadap database user mereka.'
    ],
    cons: [
      'Pendapatan bersifat sekali-selesai saja (one-off), Anda harus terus mencari klien baru untuk tetap bertumbuh.',
      'Dukungan purna jual terkadang membebani jika klien banyak meminta revisi di luar kontrak asli.'
    ],
    verdict: 'TERBAIK untuk brand kosmetik yang sudah memiliki omzet mapan (>Rp 100 juta/bln) dan ingin kustomisasi alur bisnis yang sangat spesifik.'
  },
  {
    modeName: '3. Model Paket Cicilan (Lease to Own)',
    recommendedPrice: 'Rp 2.000.000 / Bulan (Selama 10-12 Bulan)',
    description: 'Menjembatani gap harga mahal Beli Putus dengan ketakutan sewa selamanya. Setelah cicilan lunas dalam jangka waktu yang disepakati, sistem sepenuhnya menjadi hak milik klien.',
    pros: [
      'Menjadi jembatan negosiasi yang luar biasa menarik bagi UMKM Skincare yang punya budget terbatas di awal.',
      'Konversi closing penjualan jauh lebih tinggi dibanding memaksa opsi Beli Putus secara langsung.',
      'Pendapatan agensi per klien secara total kumulatif menjadi lebih besar dibanding beli putus tunai.'
    ],
    cons: [
      'Ada risiko klien gagal bayar di tengah jalan sehingga agensi harus membekukan lisensi sistem.',
      'Butuh administrasi sanksi dan penagihan berkala.'
    ],
    verdict: 'SENJATA AMPUH UNTUK CLOSING! Gunakan opsi ini saat presentasi ketika klien mengeluh budget "Beli Putus" terlalu mahal.'
  }
];

export const SALES_PITCH_COPY = {
  hook: "Aplikasi Keagenan Skincare: Solusi Otonom Kunci Pertumbuhan Omzet Tanpa Bocor Harga dan Perang Diskon!",
  points: [
    {
      label: "Bicara Solusi Bisnis, Bukan Masalah Teknis",
      text: "Jangan bilang 'Sistem kami memakai PostgreSQL dan API NodeJS'. Tapi katakan: 'Sistem kami menjaga harga pasaran produk skincare Anda tidak hancur akibat perang harga antar reseller di daerah, sehingga reseller beralih loyal ke kompetitor.'"
    },
    {
      label: "Tekankan Penghematan Waktu Admin",
      text: "Katakan: 'Saat ini admin Anda habis waktunya seharian cuma buat cek mutasi transfer, hitung manual repeat order di WA, dan rekap poin di buku. Dengan aplikasi ini, semuanya berjalan otonom. Admin tinggal klik Setujui, kurir packing, dan total poin agen otomatis bertambah.'"
    },
    {
      label: "Faktor Kebanggaan (Prestige) Brand Owner",
      text: "Seorang pemilik brand skincare kosmetik lokal ingin brand-nya terlihat mapan dan profesional layaknya brand kosmetik raksasa nasional. Memiliki portal khusus keagenan (Mitra App) berlogo mereka sendiri adalah poin gengsi yang sangat krusial."
    }
  ]
};
