import React, { useState, useEffect } from 'react';
import { X, ThumbsUp } from 'lucide-react';
import { AdProduct, RoasStrategy } from '../types';

interface RoasEditModalProps {
  product: AdProduct;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newRoas: number) => void;
}

export const RoasEditModal: React.FC<RoasEditModalProps> = ({ product, isOpen, onClose, onSave }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<RoasStrategy>('strong');
  const [customValue, setCustomValue] = useState<string>(product.targetRoas.toString());

  // Fixed simulation values for realistic demonstration
  // Base ROAS (Strong) is around 1.9 for these products
  const strategies = {
    strong: { 
      value: 1.90, 
      label: '竞争力强', 
      desc: '7天预计带来 订单 18 曝光 1.8万',
      tagColor: 'text-[#ff6600] border-[#ffb380] bg-[#fff7e6]'
    },
    medium: { 
      value: 2.85, 
      label: '竞争力中', 
      desc: '7天预计带来 订单 9 曝光 8500',
      tagColor: 'text-gray-600 border-gray-300 bg-white'
    },
    weak: { 
      value: 4.20, 
      label: '竞争力弱', 
      desc: '7天预计带来 订单 3 曝光 2800',
      tagColor: 'text-gray-600 border-gray-300 bg-white'
    },
  };

  useEffect(() => {
    setCustomValue(product.targetRoas.toString());
    
    // Auto-select strategy based on current value
    if (product.targetRoas <= 2.0) setSelectedStrategy('strong');
    else if (product.targetRoas <= 3.0) setSelectedStrategy('medium');
    else if (product.targetRoas <= 5.0) setSelectedStrategy('weak');
    else setSelectedStrategy('custom');
    
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    let finalValue = 0;
    if (selectedStrategy === 'custom') {
      finalValue = parseFloat(customValue);
    } else {
      finalValue = strategies[selectedStrategy].value;
    }
    
    if (!isNaN(finalValue)) {
      onSave(parseFloat(finalValue.toFixed(2)));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
      <div className="bg-white rounded-lg shadow-2xl w-[500px] overflow-hidden border border-gray-100 font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">目标广告投资回报率</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            指商品推广后在30日内获得的收益率，其计算公式为：广告投资回报率 = 申报销售额 ÷ 广告花费。例如：如果您在商品广告上花费1美元，产生了5美元的申报销售额，则 ROAS 为 5。
          </p>

          <div className="space-y-3">
            {/* Strategy: Strong */}
            <div 
              className={`border rounded-lg p-3 cursor-pointer transition-colors relative flex items-start gap-3 ${selectedStrategy === 'strong' ? 'border-[#ff6600] bg-orange-50/30' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setSelectedStrategy('strong')}
            >
              <div className={`mt-1.5 w-4 h-4 rounded-full border flex items-center justify-center ${selectedStrategy === 'strong' ? 'border-[#ff6600]' : 'border-gray-300'}`}>
                {selectedStrategy === 'strong' && <div className="w-2 h-2 rounded-full bg-[#ff6600]" />}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 text-lg">{strategies.strong.value.toFixed(2)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border flex items-center gap-1 ${strategies.strong.tagColor}`}>
                    {strategies.strong.label} <ThumbsUp size={10} fill="currentColor" />
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {strategies.strong.desc.split(' ').map((part, i) => {
                     if (part.match(/\d/)) return <span key={i} className="text-[#ff6600] font-bold mx-0.5">{part}</span>;
                     return <span key={i}>{part}</span>;
                  })}
                </div>
              </div>
            </div>

            {/* Strategy: Medium */}
            <div 
              className={`border rounded-lg p-3 cursor-pointer transition-colors relative flex items-start gap-3 ${selectedStrategy === 'medium' ? 'border-[#ff6600] bg-orange-50/30' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setSelectedStrategy('medium')}
            >
              <div className={`mt-1.5 w-4 h-4 rounded-full border flex items-center justify-center ${selectedStrategy === 'medium' ? 'border-[#ff6600]' : 'border-gray-300'}`}>
                {selectedStrategy === 'medium' && <div className="w-2 h-2 rounded-full bg-[#ff6600]" />}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 text-lg">{strategies.medium.value.toFixed(2)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${strategies.medium.tagColor}`}>
                    {strategies.medium.label}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                   {strategies.medium.desc.split(' ').map((part, i) => {
                     if (part.match(/\d/)) return <span key={i} className="text-[#ff6600] font-bold mx-0.5">{part}</span>;
                     return <span key={i}>{part}</span>;
                  })}
                </div>
              </div>
            </div>

            {/* Strategy: Weak */}
            <div 
              className={`border rounded-lg p-3 cursor-pointer transition-colors relative flex items-start gap-3 ${selectedStrategy === 'weak' ? 'border-[#ff6600] bg-orange-50/30' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setSelectedStrategy('weak')}
            >
              <div className={`mt-1.5 w-4 h-4 rounded-full border flex items-center justify-center ${selectedStrategy === 'weak' ? 'border-[#ff6600]' : 'border-gray-300'}`}>
                {selectedStrategy === 'weak' && <div className="w-2 h-2 rounded-full bg-[#ff6600]" />}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 text-lg">{strategies.weak.value.toFixed(2)}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${strategies.weak.tagColor}`}>
                    {strategies.weak.label}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                   {strategies.weak.desc.split(' ').map((part, i) => {
                     if (part.match(/\d/)) return <span key={i} className="text-[#ff6600] font-bold mx-0.5">{part}</span>;
                     return <span key={i}>{part}</span>;
                  })}
                </div>
              </div>
            </div>

            {/* Strategy: Custom */}
            <div 
              className={`border rounded-lg p-3 cursor-pointer transition-colors relative flex items-center gap-3 ${selectedStrategy === 'custom' ? 'border-[#ff6600] bg-orange-50/30' : 'border-gray-200 hover:border-gray-300'}`}
              onClick={() => setSelectedStrategy('custom')}
            >
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedStrategy === 'custom' ? 'border-[#ff6600]' : 'border-gray-300'}`}>
                {selectedStrategy === 'custom' && <div className="w-2 h-2 rounded-full bg-[#ff6600]" />}
              </div>
              <div className="flex items-center gap-3 w-full">
                <span className="text-sm font-medium text-gray-800">自定义</span>
                <div className="relative flex-1">
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#ff6600] bg-gray-50 text-right"
                    placeholder="输入"
                    value={customValue}
                    onChange={(e) => {
                      setCustomValue(e.target.value);
                      setSelectedStrategy('custom');
                    }}
                    onClick={(e) => e.stopPropagation()} 
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-400 mt-4 leading-tight">
            *预估带来订单和曝光数据，为采纳建议出价后连续投放7天的数据。如推广为新商品或商品数据量不足，会提供类目商品数据显示。仅供参考，请以实际效果为准。
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={onClose}
            className="px-8 py-2 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-100 font-medium"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-2 bg-[#ff6600] rounded text-sm text-white hover:bg-[#e05500] font-medium shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};