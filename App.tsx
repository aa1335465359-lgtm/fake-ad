import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Settings, Plus, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { MOCK_DATA, AdProduct, SortConfig, COLUMNS_CONFIG } from './types';
import { AdTable } from './components/AdTable';
import { RoasEditModal } from './components/RoasEditModal';
import { CreateCampaign } from './components/CreateCampaign';
import { ReportView } from './components/ReportView';

const Header = ({ view, setView }: { view: string, setView: (v: any) => void }) => {
    const activeClass = "text-[#ff6600] border-b-2 border-[#ff6600]";
    const inactiveClass = "hover:text-[#ff6600] transition-colors";
    return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="h-12 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
            <div className="text-2xl font-black text-gray-800 tracking-tighter flex items-center gap-1 cursor-pointer select-none" onClick={() => setView('dashboard')}>
            <span className="text-[#ff6600]">TEMU</span>
            <span className="text-gray-400 text-sm font-normal ml-2 border-l pl-2 border-gray-300">Ads management</span>
            </div>
            <nav className="flex gap-8 text-sm font-medium text-gray-600 h-12">
            <a href="#" className={`${inactiveClass} flex items-center px-1`}>首页</a>
            <a href="#" 
               className={`${view === 'dashboard' || view === 'create' ? activeClass : inactiveClass} flex items-center px-1`}
               onClick={() => setView('dashboard')}
            >
                商品推广
            </a>
            <a href="#" 
               className={`${view === 'report' ? activeClass : inactiveClass} flex items-center px-1`}
               onClick={() => setView('report')}
            >
                数据报表
            </a>
            <a href="#" className={`${inactiveClass} flex items-center px-1`}>资产中心</a>
            <a href="#" className={`${inactiveClass} flex items-center px-1`}>帮助中心</a>
            </nav>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="hover:text-gray-800 cursor-pointer">店铺: 大码女装旗舰店...</span>
        </div>
        </div>
    </header>
    );
};

const ScoreCard = ({ title, value, subtext }: { title: string, value: string, subtext?: string }) => (
  <div className="p-3.5 flex-1 min-w-[120px] hover:bg-gray-50 transition-colors cursor-pointer group">
    <div className="text-xs text-gray-500 mb-1.5 font-medium">{title}</div>
    <div className="text-lg font-bold text-gray-800 tracking-tight group-hover:text-[#ff6600]">{value}</div>
    {subtext && <div className="text-xs text-gray-400 mt-1">{subtext}</div>}
  </div>
);

function App() {
  const [view, setView] = useState<'dashboard' | 'create' | 'report'>('dashboard');
  const [products, setProducts] = useState<AdProduct[]>(MOCK_DATA);
  const [editingRoasProduct, setEditingRoasProduct] = useState<AdProduct | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  
  // State for Column Configuration (Order and Visibility)
  const [allColumns, setAllColumns] = useState(COLUMNS_CONFIG.map(c => ({ ...c, visible: c.default })));
  const [isColumnConfigOpen, setIsColumnConfigOpen] = useState(false);
  const [isScorecardExpanded, setIsScorecardExpanded] = useState(true);

  // Derived Metrics
  const metrics = useMemo(() => {
    return products.reduce((acc, curr) => ({
      spend: acc.spend + curr.spend,
      sales: acc.sales + curr.sales,
      impressions: acc.impressions + curr.impressions,
      clicks: acc.clicks + curr.clicks,
      orders: acc.orders + curr.orders
    }), { spend: 0, sales: 0, impressions: 0, clicks: 0, orders: 0 });
  }, [products]);

  const overallRoas = metrics.spend > 0 ? (metrics.sales / metrics.spend).toFixed(2) : '0.00';
  const overallCpa = metrics.orders > 0 ? (metrics.spend / metrics.orders).toFixed(2) : '0.00';
  const overallAcos = metrics.sales > 0 ? ((metrics.spend / metrics.sales) * 100).toFixed(2) : '0.00';

  // Sorting Logic
  const sortedProducts = useMemo(() => {
    if (!sortConfig.key) return products;
    return [...products].sort((a, b) => {
      // @ts-ignore
      let valA = a[sortConfig.key];
      // @ts-ignore
      let valB = b[sortConfig.key];
      
      // Handle derived
      if (sortConfig.key === 'ctr') {
        valA = a.impressions > 0 ? a.clicks / a.impressions : 0;
        valB = b.impressions > 0 ? b.clicks / b.impressions : 0;
      } else if (sortConfig.key === 'cvr') {
        valA = a.clicks > 0 ? a.orders / a.clicks : 0;
        valB = b.clicks > 0 ? b.orders / b.clicks : 0;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, sortConfig]);

  const handleSort = (key: keyof AdProduct) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const updateProduct = (id: string, updates: Partial<AdProduct>) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;

      const newProduct = { ...p, ...updates };

      const recalculateDerived = (prod: AdProduct) => {
        const roas = prod.spend > 0 ? prod.sales / prod.spend : 0;
        const acos = prod.sales > 0 ? (prod.spend / prod.sales) * 100 : 0;
        const cpa = prod.orders > 0 ? prod.spend / prod.orders : 0;
        return { ...prod, roas, acos, cpa };
      };

      if ('spend' in updates || 'sales' in updates || 'orders' in updates) {
        return recalculateDerived(newProduct);
      }
      if ('roas' in updates && updates.roas !== undefined) {
         const newSales = newProduct.spend * updates.roas;
         const newAcos = newSales > 0 ? (newProduct.spend / newSales) * 100 : 0;
         return { ...newProduct, sales: newSales, acos: newAcos };
      }

      return newProduct;
    }));
  };

  const handleRoasSave = (newRoas: number) => {
    if (editingRoasProduct) {
      updateProduct(editingRoasProduct.id, { targetRoas: newRoas });
      setEditingRoasProduct(null);
    }
  };
  
  const toggleColumnVisibility = (key: string) => {
    setAllColumns(prev => prev.map(col => {
        if (col.key === key) {
             // Prevent hiding all columns (optional safety)
             return { ...col, visible: !col.visible };
        }
        return col;
    }));
  };

  const activeColumnKeys = useMemo(() => {
      return allColumns.filter(c => c.visible).map(c => c.key);
  }, [allColumns]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
      e.dataTransfer.setData('text/plain', index.toString());
      e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
      if (dragIndex === dropIndex) return;

      const newColumns = [...allColumns];
      const [draggedItem] = newColumns.splice(dragIndex, 1);
      newColumns.splice(dropIndex, 0, draggedItem);
      
      setAllColumns(newColumns);
  };

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-[#f6f7fb]">
        <Header view={view} setView={setView} />
        <main className="max-w-[1600px] mx-auto p-4">
           <CreateCampaign 
             onBack={() => setView('dashboard')} 
             onSubmit={() => setView('dashboard')} 
           />
        </main>
        <footer className="py-6 text-center text-xs text-gray-400">
           <p>免责声明：这只是一个用来展示学习熟悉后台的工具，不具备任何参考价值，也没有实际意义，一切都是虚构的。</p>
        </footer>
      </div>
    );
  }

  if (view === 'report') {
      return (
        <div className="min-h-screen bg-[#f6f7fb]">
          <Header view={view} setView={setView} />
          <main className="max-w-[1600px] mx-auto p-4">
            <ReportView products={products} />
          </main>
          <footer className="py-6 text-center text-xs text-gray-400">
             <p>免责声明：这只是一个用来展示学习熟悉后台的工具，不具备任何参考价值，也没有实际意义，一切都是虚构的。</p>
          </footer>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7fb] font-sans text-gray-900" onClick={() => setIsColumnConfigOpen(false)}>
      <Header view={view} setView={setView} />

      <main className="flex-1 max-w-[1800px] mx-auto p-4 space-y-4 w-full">
        {/* Scorecards Container */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden relative transition-all">
            <div className="absolute top-2 right-2 text-gray-400 cursor-pointer hover:text-gray-600 z-10 p-1" onClick={() => setIsScorecardExpanded(!isScorecardExpanded)}>
                <ChevronRight size={14} className={`transform transition-transform ${isScorecardExpanded ? 'rotate-90' : '-rotate-90'}`} />
            </div>
            
            <div className={`flex transition-all duration-300 ${isScorecardExpanded ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex-1 flex border-r border-gray-100 relative">
                <ScoreCard title="总花费" value={`¥${metrics.spend.toFixed(2)}`} />
                <div className="w-[1px] bg-gray-100 my-4" />
                <ScoreCard title="申报销售额" value={`¥${metrics.sales.toFixed(2)}`} />
                <div className="w-[1px] bg-gray-100 my-4" />
                <ScoreCard title="投资回报率 (ROAS)" value={overallRoas} />
                <div className="w-[1px] bg-gray-100 my-4" />
                <ScoreCard title="推广费比 (推广)" value={`${overallAcos}%`} />
                <div className="w-[1px] bg-gray-100 my-4" />
                <ScoreCard title="每笔成交花费" value={`¥${overallCpa}`} />
                </div>

                <div className="flex-[0.5] flex bg-[#fbfbfb]">
                <ScoreCard title="曝光量" value={metrics.impressions.toLocaleString()} />
                <div className="w-[1px] bg-gray-200 my-4" />
                <ScoreCard title="点击量" value={metrics.clicks.toLocaleString()} />
                <div className="w-[1px] bg-gray-200 my-4" />
                <ScoreCard title="子订单量" value={metrics.orders.toLocaleString()} />
                </div>
            </div>

            {!isScorecardExpanded && (
                <div className="px-4 py-2 flex items-center gap-8 text-xs text-gray-600">
                    <span className="font-bold">数据概览</span>
                    <span>总花费: ¥{metrics.spend.toFixed(2)}</span>
                    <span>申报销售额: ¥{metrics.sales.toFixed(2)}</span>
                    <span>ROAS: {overallRoas}</span>
                </div>
            )}
        </div>

        <div className="flex items-center justify-between mt-8 mb-2 px-1">
          <h2 className="text-lg font-bold text-gray-800">推广列表</h2>
          <button 
            className="bg-[#4c7ef3] hover:bg-[#3b6bd6] text-white px-4 py-2 rounded-[4px] text-sm font-medium flex items-center gap-1 shadow-sm transition-colors"
            onClick={() => setView('create')}
          >
            <Plus size={16} />
            添加推广商品
          </button>
        </div>

        <div className="bg-white p-4 rounded-sm shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative w-[340px]">
              <div className="flex items-center bg-white rounded-sm border border-gray-300 hover:border-gray-400 transition-colors">
                <input 
                  type="text" 
                  placeholder="输入商品ID/SPUID，多个ID用空格/逗号分隔" 
                  className="w-full bg-transparent px-3 py-2 text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
                />
                <div className="pr-3 text-gray-400">
                  <Search size={14} />
                </div>
              </div>
            </div>
            
            <div className="border border-[#4c7ef3]/30 bg-[#eff4ff] text-[#4c7ef3] rounded-sm px-3 py-2 text-xs flex items-center gap-6 cursor-pointer hover:bg-[#e6eeff] transition-colors">
              <span className="font-medium">状态: 投放中</span>
              <ChevronDown size={12} />
            </div>

            <div className="border border-gray-300 rounded-sm px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer shadow-sm transition-colors">
              更多筛选
            </div>
            
            <div className="ml-auto flex gap-2 relative">
                <button 
                    className="p-1.5 border border-gray-300 rounded-sm hover:bg-gray-50"
                    onClick={(e) => { e.stopPropagation(); setIsColumnConfigOpen(!isColumnConfigOpen); }}
                >
                    <SlidersHorizontal size={14} className="text-gray-600" />
                </button>
                {isColumnConfigOpen && (
                    <div className="absolute top-8 right-0 bg-white border border-gray-200 shadow-xl rounded-sm z-50 w-56 p-2 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                        <div className="text-xs font-bold text-gray-700 px-2 py-1 border-b border-gray-100 mb-1">自定义列展示</div>
                        {allColumns.map((col, index) => (
                           <div 
                                key={col.key} 
                                className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 cursor-move text-xs text-gray-700 rounded select-none group"
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                           >
                              <div className="flex items-center gap-2">
                                  <input 
                                    type="checkbox" 
                                    checked={col.visible}
                                    onChange={(e) => { e.stopPropagation(); toggleColumnVisibility(col.key); }}
                                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer" 
                                  />
                                  <span>{col.label}</span>
                              </div>
                              <GripVertical size={12} className="text-gray-300 group-hover:text-gray-500" />
                           </div>
                        ))}
                    </div>
                )}
                <button className="p-1.5 border border-gray-300 rounded-sm hover:bg-gray-50"><Settings size={14} className="text-gray-600" /></button>
            </div>
          </div>

          <AdTable 
            data={sortedProducts} 
            sortConfig={sortConfig}
            columns={activeColumnKeys}
            onSort={handleSort}
            onUpdateProduct={updateProduct}
            onEditRoas={setEditingRoasProduct}
          />
        </div>
      </main>

      {editingRoasProduct && (
        <RoasEditModal 
          product={editingRoasProduct}
          isOpen={true}
          onClose={() => setEditingRoasProduct(null)}
          onSave={handleRoasSave}
        />
      )}

      <footer className="py-6 text-center text-xs text-gray-400">
        <p>免责声明：这只是一个用来展示学习熟悉后台的工具，不具备任何参考价值，也没有实际意义，一切都是虚构的。</p>
      </footer>
    </div>
  );
}

export default App;
