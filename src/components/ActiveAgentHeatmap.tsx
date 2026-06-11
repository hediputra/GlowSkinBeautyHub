/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  Map, 
  Globe, 
  Users, 
  TrendingUp, 
  Coins, 
  Sparkles,
  Layers,
  HelpCircle,
  Maximize2,
  RefreshCw,
  Info
} from 'lucide-react';
import { REGIONS_LOMBOK_MEDAN } from '../dbData';
import { MitraTier, MitraAccount } from '../types';

type HeatmapMetric = 'COUNT' | 'SPENT' | 'POINTS';

interface HeatmapDataCell {
  province: string;
  tier: MitraTier;
  count: number;
  totalSpent: number;
  totalPoints: number;
}

export default function ActiveAgentHeatmap() {
  const [metric, setMetric] = useState<HeatmapMetric>('COUNT');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 350 });
  const [selectedCell, setSelectedCell] = useState<HeatmapDataCell | null>(null);
  const [hoveredCell, setHoveredCell] = useState<HeatmapDataCell | null>(null);

  // Provinces list from dataset
  const provinces = Array.from(new Set(REGIONS_LOMBOK_MEDAN.map(m => m.province)));
  // Tiers list
  const tiers: MitraTier[] = ['distributor', 'agen', 'reseller'];

  // Agregasi data: Province x Tier
  const cellsData: HeatmapDataCell[] = [];
  provinces.forEach(prov => {
    tiers.forEach(tier => {
      const filtered = REGIONS_LOMBOK_MEDAN.filter(m => m.province === prov && m.tier === tier);
      const count = filtered.length;
      const totalSpent = filtered.reduce((sum, m) => sum + m.totalOrderSpent, 0);
      const totalPoints = filtered.reduce((sum, m) => sum + m.pointsAccumulated, 0);
      
      cellsData.push({
        province: prov,
        tier,
        count,
        totalSpent,
        totalPoints
      });
    });
  });

  // Handle ResizeObserver responsive width
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        // set responsive width, keeping height balanced
        setDimensions({
          width: Math.max(width, 320),
          height: 340
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Update D3 Render whenever metric, dimensions, or data changes
  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 30, right: 20, bottom: 40, left: 140 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scale Bands
    const xScale = d3.scaleBand<MitraTier>()
      .domain(tiers)
      .range([0, chartWidth])
      .padding(0.06);

    const yScale = d3.scaleBand<string>()
      .domain(provinces)
      .range([0, chartHeight])
      .padding(0.08);

    // Color Scales based on Selected Metric
    let colorScale: d3.ScaleLinear<string, string>;

    const getMetricValue = (d: HeatmapDataCell) => {
      if (metric === 'COUNT') return d.count;
      if (metric === 'SPENT') return d.totalSpent;
      return d.totalPoints;
    };

    const maxVal = d3.max(cellsData, getMetricValue) || 1;

    if (metric === 'COUNT') {
      // Pink Theme
      colorScale = d3.scaleLinear<string>()
        .domain([0, maxVal])
        .range(['#FFF1F2', '#DB2777']); // Tailwind pink-50 to pink-600
    } else if (metric === 'SPENT') {
      // Indigo Theme
      colorScale = d3.scaleLinear<string>()
        .domain([0, maxVal])
        .range(['#EEF2FF', '#4F46E5']); // Tailwind indigo-50 to indigo-600
    } else {
      // Purple Theme
      colorScale = d3.scaleLinear<string>()
        .domain([0, maxVal])
        .range(['#FAF5FF', '#7E22CE']); // Tailwind purple-50 to purple-700
    }

    // Build Tooltip or Set State for Interactions
    const showCellHighlight = (d: HeatmapDataCell) => {
      setHoveredCell(d);
    };

    // Draw Heatmap Cells (Rectangles)
    g.selectAll('.cell')
      .data(cellsData)
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.tier) || 0)
      .attr('y', d => yScale(d.province) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', d => getMetricValue(d) === 0 ? '#F8FAFC' : colorScale(getMetricValue(d))) // empty cells slate-50
      .attr('stroke', d => (selectedCell?.province === d.province && selectedCell?.tier === d.tier) ? '#0F172A' : '#E2E8F0')
      .attr('stroke-width', d => (selectedCell?.province === d.province && selectedCell?.tier === d.tier) ? 2 : 0.6)
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        showCellHighlight(d);
        d3.select(event.currentTarget)
          .attr('stroke-width', 2)
          .attr('stroke', '#DB2777');
      })
      .on('mouseout', (event, d) => {
        setHoveredCell(null);
        d3.select(event.currentTarget)
          .attr('stroke-width', (selectedCell?.province === d.province && selectedCell?.tier === d.tier) ? 2 : 0.6)
          .attr('stroke', (selectedCell?.province === d.province && selectedCell?.tier === d.tier) ? '#0F172A' : '#E2E8F0');
      })
      .on('click', (event, d) => {
        setSelectedCell(d);
      })
      .transition()
      .duration(350)
      .style('opacity', 1);

    // Draw Value Labels Inside the Cells 
    g.selectAll('.cell-text')
      .data(cellsData)
      .enter()
      .append('text')
      .attr('class', 'cell-text')
      .attr('x', d => (xScale(d.tier) || 0) + xScale.bandwidth() / 2)
      .attr('y', d => (yScale(d.province) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('text-anchor', 'middle')
      .style('font-family', 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace')
      .style('font-size', '10px')
      .style('font-weight', '700')
      .style('pointer-events', 'none')
      .style('fill', d => {
        const val = getMetricValue(d);
        if (val === 0) return '#94A3B8'; // gray
        return val > maxVal * 0.55 ? '#FFFFFF' : '#1E293B'; // readable threshold
      })
      .text(d => {
        const val = getMetricValue(d);
        if (val === 0) return '-';
        if (metric === 'COUNT') return `${val} Mitra`;
        if (metric === 'SPENT') {
          if (val >= 1e6) return `${(val / 1e6).toFixed(1)}jt`;
          return `${val / 1e3}rb`;
        }
        return val;
      });

    // Draw Left Y-Axis (Provinces)
    g.append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).tickSize(0))
      .select('.domain').remove();

    g.selectAll('.y-axis text')
      .style('font-family', '"Inter", ui-sans-serif, system-ui, sans-serif')
      .style('font-size', '10.5px')
      .style('font-weight', '600')
      .style('fill', '#334155');

    // Draw Bottom X-Axis (Mitra Tiers Labels)
    const xAxisG = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .select('.domain').remove();

    g.selectAll('.x-axis text')
      .style('font-family', '"Inter", ui-sans-serif, system-ui, sans-serif')
      .style('font-size', '11px')
      .style('font-weight', '700')
      .style('fill', '#475569')
      .text(d => {
        const word = String(d);
        return word.charAt(0).toUpperCase() + word.slice(1);
      });

  }, [metric, dimensions, selectedCell]);

  // Insights Metrics Calculations
  const busiestProvince = React.useMemo(() => {
    const countsMap: { [key: string]: number } = {};
    const spentMap: { [key: string]: number } = {};
    REGIONS_LOMBOK_MEDAN.forEach(m => {
      countsMap[m.province] = (countsMap[m.province] || 0) + 1;
      spentMap[m.province] = (spentMap[m.province] || 0) + m.totalOrderSpent;
    });

    const entries = Object.entries(countsMap);
    if (!entries.length) return { name: '-', size: 0, sales: 0 };
    const topProv = entries.sort((a, b) => b[1] - a[1])[0];
    return {
      name: topProv[0],
      size: topProv[1],
      sales: spentMap[topProv[0]] || 0
    };
  }, []);

  return (
    <div id="agent-heatmap-container" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-pink-50 rounded-2xl text-pink-600 border border-pink-100 shrink-0">
            <Globe className="w-6 h-6 animate-spin-slow text-pink-500" />
          </div>
          <div>
            <h4 className="font-sans font-extrabold text-slate-900 text-base md:text-lg flex items-center gap-1.5">
              Heatmap Kepadatan Kemitraan Aktif
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                D3 Engine
              </span>
            </h4>
            <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
              Petakan sebaran wilayah logistik kosmetik secara visual untuk mengidentifikasi market potensial UMKM kosmetik Anda.
            </p>
          </div>
        </div>

        {/* METRIC TOOGLE TRIGGER */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-1 flex gap-1 self-start md:self-auto">
          <button
            id="heatmap-btn-count"
            onClick={() => setMetric('COUNT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              metric === 'COUNT'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Kepadatan Mitra</span>
          </button>
          
          <button
            id="heatmap-btn-spent"
            onClick={() => setMetric('SPENT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              metric === 'SPENT'
                ? 'bg-indigo-650 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Volume Belanja RO</span>
          </button>

          <button
            id="heatmap-btn-points"
            onClick={() => setMetric('POINTS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              metric === 'POINTS'
                ? 'bg-purple-650 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Poin Loyalitas</span>
          </button>
        </div>
      </div>

      {/* MATRIX AND BENTO INFO SIDE BY SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Heatmap Visual Canvas */}
        <div className="lg:col-span-8 space-y-4">
          <div 
            ref={containerRef} 
            className="w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-4 overflow-x-auto relative"
          >
            
            {/* SVG Visual Element rendering D3 */}
            <svg 
              ref={svgRef} 
              className="mx-auto block"
              id="active-agents-density-svg-heatmap"
            ></svg>

            {/* Scale Legends */}
            <div className="flex items-center justify-between px-4 pt-2 border-t border-slate-200/40 text-[10px] text-slate-400 font-mono font-semibold">
              <span>Intensitas Rendah (Zero / Low)</span>
              
              <div className="flex items-center gap-1">
                <span>Skala Gradasi:</span>
                <div className={`w-28 h-2.5 rounded-sm ${
                  metric === 'COUNT' 
                    ? 'bg-gradient-to-r from-rose-50 to-pink-600' 
                    : metric === 'SPENT' 
                    ? 'bg-gradient-to-r from-indigo-50 to-indigo-600'
                    : 'bg-gradient-to-r from-purple-50 to-purple-700'
                }`}></div>
              </div>

              <span>Saturasi Tinggi (Dense Peak)</span>
            </div>
            
          </div>
        </div>

        {/* SIDE BAR DETAILS & REAL-TIME DEMO CARD */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Quick Stats Bento Box */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
            <span className="text-[9px] font-extrabold text-pink-500 uppercase tracking-widest block font-mono">
              Market Kepadatan Utama
            </span>
            
            <div className="mt-3.5 space-y-4">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase font-mono">Provinsi Paling Ramai</p>
                <p className="text-xl font-extrabold text-white mt-0.5">{busiestProvince.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Mampu menyerap total <strong className="text-slate-200">{busiestProvince.size} akun mitra</strong> terverifikasi dengan total order spent mencapai <strong className="text-pink-400">Rp {busiestProvince.sales.toLocaleString('id-ID')}</strong>.
                </p>
              </div>

              <div className="border-t border-slate-800/80 pt-3.5">
                <p className="text-slate-400 text-[10px] font-bold uppercase font-mono flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Insight Konsultasi Bisnis
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                  Sebaiknya fokuskan suplai logistik dan promo kargo di wilayah dengan densitas tinggi untuk menekan ongkos kirim (ongkir) bagi agen wilayah.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Cell Display Panel */}
          <div className="bg-slate-50 border border-slate-200/70 p-5 rounded-2xl flex flex-col justify-between space-y-4">
            
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">Detail Sel Terpilih</span>
              </div>
              
              {selectedCell ? (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-xs font-bold text-slate-700">{selectedCell.province}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-900 text-white rounded-full uppercase tracking-wider">
                      {selectedCell.tier}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-slate-700 font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-450 block uppercase font-bold">Kuantitas Agen</span>
                      <span className="text-xs font-extrabold text-slate-900 block mt-0.5">{selectedCell.count} Mitra</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-450 block uppercase font-bold">Total Pembelian (RO)</span>
                      <span className="text-xs font-extrabold text-slate-900 block mt-0.5">Rp {selectedCell.totalSpent.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="col-span-2 border-t border-dashed border-slate-200/80 pt-2">
                      <span className="text-[9px] text-slate-450 block uppercase font-bold">Akumulasi Loyalitas</span>
                      <span className="text-xs font-extrabold text-pink-650 block mt-0.5 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-pink-500" /> {selectedCell.totalPoints} Poin Terdaftar
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 leading-relaxed italic pt-1">
                  Arahkan kursor Anda atau klik salah satu sel persegi heatmap untuk menelaah performa dan tingkat loyalitas spesifik level reseller/distributor di setiap wilayah.
                </p>
              )}
            </div>

            {/* Hover preview */}
            {hoveredCell && (
              <div className="bg-white border border-slate-200 rounded-xl p-2 px-3 text-[10px] shadow-sm flex items-center justify-between font-mono animate-fade-in">
                <span className="font-sans font-bold text-slate-800">{hoveredCell.province} ({hoveredCell.tier})</span>
                <span className="font-extrabold text-pink-500">
                  {metric === 'COUNT' && `${hoveredCell.count} Mitra`}
                  {metric === 'SPENT' && `Rp ${hoveredCell.totalSpent.toLocaleString('id-ID')}`}
                  {metric === 'POINTS' && `${hoveredCell.totalPoints} Poin`}
                </span>
              </div>
            )}
            
          </div>

        </div>

      </div>

    </div>
  );
}
