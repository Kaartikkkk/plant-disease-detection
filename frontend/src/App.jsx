import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Microscope, BarChart3, BookOpen, Clock,
  Cpu, ShieldCheck, Menu, ChevronRight, ArrowLeft, Home
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import DiseaseScanner from './components/DiseaseScanner';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PathologyLibrary from './components/PathologyLibrary';
import ScanHistoryView from './components/ScanHistoryView';
import ModelTelemetry from './components/ModelTelemetry';
import DatasetExplorer from './components/DatasetExplorer';
import LandingPage from './components/LandingPage';
import { diseaseService } from './services/diseaseService';

const getRouteState = (pathname) => {
  const p = (pathname || '').toLowerCase();
  if (p === '/detect' || p === '/scanner') return { view: 'app', tab: 'scanner' };
  if (p === '/dataset') return { view: 'app', tab: 'dataset' };
  if (p === '/analytics') return { view: 'app', tab: 'analytics' };
  if (p === '/library') return { view: 'app', tab: 'library' };
  if (p === '/history') return { view: 'app', tab: 'history' };
  if (p === '/telemetry') return { view: 'app', tab: 'telemetry' };
  return { view: 'landing', tab: 'scanner' };
};

function App() {
  const initialRoute = getRouteState(window.location.pathname);
  const [currentView, setCurrentView] = useState(initialRoute.view);
  const [activeTab, setActiveTab] = useState(initialRoute.tab);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [modelName, setModelName] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scannerPreset, setScannerPreset] = useState({ symptoms: '', crop: '' });

  useEffect(() => {
    checkHealth();
    const timer = setInterval(checkHealth, 25000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const state = getRouteState(window.location.pathname);
      setCurrentView(state.view);
      setActiveTab(state.tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path, tab) => {
    const targetPath = path || (tab === 'scanner' ? '/detect' : `/${tab}`);
    window.history.pushState({}, '', targetPath);
    const state = getRouteState(targetPath);
    setCurrentView(state.view);
    if (tab) {
      setActiveTab(tab);
    } else if (state.tab) {
      setActiveTab(state.tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const targetPath = tabId === 'scanner' ? '/detect' : `/${tabId}`;
    window.history.pushState({}, '', targetPath);
  };

  const checkHealth = async () => {
    try {
      const data = await diseaseService.checkHealth();
      if (data.online || data.status === 'ok') {
        setBackendStatus('online');
        setModelName(data.model_name || 'EfficientNetB3');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  const handleTestInScanner = (pathology) => {
    setScannerPreset({
      symptoms: pathology.symptoms || '',
      crop: pathology.crop || ''
    });
    handleTabChange('scanner');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageHeadings = {
    scanner: {
      breadcrumb: 'Diagnostic Suite',
      title: 'Plant Pathology & Leaf Diagnosis',
      desc: 'Upload a clear leaf image to detect crop diseases and get reliable diagnostic insights.'
    },
    dataset: {
      breadcrumb: 'Dataset Provenance',
      title: 'PlantVillage Dataset Explorer & Quality Audit',
      desc: 'Verified statistical breakdown of 54,305 foliar images across 14 crops, 38 pathology classes, class imbalance metrics, and academic defense documentation.'
    },
    analytics: {
      breadcrumb: 'Field Overview',
      title: 'Crop Health Telemetry & Intelligence',
      desc: 'Real-time statistical synthesis of plant pathology scans, infection severity distributions, and vulnerable crop varieties.'
    },
    library: {
      breadcrumb: 'Field Encyclopedia',
      title: 'Agricultural Pathology Library',
      desc: 'Clinical profiles, symptom descriptions, and verified intervention protocols for all 38 supported foliar conditions.'
    },
    history: {
      breadcrumb: 'Audit Archives',
      title: 'Inspection History & Field Records',
      desc: 'Complete historical logs of past plant scans, Grad-CAM overlays, and archived prescriptions.'
    },
    telemetry: {
      breadcrumb: 'System Architecture',
      title: 'Neural Network Specs & Hardware Telemetry',
      desc: 'Technical specifications of our multimodal EfficientNetB3 dual-stream model and REST API endpoints.'
    }
  };

  const currentMeta = pageHeadings[activeTab] || pageHeadings.scanner;

  // ROUTE 1: Landing Page (Default on "/")
  if (currentView === 'landing') {
    return (
      <LandingPage
        onStartDetection={() => navigateTo('/detect', 'scanner')}
        onExploreDataset={() => navigateTo('/dataset', 'dataset')}
      />
    );
  }

  // ROUTE 2: Existing Diagnostic Application (/detect, /dataset, /analytics, etc.)
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col md:flex-row relative selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Background Ambience & Textures */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 pointer-events-none z-0" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-ambient-blob-1 pointer-events-none z-0 opacity-40" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-ambient-blob-2 pointer-events-none z-0 opacity-30" />
      <div className="fixed inset-0 bg-radial-glow pointer-events-none z-0" />

      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        backendStatus={backendStatus}
        onNavigateHome={() => navigateTo('/')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        
        {/* Top App Header / Bar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-20 px-4 sm:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <button
                onClick={() => navigateTo('/')}
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <Home size={14} className="text-slate-500" />
                <span>Home</span>
              </button>
              <span className="text-slate-400">&gt;</span>
              <span className="text-slate-600">AgroVision</span>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#136a38] font-bold">{currentMeta.breadcrumb}</span>
            </div>
          </div>

          {/* Right Live Health Badge & Classes Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebf7ee] border border-[#d2ecda] text-xs font-semibold text-[#136a38]">
              <span className="w-2 h-2 rounded-full bg-[#16a34a]" />
              <span className="hidden sm:inline">EfficientNetB3 Online</span>
              <span className="sm:hidden">Online</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 shadow-2xs">
              <span>38 Classes</span>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-7">
          
          {/* Page Title & Description Header with Corner Foliage */}
          <div className="relative mb-6">
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-[#ebf7ee] border border-[#d2ecda] flex items-center justify-center text-[#16a34a] shrink-0 shadow-2xs">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <path d="M10 14c1.2-1.5 3-2 5-2 0 2-.5 3.8-2 5" />
                  <path d="M11 14.5L9 16.5" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] font-heading tracking-tight flex items-center gap-2 flex-wrap">
                  <span>Plant Pathology &</span>
                  <span className="text-[#15803d] relative inline-block whitespace-nowrap">
                    Leaf Diagnosis
                    <span className="absolute -bottom-1.5 left-0 w-full flex justify-center pointer-events-none select-none">
                      <img src="/images/swoosh.png" alt="" className="w-full h-auto min-h-[4px] max-h-[8px] object-contain" />
                    </span>
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                  {currentMeta.desc}
                </p>
              </div>
            </div>

            {/* Decorative Top-Right Corner Foliage Graphic */}
            <div className="absolute -top-6 -right-4 pointer-events-none select-none w-72 h-44 overflow-hidden z-0 hidden lg:block opacity-90">
              <img src="/images/top_right_foliage.png" alt="" className="w-full h-full object-contain object-top-right" />
            </div>
          </div>

          {/* Dynamic Module Rendering with Transitions */}
          <AnimatePresence mode="wait">
            {activeTab === 'scanner' && (
              <motion.div
                key="scanner-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DiseaseScanner
                  initialSymptoms={scannerPreset.symptoms}
                  initialCrop={scannerPreset.crop}
                />
              </motion.div>
            )}

            {activeTab === 'dataset' && (
              <motion.div
                key="dataset-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DatasetExplorer />
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                key="analytics-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <AnalyticsDashboard
                  onNavigateToScanner={() => handleTabChange('scanner')}
                />
              </motion.div>
            )}

            {activeTab === 'library' && (
              <motion.div
                key="library-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <PathologyLibrary
                  onTestInScanner={handleTestInScanner}
                />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ScanHistoryView />
              </motion.div>
            )}

            {activeTab === 'telemetry' && (
              <motion.div
                key="telemetry-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ModelTelemetry />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Cohesive Botanical Footer */}
        <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-8 mt-12 text-slate-500 text-xs shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Leaf size={13} />
              </div>
              <span className="font-bold text-slate-800">AgroVision AI</span>
              <span>— Professional Plant Disease Detection Platform</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <button onClick={() => navigateTo('/')} className="hover:text-emerald-700 font-semibold cursor-pointer">
                Return to Website
              </button>
              <span>•</span>
              <span>TensorFlow / EfficientNetB3</span>
              <span>•</span>
              <span>Grad-CAM Saliency</span>
              <span>•</span>
              <span>38 Pathologies Supported</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
