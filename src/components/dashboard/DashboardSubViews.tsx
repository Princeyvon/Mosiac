import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Tag,
  Users,
  Shield,
  Clock,
  Plus,
  CheckCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Truck,
  ExternalLink,
  Mail,
  MapPin,
  Check
} from 'lucide-react';

export const DashboardSubViews: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const { orders, auditLogs, formatPrice, showToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Local state for orders status manipulation
  const [orderList, setOrderList] = useState(orders);

  // Local state for discounts
  const [discounts, setDiscounts] = useState([
    { code: 'ARCHTRADE15', percent: '15% Off', type: 'Trade Partner', status: 'Active', uses: 28 },
    { code: 'COLLECTOR20', percent: '20% Off', type: 'Private Collector', status: 'Active', uses: 12 },
    { code: 'STUDIOOPEN', percent: '10% Off', type: 'Public Welcome', status: 'Paused', uses: 145 },
  ]);
  const [showNewDiscount, setShowNewDiscount] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newPercent, setNewPercent] = useState('15% Off');
  const [newTier, setNewTier] = useState('Trade Partner');

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setDiscounts(prev => [
      {
        code: newCode.toUpperCase().trim(),
        percent: newPercent,
        type: newTier,
        status: 'Active',
        uses: 0
      },
      ...prev
    ]);
    setShowNewDiscount(false);
    setNewCode('');
    showToast(`Created promo code: ${newCode.toUpperCase()}`);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: 'Processing' | 'Dispatched' | 'Fulfilled') => {
    setOrderList(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    showToast(`Order ${orderId} marked as ${newStatus}`);
  };

  // DISCOUNTS VIEW
  if (activeTab === 'discounts') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Trade & Studio Discounts</h1>
            <p className="text-[12px] text-neutral-500 mt-1">Manage private client discount codes and architectural trade tier rules.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowNewDiscount(!showNewDiscount)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-[11px] font-medium tracking-wider uppercase rounded-full hover:bg-neutral-800 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Code</span>
          </button>
        </div>

        {/* Create Code Form */}
        {showNewDiscount && (
          <form onSubmit={handleCreateDiscount} className="bg-white p-5 border border-neutral-200 rounded-xl space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Generate New Trade Discount Code</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1">Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MILANDESIGN20"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:outline-black"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1">Discount Rate</label>
                <input
                  type="text"
                  required
                  value={newPercent}
                  onChange={e => setNewPercent(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:outline-black"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-500 mb-1">Tier / Eligibility</label>
                <select
                  value={newTier}
                  onChange={e => setNewTier(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:outline-black"
                >
                  <option value="Trade Partner">Trade Partner</option>
                  <option value="Private Collector">Private Collector</option>
                  <option value="Architect VIP">Architect VIP</option>
                  <option value="Public Promotion">Public Promotion</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewDiscount(false)}
                className="px-3.5 py-1.5 text-xs text-neutral-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-black text-white text-xs font-medium uppercase tracking-wider rounded-full hover:bg-neutral-800"
              >
                Save Code
              </button>
            </div>
          </form>
        )}

        <div className="border border-neutral-200 bg-white rounded-xl overflow-hidden divide-y divide-neutral-200 text-xs shadow-2xs">
          <div className="p-3.5 bg-neutral-50 text-[10px] uppercase font-mono tracking-wider text-neutral-400 grid grid-cols-5">
            <span>Promo Code</span>
            <span>Rate</span>
            <span>Tier</span>
            <span>Status</span>
            <span className="text-right">Redemptions</span>
          </div>
          {discounts.map(d => (
            <div key={d.code} className="p-4 grid grid-cols-5 items-center">
              <span className="font-mono font-bold text-neutral-900">{d.code}</span>
              <span className="font-semibold text-neutral-700">{d.percent}</span>
              <span className="text-neutral-500">{d.type}</span>
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  d.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {d.status}
                </span>
              </div>
              <span className="font-mono text-neutral-600 text-right">{d.uses} orders</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ORDERS VIEW
  if (activeTab === 'orders') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Client Orders ({orderList.length})</h1>
            <p className="text-[12px] text-neutral-500 mt-1">Order fulfilment, courier dispatch logs, and white-glove delivery scheduling.</p>
          </div>
        </div>

        <div className="border border-neutral-200 bg-white rounded-xl overflow-hidden divide-y divide-neutral-200 text-xs shadow-2xs">
          <div className="p-3.5 bg-neutral-50 text-[10px] uppercase font-mono tracking-wider text-neutral-400 grid grid-cols-12">
            <span className="col-span-3">Order Reference</span>
            <span className="col-span-3">Client</span>
            <span className="col-span-2">Date</span>
            <span className="col-span-2">Total</span>
            <span className="col-span-2 text-right">Status / Actions</span>
          </div>

          {orderList.map(o => {
            const isExpanded = expandedOrderId === o.id;

            return (
              <div key={o.id} className="divide-y divide-neutral-100">
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                  className="p-4 grid grid-cols-12 items-center hover:bg-neutral-50/80 transition-colors cursor-pointer"
                >
                  <div className="col-span-3 flex items-center gap-2">
                    <span className="font-mono font-semibold text-neutral-900">{o.id}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />}
                  </div>
                  <div className="col-span-3">
                    <div className="font-medium text-neutral-900">{o.customerName}</div>
                    <div className="text-[10px] text-neutral-400">{o.customerEmail}</div>
                  </div>
                  <span className="col-span-2 text-neutral-500 font-mono text-[11px]">{o.date}</span>
                  <div className="col-span-2 font-mono font-bold text-neutral-900">
                    {formatPrice(o.total)}
                    <span className="block text-[10px] font-normal text-neutral-400 font-sans">{o.itemsCount} {o.itemsCount === 1 ? 'piece' : 'pieces'}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                      o.status === 'Fulfilled'
                        ? 'bg-neutral-100 text-neutral-800'
                        : o.status === 'Dispatched'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="p-5 bg-neutral-50/60 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Shipping Destination</span>
                      <p className="text-neutral-800 font-medium">{o.customerName}</p>
                      <p className="text-[11px] text-neutral-500">Curatorial Residence · 742 Evergreen Terrace</p>
                      <p className="text-[11px] text-neutral-500">Kyoto 604-8134, Japan</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Logistics & Handling</span>
                      <p className="text-neutral-800 font-medium">DHL Global White-Glove Air</p>
                      <p className="text-[11px] font-mono text-neutral-500">Tracking: #DHL-984-2194-01</p>
                      <p className="text-[11px] text-emerald-600">Insured Value: 100% Comprehensive</p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">Update Fulfilment Status</span>
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateOrderStatus(o.id, 'Processing');
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase ${
                            o.status === 'Processing' ? 'bg-black text-white' : 'bg-white border border-neutral-300 text-neutral-700'
                          }`}
                        >
                          Processing
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateOrderStatus(o.id, 'Dispatched');
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase ${
                            o.status === 'Dispatched' ? 'bg-black text-white' : 'bg-white border border-neutral-300 text-neutral-700'
                          }`}
                        >
                          Dispatched
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateOrderStatus(o.id, 'Fulfilled');
                          }}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase ${
                            o.status === 'Fulfilled' ? 'bg-black text-white' : 'bg-white border border-neutral-300 text-neutral-700'
                          }`}
                        >
                          Fulfilled
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // CUSTOMERS VIEW
  if (activeTab === 'customers') {
    const customers = [
      { name: 'Camille Moreau', email: 'camille@atelier-arch.fr', role: 'Architect (Paris)', spent: 18400, orders: 4 },
      { name: 'Henrik Lindqvist', email: 'henrik@nordicform.se', role: 'Interior Designer (Stockholm)', spent: 12900, orders: 3 },
      { name: 'Sora Takahashi', email: 'sora@tokyo-space.jp', role: 'Private Collector (Tokyo)', spent: 6850, orders: 2 },
      { name: 'Elena Rostova', email: 'elena@rostova.com', role: 'Residential Curator (New York)', spent: 24200, orders: 5 }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Studio Clientele ({customers.length})</h1>
            <p className="text-[12px] text-neutral-500 mt-1">Directory of trade partners, architectural firms, and private collectors.</p>
          </div>
        </div>

        <div className="border border-neutral-200 bg-white rounded-xl overflow-hidden divide-y divide-neutral-200 text-xs shadow-2xs">
          <div className="p-3.5 bg-neutral-50 text-[10px] uppercase font-mono tracking-wider text-neutral-400 grid grid-cols-5">
            <span>Name</span>
            <span>Contact</span>
            <span>Profile</span>
            <span>Orders</span>
            <span className="text-right">Lifetime Volume</span>
          </div>
          {customers.map(c => (
            <div key={c.email} className="p-4 grid grid-cols-5 items-center">
              <span className="font-semibold text-neutral-900">{c.name}</span>
              <span className="text-neutral-500 font-mono text-[11px]">{c.email}</span>
              <span className="text-neutral-600">{c.role}</span>
              <span className="font-mono text-neutral-700">{c.orders} commissions</span>
              <span className="font-mono font-bold text-neutral-900 text-right">{formatPrice(c.spent)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TEAM VIEW
  if (activeTab === 'team') {
    const team = [
      { name: 'Alix de Saint-Germain', email: 'alix@forma.studio', role: 'Principal / Super Admin', status: 'Active' },
      { name: 'Julian Vance', email: 'julian@forma.studio', role: 'Head of Production & Casting', status: 'Active' },
      { name: 'Maeve Chen', email: 'maeve@forma.studio', role: 'Curatorial Manager', status: 'Active' }
    ];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Studio Team & Access Controls</h1>
            <p className="text-[12px] text-neutral-500 mt-1">Manage personnel permissions, authentication keys, and editor roles.</p>
          </div>
          <button
            type="button"
            onClick={() => showToast('Invitation dispatched to team member')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-[11px] font-medium tracking-wider uppercase rounded-full hover:bg-neutral-800 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Invite Staff</span>
          </button>
        </div>

        <div className="border border-neutral-200 bg-white rounded-xl overflow-hidden divide-y divide-neutral-200 text-xs shadow-2xs">
          <div className="p-3.5 bg-neutral-50 text-[10px] uppercase font-mono tracking-wider text-neutral-400 grid grid-cols-4">
            <span>Member</span>
            <span>Email</span>
            <span>Access Tier</span>
            <span className="text-right">Status</span>
          </div>
          {team.map(m => (
            <div key={m.email} className="p-4 grid grid-cols-4 items-center">
              <span className="font-semibold text-neutral-900">{m.name}</span>
              <span className="text-neutral-500 font-mono text-[11px]">{m.email}</span>
              <span className="text-neutral-700">{m.role}</span>
              <div className="text-right">
                <span className="bg-neutral-100 text-neutral-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                  {m.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // HISTORY VIEW (Audit log of changes)
  if (activeTab === 'history') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">Catalogue Audit Log</h1>
            <p className="text-[12px] text-neutral-500 mt-1">Immutable chronology of catalogue mutations, pricing adjustments, and publish events.</p>
          </div>
        </div>

        <div className="border border-neutral-200 bg-white rounded-xl overflow-hidden divide-y divide-neutral-200 text-xs shadow-2xs">
          <div className="p-3.5 bg-neutral-50 text-[10px] uppercase font-mono tracking-wider text-neutral-400 grid grid-cols-4">
            <span>Action</span>
            <span>Item Target</span>
            <span>Operator</span>
            <span className="text-right">Timestamp</span>
          </div>
          {auditLogs.map(log => (
            <div key={log.id} className="p-4 grid grid-cols-4 items-center">
              <span className="font-semibold text-neutral-900">{log.action}</span>
              <span className="text-neutral-700 font-medium">{log.target}</span>
              <span className="text-neutral-500 font-mono text-[11px]">{log.user}</span>
              <span className="text-neutral-400 font-mono text-[11px] text-right">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};
