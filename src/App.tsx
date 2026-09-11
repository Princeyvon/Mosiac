import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { StickyHeader } from './components/storefront/StickyHeader';
import { ProductGrid } from './components/storefront/ProductGrid';
import { ProductDetail } from './components/storefront/ProductDetail';
import { ProductVariantsView } from './components/storefront/ProductVariantsView';
import { CartPage } from './components/storefront/CartPage';
import { PoliciesPage } from './components/storefront/PoliciesPage';
import { PromoPopup } from './components/storefront/PromoPopup';
import { Footer } from './components/storefront/Footer';
import { CookieBanner } from './components/storefront/CookieBanner';
import { StoreModals } from './components/storefront/StoreModals';
import { DashboardShell } from './components/dashboard/DashboardShell';
import { ToastNotification } from './components/common/ToastNotification';
import { motion, AnimatePresence } from 'motion/react';

const MainAppContent: React.FC = () => {
  const { currentView, currentProductSlug, navigateToDash } = useStore();

  // Listen to hash changes or initial URL for direct access to #/dash
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#/dash' || window.location.pathname.endsWith('/dash')) {
        navigateToDash();
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigateToDash]);

  return (
    <>
      <ToastNotification />
      <AnimatePresence mode="wait">
        {currentView === 'dash' ? (
          <motion.div
            key="dash-view-container"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="min-h-screen"
          >
            <DashboardShell />
          </motion.div>
        ) : (
          <motion.div
            key="storefront-view-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="min-h-screen bg-white flex flex-col justify-between selection:bg-black selection:text-white"
          >
            <StickyHeader />

            <main className="flex-1">
              <AnimatePresence mode="wait">
                {currentView === 'pdp' && currentProductSlug ? (
                  <motion.div
                    key={`pdp-${currentProductSlug}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                  >
                    <ProductDetail slug={currentProductSlug} />
                  </motion.div>
                ) : currentView === 'variants' && currentProductSlug ? (
                  <motion.div
                    key={`variants-${currentProductSlug}`}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                  >
                    <ProductVariantsView slug={currentProductSlug} />
                  </motion.div>
                ) : currentView === 'cart' ? (
                  <motion.div
                    key="cart-view"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                  >
                    <CartPage />
                  </motion.div>
                ) : currentView === 'policies' ? (
                  <motion.div
                    key="policies-view"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                  >
                    <PoliciesPage />
                  </motion.div>
                ) : (
                  <motion.div
                    key="storefront-grid"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.24, ease: 'easeOut' }}
                  >
                    <ProductGrid />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            <Footer />
            <CookieBanner />
            <StoreModals />
            <PromoPopup />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
