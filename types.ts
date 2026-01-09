

export interface AdProduct {
  id: string;
  skuId: string; // Used as Goods ID
  spuId: string;
  name: string;
  imageUrl: string;
  status: 'active' | 'paused';
  learningStatus: 'learning' | 'completed' | null; // 学习期状态
  budgetMode: 'unlimited' | 'custom';
  budgetAmount: number; // 0 if unlimited
  remainingBudgetPercent?: number;
  targetRoas: number;
  stationInfo: string;
  
  // Performance Metrics
  spend: number;
  sales: number; // GMV
  roas: number; // Actual ROAS
  acos: number; // Expense Ratio (费比)
  cpa: number; // Cost per Action (每笔成交花费)
  impressions: number;
  clicks: number;
  orders: number; // Sub-orders (子订单量)
  // New metrics for report
  todayGmv?: number;
  totalLaunchGmv?: number;
  // Derived metrics
  ctr?: number;
  cvr?: number;
}

export type RoasStrategy = 'strong' | 'medium' | 'weak' | 'custom';

export type SortConfig = {
  key: keyof AdProduct | null;
  direction: 'asc' | 'desc';
};

export const MOCK_DATA: AdProduct[] = [
  {
    id: '1001',
    skuId: '60110829341',
    spuId: '93284710',
    name: '新款大码女装土圆领针织秋冬修身显瘦收腰百搭包...',
    imageUrl: 'https://loremflickr.com/200/200/dress?lock=1',
    status: 'active',
    learningStatus: 'completed',
    budgetMode: 'custom',
    budgetAmount: 100.00,
    remainingBudgetPercent: 99,
    targetRoas: 1.94,
    stationInfo: '站点:泰国等92个站点',
    spend: 0.07,
    sales: 0.00,
    roas: 0.00,
    acos: 0.00,
    cpa: 0.00,
    impressions: 89,
    clicks: 3,
    orders: 0,
    todayGmv: 0.00,
    totalLaunchGmv: 125.50
  },
  {
    id: '1002',
    skuId: '60110283745',
    spuId: '18273645',
    name: '潮流新款长袖露肩复古印花 大码连衣裙',
    imageUrl: 'https://loremflickr.com/200/200/dress?lock=2',
    status: 'active',
    learningStatus: 'completed',
    budgetMode: 'custom',
    budgetAmount: 100.00,
    remainingBudgetPercent: 99,
    targetRoas: 1.95,
    stationInfo: '站点:泰国等93个站点',
    spend: 0.38,
    sales: 0.00,
    roas: 0.00,
    acos: 0.00,
    cpa: 0.00,
    impressions: 343,
    clicks: 21,
    orders: 0,
    todayGmv: 0.00,
    totalLaunchGmv: 45.20
  },
  {
    id: '1003',
    skuId: '60110912837',
    spuId: '56473829',
    name: '大码女性波西米亚佩斯利印花露肩荷叶边裙，休...',
    imageUrl: 'https://loremflickr.com/200/200/dress?lock=3',
    status: 'active',
    learningStatus: 'completed',
    budgetMode: 'custom',
    budgetAmount: 100.00,
    remainingBudgetPercent: 99,
    targetRoas: 1.61,
    stationInfo: '站点:泰国等93个站点',
    spend: 0.16,
    sales: 0.00,
    roas: 0.00,
    acos: 0.00,
    cpa: 0.00,
    impressions: 148,
    clicks: 9,
    orders: 0,
    todayGmv: 0.00,
    totalLaunchGmv: 12.00
  },
  {
    id: '1004',
    skuId: '60110564738',
    spuId: '29384756',
    name: '大码女士印花褶皱腰带不对称下摆长袖衬衫，时...',
    imageUrl: 'https://loremflickr.com/200/200/dress?lock=4',
    status: 'active',
    learningStatus: 'completed',
    budgetMode: 'custom',
    budgetAmount: 100.00,
    remainingBudgetPercent: 99,
    targetRoas: 1.83,
    stationInfo: '站点:泰国等93个站点',
    spend: 0.03,
    sales: 25.35,
    roas: 845.00,
    acos: 0.11,
    cpa: 0.03,
    impressions: 42,
    clicks: 1,
    orders: 1,
    todayGmv: 25.35,
    totalLaunchGmv: 345.80
  }
];

export const MOCK_NEW_PRODUCTS = [
  {
    id: '2001',
    name: '新款大码碎花连衣裙收腰显瘦气质长裙',
    imageUrl: 'https://loremflickr.com/200/200/dress?lock=10',
    baseRoas: 2.68
  },
  {
    id: '2002',
    name: '大码女装加肥加大假两件卫衣',
    imageUrl: 'https://loremflickr.com/200/200/dress?lock=11',
    baseRoas: 2.46
  },
  {
    id: '2003',
    name: '胖MM高腰A字半身裙中长款',
    imageUrl: 'https://loremflickr.com/200/200/dress?lock=12',
    baseRoas: 1.97
  },
  {
    id: '2004',
    name: '宽松显瘦遮肚雪纺衫上衣',
    imageUrl: 'https://loremflickr.com/200/200/dress?lock=13',
    baseRoas: 2.53
  }
];

export const COLUMNS_CONFIG = [
  { key: 'spend', label: '总花费', default: true },
  { key: 'sales', label: '申报价销售额 (总成交额)', default: true },
  { key: 'roas', label: '投资回报率 (ROAS)', default: true },
  { key: 'acos', label: '推广费比 (推广)', default: true },
  { key: 'cpa', label: '每笔成交花费', default: true },
  { key: 'impressions', label: '曝光量', default: true },
  { key: 'clicks', label: '点击量', default: true },
  { key: 'ctr', label: '点击率 (CTR)', default: true },
  { key: 'orders', label: '订单量', default: true },
  { key: 'cvr', label: '转化率 (CVR)', default: true },
  { key: 'todayGmv', label: '今日成交额', default: true },
  { key: 'totalLaunchGmv', label: '投放以来总成交额', default: true }
];