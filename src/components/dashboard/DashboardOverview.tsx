import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  Activity,
  Layers,
  ArrowRight,
  Plus
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    stagedProducts,
    orders,
    formatPrice,
    setEditingProductId,
    setActiveAdminTab,
    createNewProduct
  } = useStore();

  const [chartRange, setChartRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  const totalStock = stagedProducts.reduce((acc, p) => acc + (p.stockOnHand || 0), 0);
  const lowStockItems = stagedProducts.filter(p => p.stockOnHand <= (p.lowStockAlertAt || 2));
  const inStockCount = stagedProducts.filter(p => p.availability !== 'Sold out' && (p.stockOnHand || 0) > (p.lowStockAlertAt || 2)).length;
  const madeToOrderCount = stagedProducts.filter(p => p.availability === 'Made to order').length;
  const soldOutCount = stagedProducts.filter(p => p.availability === 'Sold out').length;
  const totalRevenueUSD = orders.reduce((acc, o) => acc + o.total, 0);

  // Synthetic analytics data points for chart
  const chartData = {
    '7d': [
      { label: 'Mon', revenue: 4800, orders: 1 },
      { label: 'Tue', revenue: 9600, orders: 2 },
      { label: 'Wed', revenue: 3200, orders: 1 },
      { label: 'Thu', revenue: 14200, orders: 3 },
      { label: 'Fri', revenue: 7800, orders: 2 },
      { label: 'Sat', revenue: 19400, orders: 4 },
      { label: 'Sun', revenue: 11200, orders: 2 },
    ],
    '30d': [
      { label: 'Wk 1', revenue: 38400, orders: 8 },
      { label: 'Wk 2', revenue: 54200, orders: 11 },
      { label: 'Wk 3', revenue: 42900, orders: 9 },
      { label: 'Wk 4', revenue: 68100, orders: 14 },
    ],
    '90d': [
      { label: 'Jun', revenue: 142000, orders: 29 },
      { label: 'Jul', revenue: 189000, orders: 38 },
      { label: 'Aug', revenue: 215000, orders: 44 },
    ]
  }[chartRange];

  const maxChartRevenue = Math.max(...chartData.map(d => d.revenue));

  return (
    <div className="space-y-6">
      {/* Overview Heading with quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900">
            Studio Operations Overview
          </h1>
          <p className="text-[12px] text-neutral-500 mt-1">
            Real-time catalogue telemetry, sales velocity, and inventory allocation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveAdminTab('catalogue')}
            className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-700 bg-white border border-neutral-300 rounded-full hover:border-black hover:text-black transition-colors"
          >
            Manage Catalogue
          </button>
          <button
            type="button"
            onClick={() => createNewProduct()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-white bg-black rounded-full hover:bg-neutral-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Piece</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveAdminTab('orders')}
          className="bg-white p-5 border border-neutral-200 rounded-xl shadow-2xs hover:border-neutral-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Total Revenue (30d)</span>
            <DollarSign className="w-4 h-4 text-neutral-500 group-hover:text-black transition-colors" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 font-mono">
            {formatPrice(totalRevenueUSD)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% vs previous period</span>
          </div>
        </div>

        <div
          onClick={() => setActiveAdminTab('catalogue')}
          className="bg-white p-5 border border-neutral-200 rounded-xl shadow-2xs hover:border-neutral-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Active Catalogue</span>
            <Package className="w-4 h-4 text-neutral-500 group-hover:text-black transition-colors" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 font-mono">
            {stagedProducts.length} <span className="text-sm font-normal text-neutral-400">works</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {stagedProducts.filter(p => p.visible).length} visible on storefront
          </div>
        </div>

        <div
          onClick={() => setActiveAdminTab('catalogue')}
          className="bg-white p-5 border border-neutral-200 rounded-xl shadow-2xs hover:border-neutral-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Studio Inventory</span>
            <Layers className="w-4 h-4 text-neutral-500 group-hover:text-black transition-colors" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-neutral-900 font-mono">
            {totalStock} <span className="text-sm font-normal text-neutral-400">units</span>
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Across {stagedProducts.length} numbered designs
          </div>
        </div>

        <div
          onClick={() => setActiveAdminTab('catalogue')}
          className="bg-white p-5 border border-neutral-200 rounded-xl shadow-2xs hover:border-amber-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Low Stock Inquiries</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-600 font-mono">
            {lowStockItems.length}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">
            Requires studio allocation or restock
          </div>
        </div>
      </div>

      {/* Interactive Sales Velocity Chart + Inventory Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Velocity Chart */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 border border-neutral-200 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-neutral-700" />
              <div>
                <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                  Sales Velocity & Revenue Trajectory
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Total client acquisition volume across active studio currency tiers
                </p>
              </div>
            </div>

            {/* Range Pills */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-full text-[10px] font-medium uppercase font-mono">
              {(['7d', '30d', '90d'] as const).map(range => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setChartRange(range)}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    chartRange === range ? 'bg-black text-white shadow-2xs' : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="mt-6 pt-2">
            <div className="h-44 flex items-end justify-between gap-3 sm:gap-6 px-2">
              {chartData.map((d, index) => {
                const heightPercent = Math.max(12, Math.round((d.revenue / maxChartRevenue) * 100));
                const isHovered = hoveredBar === index;

                return (
                  <div
                    key={d.label}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer relative"
                  >
                    {/* Tooltip on hover */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 bg-black text-white text-[10px] font-mono px-2.5 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                        <div className="font-bold">{formatPrice(d.revenue)}</div>
                        <div className="text-[9px] text-neutral-400">{d.orders} completed orders</div>
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[48px] rounded-t-sm transition-all duration-300 ${
                        isHovered ? 'bg-neutral-950 shadow-md' : 'bg-neutral-800 group-hover:bg-neutral-900'
                      }`}
                    />

                    {/* X-axis Label */}
                    <span className="text-[10px] font-mono uppercase text-neutral-400">
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Footer metric line */}
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
              <span className="font-mono text-[11px]">
                Average Order Value: <strong className="text-neutral-900 font-semibold">{formatPrice(Math.round(totalRevenueUSD / (orders.length || 1)))}</strong>
              </span>
              <span className="font-mono text-[11px]">
                Fulfilment Rate: <strong className="text-emerald-600 font-semibold">98.2%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Inventory Allocation Breakdown */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 border border-neutral-200 rounded-xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-700" />
              <span>Inventory Allocation</span>
            </h2>
            <p className="text-[11px] text-neutral-500 mt-1">
              Distribution across stock availability pipelines.
            </p>

            {/* Stacked Progress Bar */}
            <div className="mt-5 space-y-2">
              <div className="h-3 w-full bg-neutral-100 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${(inStockCount / stagedProducts.length) * 100}%` }}
                  className="bg-emerald-600"
                  title={`Ready to Ship: ${inStockCount}`}
                />
                <div
                  style={{ width: `${(madeToOrderCount / stagedProducts.length) * 100}%` }}
                  className="bg-neutral-800"
                  title={`Made to Order: ${madeToOrderCount}`}
                />
                <div
                  style={{ width: `${(lowStockItems.length / stagedProducts.length) * 100}%` }}
                  className="bg-amber-500"
                  title={`Low Stock: ${lowStockItems.length}`}
                />
                <div
                  style={{ width: `${(soldOutCount / stagedProducts.length) * 100}%` }}
                  className="bg-neutral-300"
                  title={`Sold Out: ${soldOutCount}`}
                />
              </div>

              {/* Legend with counts */}
              <div className="pt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span className="text-neutral-700">Ready to Ship</span>
                  </div>
                  <span className="font-mono font-semibold text-neutral-900">{inStockCount} designs</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                    <span className="text-neutral-700">Made to Order</span>
                  </div>
                  <span className="font-mono font-semibold text-neutral-900">{madeToOrderCount} designs</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="text-neutral-700">Low Stock Alert</span>
                  </div>
                  <span className="font-mono font-semibold text-amber-700">{lowStockItems.length} designs</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                    <span className="text-neutral-700">Archived / Sold Out</span>
                  </div>
                  <span className="font-mono font-semibold text-neutral-500">{soldOutCount} designs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 mt-4">
            <button
              type="button"
              onClick={() => setActiveAdminTab('catalogue')}
              className="w-full py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 text-[11px] font-semibold uppercase tracking-wider rounded-lg border border-neutral-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Audit Inventory Levels</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low Stock Watchlist */}
        <div className="lg:col-span-6 bg-white p-5 border border-neutral-200 rounded-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h2 className="text-[12px] uppercase tracking-wider font-bold text-neutral-900 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Low Stock & Allocation Watchlist</span>
            </h2>
            <button
              type="button"
              onClick={() => setActiveAdminTab('catalogue')}
              className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 hover:text-black"
            >
              View Catalogue
            </button>
          </div>

          <div className="divide-y divide-neutral-100 mt-2">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">All pieces are adequately stocked.</p>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={item.cardImage} alt="" className="w-10 h-10 object-cover rounded bg-neutral-100" />
                    <div>
                      <h3 className="text-xs font-semibold text-neutral-900">{item.name}</h3>
                      <p className="text-[10px] text-neutral-500 font-mono">SKU: {item.sku} · {item.fulfilment}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {item.stockOnHand} on hand
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveAdminTab('catalogue');
                        setEditingProductId(item.id);
                      }}
                      className="text-neutral-400 hover:text-black p-1 hover:bg-neutral-100 rounded"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Studio Orders */}
        <div className="lg:col-span-6 bg-white p-5 border border-neutral-200 rounded-xl">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h2 className="text-[12px] uppercase tracking-wider font-bold text-neutral-900">
              Recent Studio Orders
            </h2>
            <button
              type="button"
              onClick={() => setActiveAdminTab('orders')}
              className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 hover:text-black"
            >
              All Orders ({orders.length})
            </button>
          </div>

          <div className="divide-y divide-neutral-100 mt-2">
            {orders.slice(0, 4).map(order => (
              <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-neutral-900">{order.customerName}</div>
                  <div className="text-[10px] text-neutral-400 font-mono">{order.id} · {order.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-neutral-900">{formatPrice(order.total)}</div>
                  <span className={`text-[9px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                    order.status === 'Fulfilled'
                      ? 'bg-neutral-100 text-neutral-800'
                      : 'bg-emerald-50 text-emerald-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
