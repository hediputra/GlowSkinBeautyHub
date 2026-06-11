/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { VALUE_PROPOSITIONS, BUSINESS_MODELS, SALES_PITCH_COPY } from '../marketingData';
import { Award, Briefcase, Calculator, HeartHandshake, TrendingUp, DollarSign, Users, Clock, Flame, Percent, Activity, FileDown, Printer } from 'lucide-react';
import { motion } from 'motion/react';
import { jsPDF } from 'jspdf';
import MitraLeaderboard from './MitraLeaderboard';
import ActiveAgentHeatmap from './ActiveAgentHeatmap';
import ProjectedRevenueCalculator from './ProjectedRevenueCalculator';
import ProfitMarginCalculator from './ProfitMarginCalculator';
import AnnualRevenueForecast from './AnnualRevenueForecast';
import BusinessFAQ from './BusinessFAQ';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ComposedChart
} from 'recharts';

export default function MarketingPitchDeck() {
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [activeChartTab, setActiveChartTab] = useState<'AGENCY' | 'ROI' | 'TIERS'>('AGENCY');
  
  // Custom Agency revenue calculator states
  const [targetClients, setTargetClients] = useState(5);
  const [saasPriceInput, setSaasPriceInput] = useState(850000); // Rp 850,000 / month
  const [oneOffPriceInput, setOneOffPriceInput] = useState(15000000); // Rp 15,000,000 outright

  // Revenue projection calculation
  const monthlyRecurringRevenue = targetClients * saasPriceInput;
  const annualSaasRevenue = monthlyRecurringRevenue * 12;
  const totalOneOffRevenue = targetClients * oneOffPriceInput;

  // 1. Agency 12-Month Cumulative Projection: SaaS vs One-Off
  const agencyChartData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const saasCumulative = targetClients * saasPriceInput * month;
    const oneOffFixed = targetClients * oneOffPriceInput;
    return {
      name: `Bln ${month}`,
      'SaaS (Kumulatif)': saasCumulative,
      'Beli Putus': oneOffFixed,
    };
  });

  // 2. Client ROI Comparison (Tradisional vs automated CRM)
  const clientRoiData = [
    {
      name: 'Operasional Staff',
      'Tradisional (Manual)': 4000000,
      'Sistem Otonom (CRM)': 1500000,
    },
    {
      name: 'Penyusutan Error',
      'Tradisional (Manual)': 2000000,
      'Sistem Otonom (CRM)': 0,
    },
    {
      name: 'Biaya Sewa Sistem',
      'Tradisional (Manual)': 0,
      'Sistem Otonom (CRM)': saasPriceInput,
    },
  ];

  // 3. Subscription Tiers Capacities (Lite, Standard, Enterprise)
  const subscriptionTiersData = [
    {
      name: 'Lite Plan',
      'Biaya Bulanan': 450000,
      'Kapasitas Mitra (Orang)': 15,
    },
    {
      name: 'Standard Plan',
      'Biaya Bulanan': saasPriceInput,
      'Kapasitas Mitra (Orang)': 100,
    },
    {
      name: 'Enterprise Plan',
      'Biaya Bulanan': Math.max(1800000, saasPriceInput * 2 + 300000),
      'Kapasitas Mitra (Orang)': 500,
    },
  ];

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-2.5 rounded-xl shadow-xl font-sans text-[11px] text-white">
          <p className="font-bold mb-1 border-b border-slate-800 pb-1">{label}</p>
          <div className="space-y-1">
            {payload.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}:</span>
                </span>
                <span className="font-mono font-bold" style={{ color: item.color }}>
                  {typeof item.value === 'number' && item.value >= 1000 
                    ? `Rp ${item.value.toLocaleString('id-ID')}` 
                    : item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Generate downloadable/printable executive prospectus PDF
  const generateProspectusPdf = () => {
    // Initialize jsPDF (A4, portrait, mm)
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Page dimensions
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2); // 180mm
    
    let y = 20;

    // Helper functions for formatting & page bounds
    const checkHeight = (neededHeight: number) => {
      if (y + neededHeight > 275) {
        doc.addPage();
        y = 20;
        
        // Header watermark on new page
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // Slate 400
        doc.text('BeautyHub Blueprint - Strategi Sistem Otonom Keagenan Skincare', margin, 12);
        
        // Pink header thin decorator line
        doc.setDrawColor(236, 72, 153); // Pink 500
        doc.setLineWidth(0.3);
        doc.line(margin, 14, pageWidth - margin, 14);
      }
    };

    const drawHeaderAndFooter = (pageNumber: number) => {
      // First page top accent colored shape
      if (pageNumber === 1) {
        doc.setFillColor(252, 231, 243); // pink 100
        doc.rect(140, 0, 70, 32, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(219, 39, 119); // pink 600
        doc.text('UMKM BLUEPRINT', 145, 12);
      }

      // Consistent page footer separator
      doc.setDrawColor(241, 245, 249); // slate 100
      doc.setLineWidth(0.5);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate 400
      doc.text('Rahasia Dagang & Blueprint Komersial Keagenan - BeautyHub Portal', margin, pageHeight - 10);
      doc.text(`Halaman ${pageNumber}`, pageWidth - margin - 15, pageHeight - 10);
    };

    // Draw first page elements
    drawHeaderAndFooter(1);

    // Title / Header decoration on Page 1
    doc.setFillColor(236, 72, 153); // Pink 500
    doc.rect(margin, y, 4, 18, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(236, 72, 153); // Pink 500
    doc.text('BEAUTYHUB PARTNERSHIP NETWORK', margin + 8, y + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(15, 23, 42); // Slate 900
    doc.text('PROSPEKTUS STRATEGI SISTEM KEAGENAN OTONOM', margin + 8, y + 12);

    y += 24;

    // Subtitle text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105); // Slate 600
    const promoDesc = 'Sebuah panduan komersial untuk menertibkan arus distribusi skincare lokal, mencegah kebocoran margin akibat perang diskon di WhatsApp/Excel, serta mengotomatisasi repeat order (RO) mitra skala wilayah.';
    const splitPromo = doc.splitTextToSize(promoDesc, contentWidth);
    doc.text(splitPromo, margin, y);
    y += splitPromo.length * 5 + 4;

    // Meta metadata box
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.3);
    doc.rect(margin, y, contentWidth, 22, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('INFORMASI METADATA BLUEPRINT:', margin + 4, y + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(`Format: Prospektus Strategi Takeaway (Printable)`, margin + 4, y + 12);
    doc.text(`Tanggal Cetak: 11 Juni 2026`, margin + 4, y + 17);
    doc.text(`Arsitektur: Sistem Otonom CRM Keagenan Hub`, pageWidth - margin - 85, y + 12);
    doc.text(`Disiapkan untuk: Pemilik Brand Kosmetik UMKM`, pageWidth - margin - 85, y + 17);

    y += 30;

    // SECTION 1: VALUE PROPOSITION
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('I. INVESTASI NILAI UTAMA (CORE VALUE PROPOSITION)', margin, y);
    y += 3;
    
    doc.setDrawColor(219, 39, 119);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 40, y);
    y += 7;

    VALUE_PROPOSITIONS.forEach((val, index) => {
      checkHeight(40);
      
      // Card Box background
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.4);
      doc.rect(margin, y, contentWidth, 31, 'FD');

      // Card marker
      doc.setFillColor(251, 207, 232); // Pink 200
      doc.rect(margin + 2, y + 2, 3.5, 27, 'F');

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(`${index + 1}. ${val.title}`, margin + 8, y + 6);

      // Subtitle
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(219, 39, 119); // Pink 600
      doc.text(val.subTitle, margin + 8, y + 10);

      // Content text wrapping
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      
      const probText = `Masalah: ${val.problem}`;
      const solText = `Solusi Aplikasi: ${val.solution}`;
      const roiText = `Dampak Finansial (ROI): ${val.roiHighlight}`;

      const splitProb = doc.splitTextToSize(probText, contentWidth - 15);
      const splitSol = doc.splitTextToSize(solText, contentWidth - 15);

      doc.text(splitProb, margin + 8, y + 14);
      doc.text(splitSol, margin + 8, y + 18.5);

      // ROI highlight text in bold green/pink
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(16, 185, 129); // Emerald 500
      doc.text(roiText, margin + 8, y + 26);

      y += 35;
    });

    // SECTION 2: ROI ANALYSES & SAVINGS
    checkHeight(65);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('II. ANALISIS ROI & SIMULASI EFISIENSI OPERASIONAL', margin, y);
    y += 3;
    
    doc.setDrawColor(219, 39, 119);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 40, y);
    y += 8;

    // ROI Table
    // Header
    doc.setFillColor(15, 23, 42); // Dark slate header
    doc.rect(margin, y, contentWidth, 8, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('Kategori Pengadaan / Operasional', margin + 4, y + 5.5);
    doc.text('Cara Tradisional (Manual WA)', margin + 75, y + 5.5);
    doc.text('Sistem Otonom (CRM)', margin + 130, y + 5.5);

    y += 8;

    // Row 1
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Biaya Staff Admin (Rekap & Kasir)', margin + 4, y + 5.5);
    doc.text('Rp 4.000.000 / bln', margin + 75, y + 5.5);
    doc.text('Rp 1.500.000 / bln', margin + 130, y + 5.5);
    y += 8;

    // Row 2
    doc.setFillColor(248, 250, 252);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.text('Kebocoran Harga & Human Error', margin + 4, y + 5.5);
    doc.text('Rp 2.000.000 / bln', margin + 75, y + 5.5);
    doc.text('Rp 0 (Terkunci Sistem)', margin + 130, y + 5.5);
    y += 8;

    // Row 3
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.text('Biaya Lisensi Sewa Aplikasi', margin + 4, y + 5.5);
    doc.text('Rp 0', margin + 75, y + 5.5);
    doc.text(`Rp ${saasPriceInput.toLocaleString('id-ID')} / bln`, margin + 130, y + 5.5);
    y += 8;

    // Row Total
    const totalTraditional = 6000000;
    const totalAutonom = 1500000 + saasPriceInput;
    const monthlySaving = totalTraditional - totalAutonom;
    const annualSaving = monthlySaving * 12;

    doc.setFillColor(253, 242, 248); // ultra light pink
    doc.rect(margin, y, contentWidth, 9, 'F');
    doc.setDrawColor(219, 39, 119);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + contentWidth, y);
    doc.line(margin, y + 9, margin + contentWidth, y + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('ESTIMASI TOTAL BULANAN', margin + 4, y + 6);
    doc.text(`Rp ${totalTraditional.toLocaleString('id-ID')}`, margin + 75, y + 6);
    doc.setTextColor(219, 39, 119); // Pink for autonomous total
    doc.text(`Rp ${totalAutonom.toLocaleString('id-ID')}`, margin + 130, y + 6);
    
    y += 14;

    // Savings Highlight
    doc.setFillColor(240, 253, 250); // Light emerald
    doc.setDrawColor(16, 185, 129); // Emerald 500
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentWidth, 14, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('PENGHEMATAN BULANAN HASIL SIMULASI:', margin + 4, y + 5);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(5, 150, 105); // Darker emerald text
    doc.text(`Membantu Brand Anda menghemat Rp ${monthlySaving.toLocaleString('id-ID')}/bln (Setara Rp ${annualSaving.toLocaleString('id-ID')}/thn) untuk alokasi iklan!`, margin + 4, y + 10);

    y += 22;

    // SECTION 3: SUBSCRIPTION TIERS & CAPACITY
    checkHeight(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('III. MODEL KERJASAMA & PEMBAGIAN JENJANG KAPASITAS', margin, y);
    y += 3;
    
    doc.setDrawColor(219, 39, 119);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 40, y);
    y += 7;

    // Render subscription tiers bullet list
    subscriptionTiersData.forEach((tier) => {
      checkHeight(15);
      doc.setFillColor(219, 39, 119);
      doc.circle(margin + 3, y + 1.5, 0.8, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${tier.name}: `, margin + 7, y + 2.5);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.text(`Penyewaan bulanan Rp ${tier['Biaya Bulanan'].toLocaleString('id-ID')} dengan limitasi kapasitas maksimal ${tier['Kapasitas Mitra (Orang)']} mitra aktif secara online.`, margin + 30, y + 2.5);
      y += 5.5;
    });

    y += 4;

    // SECTION 4: STRATEGI IMPLEMENTASI / PITCHING
    checkHeight(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('IV. STRATEGI IMPLEMENTASI & TARGET PENCAPAIAN', margin, y);
    y += 3;
    
    doc.setDrawColor(219, 39, 119);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 40, y);
    y += 6;

    // Sales pitch content
    SALES_PITCH_COPY.points.forEach((point) => {
      checkHeight(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${point.label}`, margin + 2, y + 3);
      
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      const splitText = doc.splitTextToSize(`"${point.text}"`, contentWidth - 6);
      doc.text(splitText, margin + 6, y + 7);
      y += splitText.length * 4 + 6;
    });

    // Signature Area
    checkHeight(35);
    y += 6;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + contentWidth, y);
    
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Disiapkan secara resmi oleh,', margin + 10, y);
    doc.text('Disetujui & Diterima oleh,', pageWidth - margin - 55, y);

    y += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Tim Konsultan BeautyHub', margin + 10, y);
    doc.text('_______________________', pageWidth - margin - 55, y);
    
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('SaaS Engineering Partner', margin + 10, y + 4);
    doc.text('UMKM Brand Owner / Direktur', pageWidth - margin - 55, y + 4);

    // Dynamic footers on page numbers recalculation
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawHeaderAndFooter(i);
    }

    // Save PDF
    doc.save(`Prospektus_Sistem_Otonom_BeautyHub_${targetClients}_Klien.pdf`);
  };

  return (
    <div id="marketing-pitch-deck-container" className="space-y-8">
      
      {/* Sales pitching intro */}
      <div className="bg-gradient-to-r from-slate-950 via-pink-950/20 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-pink-500/20 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl"></div>
        <span className="px-3 py-1 bg-pink-500/10 text-pink-300 border border-pink-500/20 text-xs font-bold rounded-full uppercase tracking-wider">
          Commercial Blueprint
        </span>
        <h3 className="font-sans text-2xl md:text-3xl text-pink-300 mt-2 font-bold">
          Strategi Pemasaran Aplikasi ke Brand Owner UMKM Skincare
        </h3>
        <p className="text-slate-300 text-xs md:text-sm mt-3 max-w-3xl leading-relaxed">
          Jangan menjual "baris kode" atau "database relasional" ke pemilik brand kosmetik. Mereka adalah pebisnis.
          Pintu masuk negosiasi terbaik adalah menceritakan bagimana sistem ini dapat **menghentikan perang harga antar mitra**,
          **memotong ongkir konsumen**, dan **membuat mitra setia melakukan repeat order berkala**.
        </p>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
            💡 <strong>Materi Brosur Takeaway:</strong> Cetak Prospektus Strategi & kalkulasi laba/rugi ini sebagai dokumen fisik representatif untuk meluluhkan keraguan calon klien brand kosmetik Anda. PDF menyisipkan performa ROI & data limitasi langganan interaktif.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <button
              id="btn-print-marketing"
              onClick={() => window.print()}
              className="no-print flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-350 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Cetak Halaman (Print)</span>
            </button>
            <button
              id="btn-download-prospectus"
              onClick={generateProspectusPdf}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-lg shadow-pink-950/40 hover:shadow-pink-500/20 whitespace-nowrap shrink-0 hover:scale-[1.02]"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Prospektus PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid structure: Value Translate, Pricing calculation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Core business values translate (Humble human language translation) */}
        <div className="lg:col-span-6 space-y-6">
          <h4 className="font-sans font-bold text-slate-900 text-lg flex items-center gap-2 border-l-3 border-pink-500 pl-2">
            <HeartHandshake className="w-5 h-5 text-pink-500" />
            Terjemahan Fitur Menjadi Value Bisnis Tinggi (Pitching Deck)
          </h4>

          <div className="space-y-4">
            {VALUE_PROPOSITIONS.map((prop, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex gap-4 hover:border-pink-300 transition-all hover:shadow"
              >
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 shrink-0 shadow-sm">
                  {idx === 0 && <Clock className="w-5 h-5" />}
                  {idx === 1 && <Award className="w-5 h-5" />}
                  {idx === 2 && <TrendingUp className="w-5 h-5" />}
                  {idx === 3 && <Briefcase className="w-5 h-5" />}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {prop.subTitle}
                    </span>
                    <h5 className="font-sans font-bold text-slate-900 text-sm md:text-base leading-snug">
                      {prop.title}
                    </h5>
                  </div>

                  <p className="text-xs text-slate-650 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200/40">
                    <strong className="text-pink-700 block text-[10px] uppercase font-bold mb-1">Masalah UMKM:</strong>
                    {prop.problem}
                  </p>
                  
                  <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                    <strong className="text-emerald-700 block text-[10px] uppercase font-bold mb-1">Solusi Sistem:</strong>
                    {prop.solution}
                  </p>

                  <div className="text-[11px] font-bold text-pink-600 flex items-center gap-1 mt-1">
                    <Flame className="w-3.5 h-3.5 shrink-0 animate-pulse text-pink-500" />
                    <span>Dampak Finansial (ROI): {prop.roiHighlight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Model recommendation and your calculations */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h4 className="font-sans font-bold text-slate-900 mb-2 flex items-center gap-2 text-base">
              <Calculator className="w-5 h-5 text-pink-500" />
              Proyeksi Pendapatan Bisnis Software Anda
            </h4>
            <p className="text-slate-500 text-xs mb-5">
              Simulasikan jumlah klien produk kecantikan kosmetik lokal dan atur biaya langganan untuk mengetahui kelayakannya.
            </p>

            <div className="space-y-4">
              
              {/* Target Clients input */}
              <div>
                <label className="block text-xs font-bold text-slate-650 mb-1.5 flex items-center gap-1.5 uppercase">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target Jumlah Klien Brand Skincare</span>
                </label>
                <input
                  id="input-target-clients"
                  type="number"
                  min="1"
                  max="100"
                  value={targetClients}
                  onChange={(e) => setTargetClients(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-pink-300 transition-colors"
                />
              </div>

              {/* Set package prices */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-650 mb-1.5 flex items-center gap-1.5 uppercase">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sewa SaaS / Bulan</span>
                  </label>
                  <input
                    id="input-saas-price"
                    type="number"
                    step="50000"
                    value={saasPriceInput}
                    onChange={(e) => setSaasPriceInput(Math.max(100000, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-pink-300 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 mb-1.5 flex items-center gap-1.5 uppercase">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>Beli Putus (One-time)</span>
                  </label>
                  <input
                    id="input-oneoff-price"
                    type="number"
                    step="500000"
                    value={oneOffPriceInput}
                    onChange={(e) => setOneOffPriceInput(Math.max(1000000, Number(e.target.value)))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-pink-300 transition-colors"
                  />
                </div>
              </div>

              {/* Projections breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                  Estimasi Omzet Agensi Software Anda
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Bila Skema Sewa Bulanan (SaaS)</span>
                    <span className="text-xs font-extrabold text-slate-900 block mt-1 font-mono">
                      Rp {monthlyRecurringRevenue.toLocaleString('id-ID')}/bln
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 mt-0.5 block">
                      Rp {annualSaasRevenue.toLocaleString('id-ID')}/thn (MRR)
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Bila Skema Beli Putus</span>
                    <span className="text-xs font-extrabold text-slate-900 block mt-1 font-mono">
                      Rp {totalOneOffRevenue.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[9px] text-slate-400 mt-0.5 block italic font-mono">
                      Pendapatan Tunai Cepat
                    </span>
                  </div>
                </div>
              </div>

              {/* BRAND NEW INTERACTIVE CHART VISUALIZER */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
                    Kalkulator & ROI Interaktif (Recharts)
                  </span>
                  <span className="text-[11px] text-slate-500 leading-normal">
                    Visualisasikan pertumbuhan MRR agensi dan analisis penghematan bagi klien UMKM.
                  </span>
                </div>

                {/* Sub-tabs buttons */}
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    id="chart-btn-agency"
                    type="button"
                    onClick={() => setActiveChartTab('AGENCY')}
                    className={`py-1.5 px-1 text-[11px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                      activeChartTab === 'AGENCY'
                        ? 'bg-white text-pink-600 shadow-sm border border-slate-200/50'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    Agensi SaaS
                  </button>
                  <button
                    id="chart-btn-roi"
                    type="button"
                    onClick={() => setActiveChartTab('ROI')}
                    className={`py-1.5 px-1 text-[11px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                      activeChartTab === 'ROI'
                        ? 'bg-white text-pink-600 shadow-sm border border-slate-200/50'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    UMKM ROI
                  </button>
                  <button
                    id="chart-btn-tiers"
                    type="button"
                    onClick={() => setActiveChartTab('TIERS')}
                    className={`py-1.5 px-1 text-[11px] font-bold rounded-lg transition-all text-center cursor-pointer ${
                      activeChartTab === 'TIERS'
                        ? 'bg-white text-pink-600 shadow-sm border border-slate-200/50'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    Tiers Paket
                  </button>
                </div>

                {/* CHART CONTAINER */}
                <div className="h-[210px] w-full bg-slate-50/50 p-2 rounded-xl border border-slate-200/40 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={195}>
                    {activeChartTab === 'AGENCY' ? (
                      <AreaChart data={agencyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorSaas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#db2777" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#db2777" stopOpacity={0.0}/>
                          </linearGradient>
                          <linearGradient id="colorOneOff" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64748b" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#64748b" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={8} tickFormatter={(val) => `Rp${(val / 1e6).toFixed(0)}jt`} width={40} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 9 }} iconSize={8} />
                        <Area type="monotone" name="Kumulatif SaaS" dataKey="SaaS (Kumulatif)" stroke="#db2777" strokeWidth={2} fillOpacity={1} fill="url(#colorSaas)" />
                        <Area type="monotone" name="Beli Putus" dataKey="Beli Putus" stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorOneOff)" />
                      </AreaChart>
                    ) : activeChartTab === 'ROI' ? (
                      <BarChart data={clientRoiData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={8} tickFormatter={(val) => `Rp${(val / 1e6).toFixed(1)}jt`} width={40} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 9 }} iconSize={8} />
                        <Bar name="Tradisional (Manual)" dataKey="Tradisional (Manual)" fill="#64748b" radius={[4, 4, 0, 0]} />
                        <Bar name="Sistem Otonom (CRM)" dataKey="Sistem Otonom (CRM)" fill="#db2777" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <ComposedChart data={subscriptionTiersData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                        <YAxis yAxisId="left" stroke="#94a3b8" fontSize={8} tickFormatter={(val) => `Rp${(val / 1e3)}k`} width={40} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#7c3aed" fontSize={8} tickFormatter={(val) => `${val}`} width={20} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 9 }} iconSize={8} />
                        <Bar yAxisId="right" name="Limit Multi-Mitra (Kapasitas)" dataKey="Kapasitas Mitra (Orang)" fill="#7c3aed" opacity={0.35} barSize={25} radius={[4, 4, 0, 0]} />
                        <Line yAxisId="left" type="monotone" name="Biaya Bulanan" dataKey="Biaya Bulanan" stroke="#db2777" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </ComposedChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Sub-chart dynamics text commentary */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50 text-[11px] leading-relaxed text-slate-650 space-y-1">
                  {activeChartTab === 'AGENCY' && (
                    <p>
                      💡 <strong>Stabilitas Jangka Panjang:</strong> Kumulatif pendapatan SaaS berulang melampaui kas Beli Putus seiring waktu berjalan. Model SaaS menawarkan <em>predictable recurring revenue</em> yang berkelanjutan bagi pertumbuhan agensi software Anda.
                    </p>
                  )}
                  {activeChartTab === 'ROI' && (
                    <div>
                      <p>
                        📈 <strong>Analisis ROI Klien Brand:</strong>
                      </p>
                      <p className="font-semibold text-pink-600 mt-0.5 leading-normal">
                        Sistem menghemat biaya operasional bulanan dari Rp 6.000.000 menjadi hanya Rp {(1500000 + saasPriceInput).toLocaleString('id-ID')}/bulan. Brand hemat Rp {(6000000 - (1500000 + saasPriceInput)).toLocaleString('id-ID')}/bulan (Rp {((6000000 - (1500000 + saasPriceInput)) * 12).toLocaleString('id-ID')}/tahun!).
                      </p>
                    </div>
                  )}
                  {activeChartTab === 'TIERS' && (
                    <p>
                      📊 <strong>Sistem Langganan Berjenjang:</strong> Pembagian batasan kapasitas kuota mitra (Lite: 15, Standard: 100, Enterprise: 500) menguntungkan agensi, karena brand skincare akan melakukan upgrade paket secara organik saat jaringan mitra lokal mereka membesar.
                    </p>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Model Bisnis Selector tabs */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h5 className="font-sans font-bold text-slate-900 text-sm">Rekomendasi 3 Opsi Model Bisnis Paket</h5>
            
            {/* Model select buttons */}
            <div className="flex flex-col gap-2">
              {BUSINESS_MODELS.map((model, index) => (
                <button
                  key={index}
                  id={`btn-model-${index}`}
                  onClick={() => setSelectedModelIndex(index)}
                  className={`p-3 text-left rounded-xl border transition-all text-xs font-semibold flex flex-col cursor-pointer ${
                    selectedModelIndex === index
                      ? 'bg-pink-50/55 border-pink-300 text-pink-905 shadow-sm'
                      : 'bg-slate-5/50 bg-slate-50 hover:bg-slate-100/70 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="block font-bold">{model.modeName}</span>
                  <span className={`text-[10px] block mt-0.5 ${selectedModelIndex === index ? 'text-pink-600' : 'text-slate-400'}`}>
                    Saran Harga Jual: {model.recommendedPrice}
                  </span>
                </button>
              ))}
            </div>

            {/* Selected model details */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3 shadow-inner">
              <p className="text-slate-650 leading-relaxed font-medium">
                {BUSINESS_MODELS[selectedModelIndex].description}
              </p>

              <div>
                <strong className="text-emerald-700 text-[10px] block uppercase font-bold mb-1">Kelebihan Model Ini:</strong>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  {BUSINESS_MODELS[selectedModelIndex].pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div>
                <strong className="text-pink-700 text-[10px] block uppercase font-bold mb-1">Tantangan Model Ini:</strong>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  {BUSINESS_MODELS[selectedModelIndex].cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-200 text-[11px] font-bold text-pink-700">
                ⭐ Kesimpulan Ahli: {BUSINESS_MODELS[selectedModelIndex].verdict}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Real-time Mitra Leaderboard Panel Segment */}
      <div className="grid grid-cols-1 gap-8">
        <MitraLeaderboard />
        <ActiveAgentHeatmap />
        <ProjectedRevenueCalculator />
        <ProfitMarginCalculator />
        <AnnualRevenueForecast />
        <BusinessFAQ />
      </div>
    </div>
  );
}
