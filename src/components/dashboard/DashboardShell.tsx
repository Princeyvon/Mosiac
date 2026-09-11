import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { CatalogueTable } from './CatalogueTable';
import { ProductEditForm } from './ProductEditForm';
import { DashboardOverview } from './DashboardOverview';
import { DashboardSubViews } from './DashboardSubViews';
import {
  UploadCloud,
  Bell,
  Plus,
  LogOut,
  LayoutDashboard,
  Grid,
  Percent,
  ShoppingBag,
  Users,
  Shield,
  History,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Lock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DashboardShell: React.FC = () => {
  const {
    isAdminAuth,
    loginAdmin,
    logoutAdmin,
    navigateToStore,
    activeAdminTab,
    setActiveAdminTab,
    editingProductId,
    createNewProduct,
    hasUnpublishedChanges,
    publishStagedChanges,
    notifications,
    toastMessage
  } = useStore();

  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loginEmail, setLoginEmail] = useState('admin@forma.studio');
  const [loginPassword, setLoginPassword] = useState('••••••••');

  // If unauthenticated, show Studio Login screen
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-white border border-neutral-200 rounded-xl shadow-xl w-full max-w-md p-8 text-neutral-900"
        >
          <div className="text-center mb-8">
            <span className="font-serif italic text-3xl font-normal text-black block mb-1">
              Forma
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-neutral-400">
              Studio Dashboard Authentication
            </span>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              loginAdmin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1.5">
                Staff Identity
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs focus:outline-black font-mono text-neutral-800"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1.5">
                Access Token / Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 text-xs focus:outline-black font-mono text-neutral-800"
              />
            </div>

            <div className="pt-2">
              <motion.button
                id="dash-login-btn"
                type="submit"
                whileTap={{ scale: 0.98 }}
                className="w-full bg-black text-white hover:bg-neutral-800 transition-colors py-3 rounded-lg text-[11px] uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Enter Studio Dashboard</span>
              </motion.button>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-between items-center text-[11px] text-neutral-500">
              <button
                type="button"
                onClick={navigateToStore}
                className="hover:text-black transition-colors cursor-pointer"
              >
                ← Return to Storefront
              </button>
              <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-mono">
                Demo Mode: Authorized
              </span>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Navigation tabs definition
  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'catalogue', label: 'Catalogue', icon: Grid },
    { id: 'discounts', label: 'Discounts', icon: Percent },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'team', label: 'Team', icon: Shield },
    { id: 'history', label: 'History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col text-neutral-900 font-sans">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-black text-white text-[11px] font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 h-14 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Script/cursive wordmark + small caps label */}
        <div className="flex items-center gap-3">
          <span className="font-serif italic text-2xl font-normal text-black tracking-tight select-none">
            Forma
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-400 border-l border-neutral-200 pl-3">
            STUDIO DASHBOARD
          </span>
        </div>

        {/* Right Chrome Controls: PUBLISH, Bell, + NEW PRODUCT, Avatar badge, Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* PUBLISH Button (Outline pill, cloud-upload icon) */}
          <motion.button
            id="dash-global-publish-btn"
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={publishStagedChanges}
            title="Push staged catalogue edits live to storefront"
            className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase border transition-all duration-150 cursor-pointer ${
              hasUnpublishedChanges
                ? 'border-amber-500 bg-amber-50 text-amber-900 hover:bg-amber-100 ring-2 ring-amber-200 animate-pulse'
                : 'border-neutral-300 bg-white text-neutral-700 hover:border-black hover:text-black'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {hasUnpublishedChanges ? 'Publish (Staged Changes)' : 'Publish'}
            </span>
            <span className="sm:hidden">Publish</span>
          </motion.button>

          {/* Notification Bell */}
          <div className="relative">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-full transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  key="notifications-popup"
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white border border-neutral-200 rounded-lg shadow-xl p-3 z-50 text-xs"
                >
                  <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">
                    Studio Notifications
                  </div>
                  <div className="space-y-2">
                    {notifications.map((msg, idx) => (
                      <div key={idx} className="p-2 bg-neutral-50 rounded text-neutral-700 text-[11px] leading-snug">
                        {msg}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Primary + NEW [PRODUCT] button (Solid black pill) */}
          <motion.button
            id="dash-top-new-product-btn"
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => createNewProduct()}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Product</span>
            <span className="sm:hidden">New</span>
          </motion.button>

          {/* Account badge: Avatar circle with initial + role label */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-neutral-200">
            <div className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-[11px]">
              A
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              ADMIN
            </span>
          </div>

          {/* Logout icon */}
          <button
            type="button"
            onClick={logoutAdmin}
            className="p-2 text-neutral-400 hover:text-black rounded-full transition-colors cursor-pointer"
            title="Sign out of dashboard"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* BODY WITH LEFT SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex">
        {/* LEFT SIDEBAR (Fixed/Collapsible) */}
        <aside
          className={`bg-white border-r border-neutral-200 shrink-0 transition-all duration-200 flex flex-col justify-between ${
            collapsed ? 'w-16' : 'w-56'
          }`}
        >
          {/* Top navigation items */}
          <div className="p-3 space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = activeAdminTab === item.id && !editingProductId;

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveAdminTab(item.id);
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </motion.button>
              );
            })}
          </div>

          {/* Bottom sidebar controls: Divider, View website, Collapse menu */}
          <div className="p-3 border-t border-neutral-200 space-y-1">
            {/* View website (opens public storefront) */}
            <button
              type="button"
              onClick={navigateToStore}
              title={collapsed ? 'View website' : undefined}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {!collapsed && <span>View website</span>}
            </button>

            {/* Collapse menu */}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4 shrink-0" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span>Collapse menu</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* MAIN VIEW AREA */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1600px] w-full mx-auto overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={editingProductId || activeAdminTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {editingProductId ? (
                <ProductEditForm productId={editingProductId} />
              ) : activeAdminTab === 'catalogue' ? (
                <CatalogueTable />
              ) : activeAdminTab === 'overview' ? (
                <DashboardOverview />
              ) : (
                <DashboardSubViews activeTab={activeAdminTab} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
