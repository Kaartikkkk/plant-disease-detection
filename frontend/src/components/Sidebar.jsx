import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Home, BarChart3, BookOpen, Clock,
  Cpu, ChevronLeft, ChevronRight, Menu, X, Database
} from 'lucide-react';

const ScanLeafIcon = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <path d="M10 14c1.2-1.5 3-2 5-2 0 2-.5 3.8-2 5" />
    <path d="M11 14.5L9 16.5" />
  </svg>
);

export const Sidebar = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
  backendStatus,
  onNavigateHome
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, isHome: true },
    { id: 'scanner', label: 'Plant Diagnosis', icon: ScanLeafIcon },
    { id: 'dataset', label: 'Dataset Explorer', icon: Database },
    { id: 'analytics', label: 'Field Dashboard', icon: BarChart3 },
    { id: 'library', label: 'Disease Library', icon: BookOpen },
    { id: 'history', label: 'Inspection History', icon: Clock },
    { id: 'telemetry', label: 'Neural Telemetry', icon: Cpu },
  ];

  const isOnline = backendStatus === 'online';

  const NavContent = () => (
    <div className="flex flex-col h-full justify-between relative overflow-hidden">
      <div className="relative z-10">
        {/* Brand Logo & Header */}
        <div className={`p-5 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-slate-100`}>
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => { if (onNavigateHome) onNavigateHome(); else setActiveTab('scanner'); setMobileOpen(false); }}
            title="Return to AgroVision Home"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#0f683a] flex items-center justify-center text-white shadow-xs shrink-0">
              <Leaf size={20} className="text-white fill-white/20" strokeWidth={2.2} />
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <span className="font-extrabold text-base text-[#133e26] tracking-tight font-heading block truncate">
                  AgroVision<span className="text-[#16a34a]">AI</span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium block truncate">
                  Crop Health Platform
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3.5 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.isHome && activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isHome) {
                    if (onNavigateHome) onNavigateHome();
                  } else {
                    setActiveTab(item.id);
                  }
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#ebf7ee] text-[#136a38] font-bold border border-[#d2ecda]/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={18} className={`shrink-0 ${isActive ? 'text-[#16a34a]' : 'text-slate-500'}`} />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Subtle Bottom Field Panorama Graphic in Sidebar */}
      <div className="absolute inset-x-0 bottom-0 pointer-events-none select-none overflow-hidden h-36 z-0 opacity-70">
        <img
          src="/images/sidebar_bottom_bg.png"
          alt=""
          className="w-full h-full object-cover object-bottom"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r border-slate-200 h-screen sticky top-0 z-30 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <NavContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 bg-white h-full z-10 shadow-2xl flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800"
              >
                <X size={18} />
              </button>
              <NavContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
