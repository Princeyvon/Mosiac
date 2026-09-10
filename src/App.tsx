import React, { useEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { StickyHeader } from './components/storefront/StickyHeader';
import { ProductGrid } from './components/storefront/ProductGrid';
import { ProductDetail } from './components/storefront/ProductDetail';
import { Footer } from './components/storefront/Footer';
import { CartDrawer } from './components/storefront/CartDrawer';
import { CookieBanner } from './components/storefront/CookieBanner';
import { StoreModals } from './components/storefront/StoreModals';
import { DashboardShell } from './components/dashboard/DashboardShell';

const MainAppContent: React.FC = () => {
  const { currentView, currentProductSlug, navigateToDash, navigateToStore } = useStore();

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
  }, []);

  if (currentView === 'dash') {
    return <DashboardShell />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-black selection:text-white">
      <StickyHeader />

      <div className="flex-1">
        {currentView === 'pdp' && currentProductSlug ? (
          <ProductDetail slug={currentProductSlug} />
        ) : (
          <ProductGrid />
        )}
      </div>

      <Footer />
      <CartDrawer />
      <CookieBanner />
      <StoreModals />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}
