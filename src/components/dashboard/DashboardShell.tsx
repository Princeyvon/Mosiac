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
  Lock,
  CheckCircle2,
  Filter,
  FileText,
  UserCheck
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

  const [showNotifications, setShowNotifications] = useState(false);
  const [loginEmail, setLoginEmail] = useState('admin@mosiac.studio');
  const [loginPassword, setLoginPassword] = useState('••••••••');

  // If unauthenticated, show Studio Login screen
  if (!isAdminAuth) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white border border-neutral-200 rounded-sm shadow-xl w-full max-w-md p-8 text-neutral-900"
        >
          <div className="text-center mb-8">
            <span className="font-serif italic text-3xl font-normal text-black block mb-1">
              Mosiac
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
                className="w-full border border-neutral-300 rounded-sm px-3.5 py-2.5 text-xs focus:outline-black font-mono text-neutral-800"
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
                className="w-full border border-neutral-300 rounded-sm px-3.5 py-2.5 text-xs focus:outline-black font-mono text-neutral-800"
              />
            </div>

            <div className="pt-2">
              <motion.button
                id="dash-login-btn"
                type="submit"
                whileTap={{ scale: 0.98 }}
                className="w-full bg-black text-white hover:bg-neutral-800 transition-colors py-3 rounded-sm text-[11px] uppercase tracking-widest font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
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
              <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-sm font-mono">
                Demo Mode: Authorized
              </span>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  // Navigation sections with grouped items
  const NAV_SECTIONS = [
    {
      heading: 'Catalogue & Store',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'catalogue', label: 'Catalogue', icon: Grid },
        { id: 'filters', label: 'Storefront Filters', icon: Filter },
        { id: 'discounts', label: 'Promos & Popups', icon: Percent },
      ]
    },
    {
      heading: 'Operations',
      items: [
        { id: 'orders', label: 'Client Orders', icon: ShoppingBag },
        { id: 'customers', label: 'Clientele', icon: Users },
      ]
    },
    {
      heading: 'Studio Governance',
      items: [
        { id: 'team', label: 'Studio Team', icon: Shield },
        { id: 'policies', label: 'Terms & Policies', icon: FileText },
        { id: 'history', label: 'Activity Log', icon: History },
        { id: 'profile', label: 'Studio Settings', icon: UserCheck },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col text-neutral-900 font-sans">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-black text-white text-[11px] font-medium px-4 py-2.5 rounded-sm shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BAR */}
      <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 h-14 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Brand name + subtitle */}
        <div className="flex items-center gap-3">
          <span className="font-serif italic text-2xl font-normal text-black tracking-tight select-none">
            Mosiac
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-neutral-400 border-l border-neutral-200 pl-3">
            STUDIO DASHBOARD
          </span>
        </div>

        {/* Right Chrome Controls: PUBLISH, Bell, + NEW PRODUCT, Avatar badge, Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* PUBLISH Button */}
          <motion.button
            id="dash-global-publish-btn"
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={publishStagedChanges}
            title="Push staged catalogue edits live to storefront"
            className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-sm text-[11px] font-semibold tracking-wider uppercase border transition-all duration-150 cursor-pointer ${
              hasUnpublishedChanges
                ? 'border-amber-500 bg-amber-50 text-amber-900 hover:bg-amber-100 ring-1 ring-amber-300'
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
              className="p-2 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded-sm transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-sm" />
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  key="notifications-popup"
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -6 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white border border-neutral-200 rounded-sm shadow-xl p-3 z-50 text-xs"
                >
                  <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">
                    Studio Notifications
                  </div>
                  <div className="space-y-2">
                    {notifications.map((msg, idx) => (
                      <div key={idx} className="p-2 bg-neutral-50 rounded-sm text-neutral-700 text-[11px] leading-snug">
                        {msg}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Primary + NEW [PRODUCT] button */}
          <motion.button
            id="dash-top-new-product-btn"
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => createNewProduct()}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-sm text-[11px] font-semibold tracking-wider uppercase bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Product</span>
            <span className="sm:hidden">New</span>
          </motion.button>

          {/* Account badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-neutral-200">
            <div className="w-7 h-7 rounded-sm bg-neutral-900 text-white flex items-center justify-center font-bold text-[11px]">
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
            className="p-2 text-neutral-400 hover:text-black rounded-sm transition-colors cursor-pointer"
            title="Sign out of dashboard"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* BODY WITH STATIC LEFT SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 flex">
        {/* STATIC LEFT SIDEBAR (No collapse, clean spatial hierarchy) */}
        <aside className="w-60 bg-white border-r border-neutral-200 shrink-0 flex flex-col justify-between select-none">
          {/* Top Navigation Sections */}
          <div className="p-3.5 space-y-6">
            {NAV_SECTIONS.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <span className="block px-2.5 text-[9px] uppercase tracking-[0.2em] font-semibold text-neutral-400">
                  {section.heading}
                </span>
                <div className="space-y-0.5 pt-1">
                  {section.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeAdminTab === item.id && !editingProductId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveAdminTab(item.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-xs font-medium tracking-tight transition-colors cursor-pointer text-left ${
                          isActive
                            ? 'bg-black text-white font-semibold'
                            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Sidebar: Return to Storefront */}
          <div className="p-3.5 border-t border-neutral-200">
            <button
              type="button"
              onClick={navigateToStore}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-xs font-medium text-neutral-600 hover:bg-neutral-100 hover:text-black transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 shrink-0 text-neutral-400" />
              <span>View Storefront</span>
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
