import React, { useState, useEffect, useRef } from 'react';
import { AdProduct, SortConfig } from '../types';
import { Pencil, ChevronDown, HelpCircle, Copy, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';

interface AdTableProps {
  data: AdProduct[];
  sortConfig: SortConfig;
  columns: string[]; // Ordered list of visible keys
  onSort: (key: keyof AdProduct) => void;
  onUpdateProduct: (id: string, updates: Partial<AdProduct>) => void;
  onEditRoas: (product: AdProduct) => void;
}

const EditableCell = ({ 
  value, 
  onSave, 
  prefix = '', 
  suffix = '', 
  className = '',
  type = 'number'
}: {
  value: string | number;
  onSave: (val: any) => void;
  prefix?: string;
  suffix?: string;
  className?: string;
  type?: 'text' | 'number';
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue != value) {
        onSave(type === 'number' ? Number(editValue) : editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const displayValue = type === 'number' 
    ? Number(value).toLocaleString(undefined, { minimumFractionDigits: suffix === '%' || prefix === '¥' ? 2 : 0, maximumFractionDigits: 2 }) 
    : value;

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={type === 'number' ? 'number' : 'text'}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full border border-orange-500 rounded-sm px-1 py-0.5 text-xs outline-none bg-white text-right shadow-sm ${className}`}
        step={suffix === '%' || prefix === '¥' ? "0.01" : "1"}
      />
    );
  }

  return (
    <div 
      onClick={() => setIsEditing(true)} 
      className={`cursor-pointer border border-transparent hover:border-gray-300 rounded-sm px-1 py-0.5 transition-all duration-150 text-right w-full truncate ${className}`}
      title="点击修改"
    >
      {prefix}{displayValue}{suffix}
    </div>
  );
};

const SortHeader = ({ 
  label, 
  sortKey, 
  currentSort, 
  onSort,
  align = 'right'
}: { 
  label: React.ReactNode, 
  sortKey: keyof AdProduct, 
  currentSort: SortConfig, 
  onSort: (key: keyof AdProduct) => void,
  align?: 'left' | 'right' | 'center'
}) => {
  const isActive = currentSort.key === sortKey;
  
  return (
    <div 
      className={`flex items-center h-full px-2 cursor-pointer hover:bg-gray-200 transition-colors select-none ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}
      onClick={() => onSort(sortKey)}
    >
      <div className={`leading-tight ${align === 'right' ? 'text-right' : ''}`}>{label}</div>
      <div className="ml-1 flex flex-col justify-center w-3 shrink-0">
        {isActive ? (
          currentSort.direction === 'asc' ? <ArrowUp size={12} className="text-[#ff6600]" /> : <ArrowDown size={12} className="text-[#ff6600]" />
        ) : (
          <ChevronsUpDown size={12} className="text-gray-400" />
        )}
      </div>
    </div>
  );
};

export const AdTable: React.FC<AdTableProps> = ({ data, sortConfig, columns, onSort, onUpdateProduct, onEditRoas }) => {
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [tempBudget, setTempBudget] = useState<string>('');

  const handleStartEditBudget = (product: AdProduct) => {
    setEditingBudget(product.id);
    setTempBudget(product.budgetMode === 'unlimited' ? '0' : product.budgetAmount.toString());
  };

  const handleSaveBudget = (id: string) => {
    const val = parseFloat(tempBudget);
    if (isNaN(val) || val <= 0) {
      onUpdateProduct(id, { budgetMode: 'unlimited', budgetAmount: 0 });
    } else {
      onUpdateProduct(id, { budgetMode: 'custom', budgetAmount: val });
    }
    setEditingBudget(null);
  };

  // Define column widths
  const colWidths: Record<string, string> = {
      spend: '100px', sales: '120px', roas: '90px', acos: '90px', cpa: '90px',
      impressions: '80px', clicks: '80px', ctr: '80px', orders: '80px', cvr: '80px',
      todayGmv: '110px', totalLaunchGmv: '130px'
  };

  const getGridTemplate = () => {
    let tmpl = '40px 320px 80px 220px 60px'; // Fixed columns
    columns.forEach(k => {
        tmpl += ` ${colWidths[k] || '100px'}`;
    });
    return tmpl;
  };

  const gridStyle = { gridTemplateColumns: getGridTemplate() };

  // Calculate totals
  const totalSpend = data.reduce((acc, p) => acc + p.spend, 0);
  const totalSales = data.reduce((acc, p) => acc + p.sales, 0);
  const totalImpressions = data.reduce((acc, p) => acc + p.impressions, 0);
  const totalClicks = data.reduce((acc, p) => acc + p.clicks, 0);
  const totalOrders = data.reduce((acc, p) => acc + p.orders, 0);
  const totalTodayGmv = data.reduce((acc, p) => acc + (p.todayGmv || 0), 0);
  const totalLaunchGmv = data.reduce((acc, p) => acc + (p.totalLaunchGmv || 0), 0);
  
  const totalRoas = totalSpend > 0 ? totalSales / totalSpend : 0;
  const totalAcos = totalSales > 0 ? (totalSpend / totalSales) * 100 : 0;
  const totalCpa = totalOrders > 0 ? totalSpend / totalOrders : 0;

  // Render Helpers
  const renderHeader = (key: string) => {
    switch (key) {
        case 'spend': return <SortHeader label={<>总花费 <HelpCircle size={10} className="inline ml-0.5 text-gray-300" /></>} sortKey="spend" currentSort={sortConfig} onSort={onSort} />;
        case 'sales': return <SortHeader label={<>申报价销售额 <HelpCircle size={10} className="inline ml-0.5 text-gray-300" /></>} sortKey="sales" currentSort={sortConfig} onSort={onSort} />;
        case 'roas': return <SortHeader label={<>投资回报率<br/>(ROAS) <HelpCircle size={10} className="inline ml-0.5 text-gray-300" /></>} sortKey="roas" currentSort={sortConfig} onSort={onSort} />;
        case 'acos': return <SortHeader label={<>推广费比<br/>(推广) <HelpCircle size={10} className="inline ml-0.5 text-gray-300" /></>} sortKey="acos" currentSort={sortConfig} onSort={onSort} />;
        case 'cpa': return <SortHeader label={<>每笔成交<br/>花费 <HelpCircle size={10} className="inline ml-0.5 text-gray-300" /></>} sortKey="cpa" currentSort={sortConfig} onSort={onSort} />;
        case 'impressions': return <SortHeader label={<>曝光量 <HelpCircle size={10} className="inline ml-0.5 text-gray-300" /></>} sortKey="impressions" currentSort={sortConfig} onSort={onSort} />;
        case 'clicks': return <SortHeader label={<>点击量 <HelpCircle size={10} className="inline ml-0.5 text-gray-300" /></>} sortKey="clicks" currentSort={sortConfig} onSort={onSort} />;
        case 'ctr': return <SortHeader label={<>点击率<br/>(CTR) <HelpCircle size={10} className="inline ml-0.5 text-gray-300" /></>} sortKey="ctr" currentSort={sortConfig} onSort={onSort} />;
        case 'orders': return <SortHeader label={<>订单量 <HelpCircle size={10} className="inline ml-0.5 text-gray-300" /></>} sortKey="orders" currentSort={sortConfig} onSort={onSort} />;
        case 'cvr': return <SortHeader label={<>转化率<br/>(CVR) <HelpCircle size={10} className="inline ml-0.5 text-gray-300" /></>} sortKey="cvr" currentSort={sortConfig} onSort={onSort} />;
        case 'todayGmv': return <SortHeader label={<>今日<br/>成交额</>} sortKey="todayGmv" currentSort={sortConfig} onSort={onSort} />;
        case 'totalLaunchGmv': return <SortHeader label={<>投放以来<br/>总成交额</>} sortKey="totalLaunchGmv" currentSort={sortConfig} onSort={onSort} />;
        default: return null;
    }
  };

  const renderTotal = (key: string) => {
    switch (key) {
        case 'spend': return <div className="px-2 flex items-center justify-end h-full font-bold text-gray-900">¥{totalSpend.toFixed(2)}</div>;
        case 'sales': return <div className="px-2 flex items-center justify-end h-full font-bold text-gray-900">¥{totalSales.toFixed(2)}</div>;
        case 'roas': return <div className="px-2 flex items-center justify-end h-full text-gray-600">{totalRoas.toFixed(2)}</div>;
        case 'acos': return <div className="px-2 flex items-center justify-end h-full text-gray-600">{totalAcos.toFixed(2)}%</div>;
        case 'cpa': return <div className="px-2 flex items-center justify-end h-full text-gray-600">¥{totalCpa.toFixed(2)}</div>;
        case 'impressions': return <div className="px-2 flex items-center justify-end h-full text-gray-600">{totalImpressions.toLocaleString()}</div>;
        case 'clicks': return <div className="px-2 flex items-center justify-end h-full text-gray-600">{totalClicks.toLocaleString()}</div>;
        case 'ctr': return <div className="px-2 flex items-center justify-end h-full text-gray-600">-</div>;
        case 'orders': return <div className="px-2 flex items-center justify-end h-full text-gray-600">{totalOrders}</div>;
        case 'cvr': return <div className="px-2 flex items-center justify-end h-full text-gray-600">-</div>;
        case 'todayGmv': return <div className="px-2 flex items-center justify-end h-full font-bold text-gray-900">¥{totalTodayGmv.toFixed(2)}</div>;
        case 'totalLaunchGmv': return <div className="px-2 flex items-center justify-end h-full font-bold text-gray-900">¥{totalLaunchGmv.toFixed(2)}</div>;
        default: return null;
    }
  };

  const renderCell = (key: string, product: AdProduct) => {
    const ctr = product.impressions > 0 ? (product.clicks / product.impressions * 100) : 0;
    const cvr = product.clicks > 0 ? (product.orders / product.clicks * 100) : 0;

    switch (key) {
        case 'spend': return <EditableCell value={product.spend} onSave={(val) => onUpdateProduct(product.id, { spend: val })} prefix="¥" />;
        case 'sales': return <EditableCell value={product.sales} onSave={(val) => onUpdateProduct(product.id, { sales: val })} prefix="¥" />;
        case 'roas': return <EditableCell value={product.roas} onSave={(val) => onUpdateProduct(product.id, { roas: val })} />;
        case 'acos': return <EditableCell value={product.acos} onSave={(val) => onUpdateProduct(product.id, { acos: val })} suffix="%" />;
        case 'cpa': return <EditableCell value={product.cpa} onSave={(val) => onUpdateProduct(product.id, { cpa: val })} prefix="¥" />;
        case 'impressions': return <EditableCell value={product.impressions} onSave={(val) => onUpdateProduct(product.id, { impressions: val })} />;
        case 'clicks': return <EditableCell value={product.clicks} onSave={(val) => onUpdateProduct(product.id, { clicks: val })} />;
        case 'ctr': return <div className="text-right truncate">{ctr.toFixed(2)}%</div>;
        case 'orders': return <EditableCell value={product.orders} onSave={(val) => onUpdateProduct(product.id, { orders: val })} />;
        case 'cvr': return <div className="text-right truncate">{cvr.toFixed(2)}%</div>;
        case 'todayGmv': return <EditableCell value={product.todayGmv || 0} onSave={(val) => onUpdateProduct(product.id, { todayGmv: val })} prefix="¥" className="font-bold text-gray-900" />;
        case 'totalLaunchGmv': return <EditableCell value={product.totalLaunchGmv || 0} onSave={(val) => onUpdateProduct(product.id, { totalLaunchGmv: val })} prefix="¥" className="font-bold text-gray-900" />;
        default: return null;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-x-auto min-w-[1440px]">
      {/* Header Row */}
      <div className="grid bg-[#f6f9fc] text-xs text-gray-500 font-medium border-b border-gray-200 items-center h-12" style={gridStyle}>
        <div className="flex items-center justify-center h-full"><input type="checkbox" className="rounded border-gray-300 focus:ring-orange-500" /></div>
        <div className="pl-2 flex items-center h-full">商品推广</div>
        <div className="flex items-center justify-center h-full">状态 <HelpCircle size={12} className="ml-1 text-gray-400" /></div>
        <div className="flex items-center h-full pl-4">预算和出价 <HelpCircle size={12} className="ml-1 text-gray-400" /></div>
        <div className="flex items-center justify-center h-full">操作</div>
        
        {columns.map(key => <React.Fragment key={key}>{renderHeader(key)}</React.Fragment>)}
      </div>

      {/* Totals Row */}
      <div className="grid bg-white text-xs border-b border-gray-200 h-12 items-center" style={gridStyle}>
        <div className="flex items-center justify-center h-full"><input type="checkbox" className="rounded border-gray-300" /></div>
        <div className="col-span-4 pl-2 flex items-center h-full" style={{ gridColumn: '2 / span 4' }}>
           <span className="text-gray-900 font-bold mr-2">共{data.length}项</span>
           <span className="text-gray-400">不包含已删除推广的数据</span>
        </div>
        
        {/* Fill empty cells for fixed columns logic hack - actually handled by gridColumn above, but let's be safe if logic changes */}
        <div style={{display:'none'}}/><div style={{display:'none'}}/><div style={{display:'none'}}/>

        {columns.map(key => <React.Fragment key={key}>{renderTotal(key)}</React.Fragment>)}
      </div>

      {/* Data Rows */}
      {data.map((product) => {
        return (
        <div key={product.id} className="grid bg-white text-xs border-b border-gray-100 hover:bg-[#f8faff] transition-colors group" style={gridStyle}>
          {/* 1. Checkbox */}
          <div className="flex items-start justify-center pt-8 h-full">
            <input type="checkbox" className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
          </div>

          {/* 2. Product Info */}
          <div className="p-3 flex gap-3 h-full items-start">
             <div className="pt-2 shrink-0">
                 <div 
                    className={`w-9 h-5 rounded-full p-0.5 cursor-pointer flex items-center transition-colors ${product.status === 'active' ? 'bg-[#4c7ef3]' : 'bg-gray-300'}`}
                    onClick={() => onUpdateProduct(product.id, { status: product.status === 'active' ? 'paused' : 'active' })}
                >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition ${product.status === 'active' ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
             </div>

            <div className="relative shrink-0">
                 <img src={product.imageUrl} alt={product.name} className="w-[70px] h-[70px] object-cover rounded-sm border border-gray-200" />
            </div>

            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="text-gray-900 font-medium hover:text-[#4c7ef3] cursor-pointer text-[12px] leading-tight mb-0.5 line-clamp-2" title={product.name}>
                 {product.name}
              </div>
              <div className="text-gray-400 flex flex-col text-[10px] leading-tight space-y-0.5">
                <span className="flex items-center gap-1">Goods ID: {product.skuId} <Copy size={10} className="cursor-pointer hover:text-gray-600"/></span>
                <span className="flex items-center gap-1">SPU ID: {product.spuId} <Copy size={10} className="cursor-pointer hover:text-gray-600"/></span>
              </div>
              <div className="text-gray-400 text-[10px] mt-0.5">
                {product.stationInfo}
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <div className="bg-[#e6f0ff] text-[#4c7ef3] px-1 py-0.5 rounded-sm text-[10px] border border-blue-100 flex items-center gap-1">
                   学习期 <HelpCircle size={9} />
                </div>
                <span className="text-gray-400 text-[10px]">{product.learningStatus === 'completed' ? '继续成交10单后学习完成' : '学习中'}</span>
              </div>
            </div>
          </div>

          {/* 3. Status */}
          <div className="flex items-start justify-center pt-8 h-full">
            <span className="px-2 py-0.5 border border-[#00b365] text-[#00b365] bg-white rounded-sm text-[11px]">
              {product.status === 'active' ? '投放中' : '已暂停'}
            </span>
          </div>

          {/* 4. Budget & Bid */}
          <div className="py-4 px-4 flex flex-col gap-4 h-full text-[12px] justify-center">
             <div className="flex items-center justify-between group/edit">
                  <span className="text-gray-500">推广日预算:</span>
                  <div className="flex items-center gap-1">
                        {editingBudget === product.id ? (
                        <input 
                            autoFocus
                            type="number" 
                            className="w-16 border border-orange-500 px-1 py-0 rounded text-right outline-none h-5 text-xs"
                            value={tempBudget}
                            onChange={(e) => setTempBudget(e.target.value)}
                            onBlur={() => handleSaveBudget(product.id)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget(product.id)}
                        />
                        ) : (
                        <>
                            <span className="text-gray-900 font-medium">
                            {product.budgetMode === 'unlimited' ? '不限' : `¥${product.budgetAmount.toFixed(2)}`}
                            </span>
                            <Pencil 
                            size={12} 
                            className="text-gray-400 cursor-pointer hover:text-orange-500"
                            onClick={() => handleStartEditBudget(product)}
                            />
                        </>
                        )}
                  </div>
             </div>

             <div className="flex items-center justify-between group/edit">
                <span className="text-gray-500">目标ROAS:</span>
                <div className="flex items-center gap-1">
                  <span className="text-gray-900 font-medium">{product.targetRoas.toFixed(2)}</span>
                  <Pencil 
                    size={12} 
                    className="text-gray-400 cursor-pointer hover:text-orange-500"
                    onClick={() => onEditRoas(product)}
                  />
                </div>
             </div>
          </div>

          {/* 5. Operations */}
          <div className="py-4 px-2 flex flex-col gap-2 items-center text-gray-800 text-[11px] h-full justify-center">
            <span className="hover:text-[#ff6600] cursor-pointer font-bold">详情</span>
            <span className="hover:text-[#ff6600] cursor-pointer font-bold">数据</span>
            <span className="flex items-center hover:text-[#ff6600] cursor-pointer gap-0.5 font-bold">更多 <ChevronDown size={10} /></span>
          </div>

          {/* Dynamic Columns */}
          {columns.map(key => (
              <div key={key} className="px-2 flex items-center justify-end h-full text-gray-900">
                  {renderCell(key, product)}
              </div>
          ))}
        </div>
      )})}
    </div>
  );
};
