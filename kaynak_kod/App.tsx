import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { NeuralBackground } from './components/NeuralBackground';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { CommandPalette } from './components/CommandPalette';

// Load route content only when the visitor opens that route. This keeps the
// homepage's initial JavaScript smaller on mobile connections.
import { HomePage } from './pages/HomePage';
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ExperiencePage = lazy(() => import('./pages/ExperiencePage').then(m => ({ default: m.ExperiencePage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));

// Direct redirect to full Scrollytelling standalone HTML page
const DataStoryRedirect: React.FC = () => {
  useEffect(() => {
    window.location.href = '/veri-hikayesi.html';
  }, []);
  return null;
};

export const App: React.FC = () => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const location = useLocation();

  // Scroll to top immediately on page route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  useEffect(() => {
    const handleOpenPalette = () => setIsPaletteOpen(true);
    window.addEventListener('open-command-palette', handleOpenPalette);

    return () => {
      window.removeEventListener('open-command-palette', handleOpenPalette);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#07090e] text-[#F5F5F5] selection:bg-[#54D6FF]/20 selection:text-[#54D6FF] antialiased flex flex-col justify-between overflow-x-hidden font-sans">
      
      {/* Background Micro Coordinates Grid */}
      <NeuralBackground />

      {/* Top Scroll Progress Indicator */}
      <ScrollProgressBar />

      {/* Multi-Page Modern Header */}
      <Navbar />

      {/* Main Content with Butter-Smooth Page Transitions */}
      <main id="main-content" className="relative flex-grow z-10 pt-20">
        <div key={location.pathname} className="page-enter">
          <Suspense fallback={<div className="min-h-[40vh]" aria-label="Sayfa yükleniyor" />}>
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/hakkimda" element={<AboutPage />} />
              <Route path="/projeler" element={<ProjectsPage />} />
              <Route path="/projeler/veri-hikayesi" element={<DataStoryRedirect />} />
              <Route path="/veri-hikayesi" element={<DataStoryRedirect />} />
              <Route path="/deneyim" element={<ExperiencePage />} />
              <Route path="/iletisim" element={<ContactPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>

      {/* Command Palette (Ctrl+K / ⌘K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
      />

      {/* Footer */}
      <Footer />

      {/* Floating Back to Top Button */}
      <BackToTop />
    </div>
  );
};

export default App;
