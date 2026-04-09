import { useState, useEffect, lazy, Suspense } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { useContentStore } from './stores/contentStore';
import { useNavigationStore } from './stores/navigationStore';

import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import CookieConsent from './components/CookieConsent';
import Loader from './components/Loader';
import ToastContainer from './components/ui/Toast';

// Lazy load pages
// Lazy load pages with preloading to prevent double loader
const homePromise = import('./pages/HomePage');
const careersPromise = import('./pages/CareersPage');
const notFoundPromise = import('./pages/NotFound');

const HomePage = lazy(() => homePromise);
const CareersPage = lazy(() => careersPromise);
const NotFound = lazy(() => notFoundPromise);

// Fallback loading component for lazy routes
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const { fetchContent } = useContentStore();
  const { fetchNavigation } = useNavigationStore();

  // Initialize content on app load
  useEffect(() => {
    const initializeApp = async () => {
      // Start fetching immediately
      const contentPromise = fetchContent();
      const navPromise = fetchNavigation();

      // Wait for both
      await Promise.all([contentPromise, navPromise]);
      setDataReady(true);
    };
    initializeApp();
  }, [fetchContent, fetchNavigation]);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && (
          <Loader
            dataReady={dataReady}
            onFinish={() => setLoading(false)}
          />
        )}
      </AnimatePresence>

      {!loading && (
        <BrowserRouter>
          <div className="min-h-screen text-text font-primary">
            {/* Navbar lives here so it's shared across pages */}
            <div className="fixed top-5 left-0 w-full z-40 pointer-events-none mb-2.5">
              <div className="pointer-events-auto">
                <Navbar />
              </div>
            </div>

            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Static routes - always available */}
                <Route path="/" element={<HomePage />} />
                <Route path="/careers" element={<CareersPage />} />

                {/* Add more pages here as needed:
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>

            <ScrollToTop />
            <CookieConsent />
            <ToastContainer />
          </div>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
