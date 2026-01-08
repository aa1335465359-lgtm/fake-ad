import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { MOCK_NEW_PRODUCTS } from '../types';

interface CreateCampaignProps {
  onBack: () => void;
  onSubmit: () => void;
}

export const CreateCampaign: React.FC<CreateCampaignProps> = ({ onBack, onSubmit }) => {
  // Store local state for each product's configuration
  // In a real app, this would be a complex object map
  const [products] = useState(MOCK_NEW_PRODUCTS);

  return (
    <div className="bg-white min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">新建商品广告</h1>
        </div>
        <div className="text-xs text-gray-500">
          选择商品，设置广告日预算和目标广告投资回报率，轻松创建广告。
        </div>
      </div>

      <div className="p-6">
        {/* Selection Info */}
        <div className="mb-4 flex justify-between items-center">
          <div className="inline-flex items-center px-4 py-2 border border-[#ff6600] bg-orange-50 text-[#ff6600] rounded text-sm font-medium">
            <span className="mr-1">+ 添加商品</span>
          </div>
          <div className="text-sm text-gray-500">
            已选择 <span className="font-bold text-gray-900">{products.length} 个商品</span> 默认为已选商品自动填写推荐广告日预算和目标广告投资回报率，你也可以自定义设置
          </div>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_300px_200px_1fr_60px] bg-[#f8f9fa] text-xs text-gray-500 font-medium border-b border-gray-200">
            <div className="p-3 flex items-center justify-center"><input type="checkbox" checked className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" /></div>
            <div className="p-3 flex items-center">商品</div>
            <div className="p-3 flex items-center">广告日预算(?)</div>
            <div className="p-3 flex items-center">目标广告投资回报率(?) <br/><span className="text-gray-400 font-normal">预估数据(?)</span></div>
            <div className="p-3 flex items-center justify-end">操作</div>
          </div>

          {/* Table Rows */}
          {products.map((product) => {
             // Calculate simulated values based on baseRoas
             const strongRoas = product.baseRoas;
             const mediumRoas = (product.baseRoas * 1.5).toFixed(2);
             const weakRoas = (product.baseRoas * 2.5).toFixed(2);

             return (
              <div key={product.id} className="grid grid-cols-[40px_300px_200px_1fr_60px] text-xs border-b border-gray-100 hover:bg-[#fcfcfc] py-4">
                {/* Checkbox */}
                <div className="px-3 pt-2 flex justify-center">
                  <input type="checkbox" checked className="rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                </div>

                {/* Product Info */}
                <div className="px-3 flex gap-3">
                  <img src={product.imageUrl} className="w-16 h-16 object-cover rounded border border-gray-200" />
                  <div className="py-1">
                    <div className="text-gray-900 line-clamp-2 mb-1">{product.name}</div>
                    <div className="text-gray-400">ID: {product.id}</div>
                  </div>
                </div>

                {/* Daily Budget */}
                <div className="px-3 pt-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <input type="radio" name={`budget-${product.id}`} defaultChecked className="text-orange-500 focus:ring-orange-500" />
                    <span className="text-gray-900 font-medium">不限</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" name={`budget-${product.id}`} className="text-orange-500 focus:ring-orange-500" />
                    <span className="text-gray-600">自定义</span>
                  </div>
                </div>

                {/* ROAS Strategies */}
                <div className="px-3 pt-1 space-y-3">
                  {/* Strong */}
                  <div className="flex items-start gap-2">
                    <input type="radio" name={`roas-${product.id}`} defaultChecked className="mt-0.5 text-orange-500 focus:ring-orange-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{strongRoas}</span>
                        <span className="bg-orange-100 text-[#ff6600] border border-orange-200 px-1 rounded text-[10px]">竞争力强</span>
                      </div>
                      <div className="text-gray-400 mt-0.5 scale-90 origin-left whitespace-nowrap">
                        7天预计带来 <span className="text-[#ff6600]">订单 +26.85%</span>，<span className="text-[#ff6600]">曝光 +46.47%</span>
                      </div>
                    </div>
                  </div>

                  {/* Medium */}
                  <div className="flex items-start gap-2">
                    <input type="radio" name={`roas-${product.id}`} className="mt-0.5 text-orange-500 focus:ring-orange-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">{mediumRoas}</span>
                        <span className="bg-gray-100 text-gray-500 border border-gray-200 px-1 rounded text-[10px]">竞争力中</span>
                      </div>
                      <div className="text-gray-400 mt-0.5 scale-90 origin-left whitespace-nowrap">
                        7天预计带来 <span className="text-[#ff6600]">订单 +13.94%</span>，<span className="text-[#ff6600]">曝光 +23.96%</span>
                      </div>
                    </div>
                  </div>

                  {/* Weak */}
                  <div className="flex items-start gap-2">
                    <input type="radio" name={`roas-${product.id}`} className="mt-0.5 text-orange-500 focus:ring-orange-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">{weakRoas}</span>
                        <span className="bg-gray-100 text-gray-500 border border-gray-200 px-1 rounded text-[10px]">竞争力弱</span>
                      </div>
                      <div className="text-gray-400 mt-0.5 scale-90 origin-left whitespace-nowrap">
                        7天预计带来 <span className="text-[#ff6600]">订单 +9.59%</span>，<span className="text-[#ff6600]">曝光 +16.59%</span>
                      </div>
                    </div>
                  </div>

                  {/* Custom */}
                   <div className="flex items-center gap-2">
                    <input type="radio" name={`roas-${product.id}`} className="text-orange-500 focus:ring-orange-500" />
                    <span className="text-gray-600">自定义</span>
                  </div>
                </div>

                {/* Remove */}
                <div className="px-3 pt-2 text-right">
                  <button className="text-[#ff6600] hover:text-[#e05500]">移除</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center pb-10">
           <button 
             onClick={onSubmit}
             className="bg-[#ff6600] hover:bg-[#e05500] text-white px-12 py-3 rounded font-bold text-sm shadow-md transition-transform active:scale-95"
           >
             提交并开启广告({products.length})
           </button>
        </div>
      </div>
    </div>
  );
};
