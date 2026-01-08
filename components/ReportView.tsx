import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { Calendar, Check, AlertCircle } from 'lucide-react';
import { AdProduct } from '../types';

interface ReportViewProps {
  products: AdProduct[];
}

interface DailyData {
  date: string;
  impressions: number;
  clicks: number;
  orders: number;
  sales: number;
  spend: number;
  [key: string]: string | number;
}

export const ReportView: React.FC<ReportViewProps> = ({ products }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  
  const [reportScope, setReportScope] = useState<string>('account');
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set(['sales', 'orders', 'impressions']));
  const [chartData, setChartData] = useState<DailyData[]>([]);

  const metricsOptions = [
    { id: 'sales', label: '成交金额 (GMV)', axis: 'y' },
    { id: 'orders', label: '成交单数', axis: 'y' },
    { id: 'impressions', label: '曝光量', axis: 'y' },
    { id: 'clicks', label: '点击量', axis: 'y' },
    { id: 'spend', label: '花费', axis: 'y' },
    { id: 'ctr', label: '点击率', axis: 'y1' },
    { id: 'cvr', label: '转化率', axis: 'y1' },
    { id: 'roas', label: 'ROAS', axis: 'y1' },
  ];

  const toggleMetric = (id: string) => {
    const newSet = new Set(selectedMetrics);
    if (newSet.has(id)) {
      if (newSet.size > 1) newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedMetrics(newSet);
  };

  // Initial Data Generation (Correlated Logic with Lag)
  useEffect(() => {
    const generateInitialData = () => {
      const data: DailyData[] = [];
      const today = new Date();
      const days = 30;
      
      const impressionTrend: number[] = [];
      let currentImpressions = 500;

      // 1. Generate Trend (Chronological: 30 days ago -> Today)
      for (let i = 0; i <= days; i++) {
         // Growth Pattern: Slow Start -> Boom -> Stable High
         if (i < 5) {
             currentImpressions += Math.random() * 50;
         } else if (i < 15) {
             currentImpressions += 800 + Math.random() * 600; // Explosive growth
         } else {
             currentImpressions += (Math.random() - 0.5) * 400; // Stable fluctuation
         }
         
         // Add randomness but keep trend
         const dailyImp = Math.floor(Math.max(100, currentImpressions * (0.9 + Math.random() * 0.2)));
         impressionTrend.push(dailyImp);
      }

      // 2. Generate Daily Data based on Trend & Lag
      for (let i = 0; i <= days; i++) {
         const d = new Date();
         d.setDate(today.getDate() - (days - i));
         const dateStr = (d.getMonth() + 1) + '/' + d.getDate();
         
         const todayImp = impressionTrend[i];
         
         // Lag Logic: 
         // "Impressions surge, then GMV/Orders surge on the same day or second day"
         // Mix Today (40%) and Yesterday (60%) to simulate the delay/carry-over effect.
         const prevImp = i > 0 ? impressionTrend[i-1] : todayImp * 0.8;
         const effectiveImp = (todayImp * 0.4) + (prevImp * 0.6);

         // Clicks: correlated to Today's impressions
         const ctr = 0.025 + Math.random() * 0.01; // 2.5% - 3.5%
         const clicks = Math.floor(todayImp * ctr);

         // Orders: correlated to Effective impressions (Lagged)
         const cvr = 0.003 + Math.random() * 0.001; // Conversion rate on impressions
         const orders = Math.floor(effectiveImp * cvr);

         // GMV: correlated to Orders
         const aov = 35 + Math.random() * 15; // Average Order Value
         const sales = parseFloat((orders * aov).toFixed(2));

         // Spend: correlated to Clicks
         const cpc = 0.4 + Math.random() * 0.3;
         const spend = parseFloat((clicks * cpc).toFixed(2));

         data.push({
             date: dateStr,
             impressions: todayImp,
             clicks: clicks,
             orders: orders,
             sales: sales,
             spend: spend
         });
      }
      return data;
    };

    setChartData(generateInitialData());
  }, []);

  // Handle manual data edit
  const handleDataUpdate = (index: number, field: keyof DailyData, value: string) => {
      const newData = [...chartData];
      const numValue = parseFloat(value);
      
      if (!isNaN(numValue)) {
          // @ts-ignore
          newData[index][field] = numValue;
          setChartData(newData);
      }
  };

  // Render Chart
  useEffect(() => {
    if (!chartRef.current || chartData.length === 0) return;

    // Cleanup existing chart to prevent "Canvas is already in use" error
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const labels = chartData.map(d => d.date);
    const datasets: any[] = [];

    const metricConfigs: Record<string, any> = {
        sales: { color: '#ff6600' },
        orders: { color: '#8b5cf6' },
        impressions: { color: '#06b6d4' },
        clicks: { color: '#4c7ef3' },
        spend: { color: '#ef4444' },
        ctr: { color: '#10b981' },
        cvr: { color: '#f59e0b' },
        roas: { color: '#ec4899' }
    };

    selectedMetrics.forEach(metricKey => {
        const option = metricsOptions.find(m => m.id === metricKey);
        const cfg = metricConfigs[metricKey];
        if (!option || !cfg) return;

        // Extract data based on metric
        const data = chartData.map(d => {
            if (metricKey === 'ctr') return d.impressions > 0 ? (d.clicks / d.impressions * 100) : 0;
            if (metricKey === 'cvr') return d.clicks > 0 ? (d.orders / d.clicks * 100) : 0;
            if (metricKey === 'roas') return d.spend > 0 ? (d.sales / d.spend) : 0;
            // @ts-ignore
            return d[metricKey];
        });

        datasets.push({
            label: option.label,
            data: data,
            borderColor: cfg.color,
            backgroundColor: cfg.color + '10',
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 6,
            yAxisID: option.axis
        });
    });

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
        chartInstance.current = new Chart(chartRef.current, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8 } },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.98)',
                        titleColor: '#333',
                        bodyColor: '#666',
                        borderColor: '#eee',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 4,
                        displayColors: true,
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        grid: { color: '#f5f5f5' },
                        border: { display: false }
                    },
                    y1: {
                        type: 'linear',
                        display: selectedMetrics.has('ctr') || selectedMetrics.has('cvr') || selectedMetrics.has('roas'),
                        position: 'right',
                        beginAtZero: true,
                        grid: { drawOnChartArea: false },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 }, color: '#999', maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
                        border: { display: false }
                    }
                }
            }
        });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [selectedMetrics, reportScope, chartData]);

  return (
    <div className="space-y-6">
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 min-h-[500px]">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-gray-800">数据报表 (近30天)</h1>
                    <select 
                        className="border border-gray-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:border-[#ff6600]"
                        value={reportScope}
                        onChange={(e) => setReportScope(e.target.value)}
                    >
                        <option value="account">账户总览</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name.substring(0, 20)}...</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">日期范围:</span>
                    <div className="border border-gray-300 rounded px-2 py-1 bg-white flex items-center gap-2 cursor-pointer hover:border-gray-400 transition-colors">
                        <span>2023-10-01 ~ 2023-10-31</span>
                        <Calendar size={14} className="text-gray-500" />
                    </div>
                </div>
            </div>
            
            <div className="p-6">
                <div className="flex flex-wrap gap-3 mb-6">
                    {metricsOptions.map(m => {
                        const isSelected = selectedMetrics.has(m.id);
                        return (
                        <button 
                            key={m.id}
                            className={`px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-2
                                ${isSelected 
                                    ? 'bg-orange-50 border-[#ff6600] text-[#ff6600] font-medium shadow-sm' 
                                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'}`}
                            onClick={() => toggleMetric(m.id)}
                        >
                            {m.label}
                            {isSelected && <Check size={12} />}
                        </button>
                        );
                    })}
                </div>

                <div className="relative w-full h-[400px]">
                    <canvas ref={chartRef}></canvas>
                </div>
            </div>
        </div>

        {/* Editable Data Table */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">数据明细 (可编辑调整曲线)</h3>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                    <AlertCircle size={12}/>
                    <span>修改下方表格数值，图表将实时更新</span>
                </div>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-xs text-right border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-500 border-b">日期</th>
                            <th className="px-4 py-3 font-medium text-gray-500 border-b">曝光量</th>
                            <th className="px-4 py-3 font-medium text-gray-500 border-b">点击量</th>
                            <th className="px-4 py-3 font-medium text-gray-500 border-b">成交单数</th>
                            <th className="px-4 py-3 font-medium text-gray-500 border-b">成交金额(GMV)</th>
                            <th className="px-4 py-3 font-medium text-gray-500 border-b">花费</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {chartData.map((row, index) => (
                            <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                                <td className="px-4 py-2 text-left text-gray-600 font-medium">{row.date}</td>
                                <td className="px-2 py-1">
                                    <input 
                                        type="number" 
                                        className="w-full text-right bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none px-1 py-1 hover:border-gray-200 transition-colors"
                                        value={row.impressions}
                                        onChange={(e) => handleDataUpdate(index, 'impressions', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    <input 
                                        type="number" 
                                        className="w-full text-right bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none px-1 py-1 hover:border-gray-200 transition-colors"
                                        value={row.clicks}
                                        onChange={(e) => handleDataUpdate(index, 'clicks', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    <input 
                                        type="number" 
                                        className="w-full text-right bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none px-1 py-1 hover:border-gray-200 transition-colors"
                                        value={row.orders}
                                        onChange={(e) => handleDataUpdate(index, 'orders', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    <input 
                                        type="number" 
                                        className="w-full text-right bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none px-1 py-1 hover:border-gray-200 transition-colors font-medium text-gray-900"
                                        value={row.sales}
                                        onChange={(e) => handleDataUpdate(index, 'sales', e.target.value)}
                                    />
                                </td>
                                <td className="px-2 py-1">
                                    <input 
                                        type="number" 
                                        className="w-full text-right bg-transparent border-b border-transparent focus:border-blue-500 focus:bg-white outline-none px-1 py-1 hover:border-gray-200 transition-colors"
                                        value={row.spend}
                                        onChange={(e) => handleDataUpdate(index, 'spend', e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};