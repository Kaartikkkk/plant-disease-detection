import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, ArrowRight, Sparkles, CheckCircle2, ChevronRight,
  UploadCloud, Cpu, FileCheck2, Sprout, Database, ShieldCheck,
  ChevronDown, ExternalLink, Menu, X, Layers, ArrowUpRight,
  HeartHandshake, BookOpen, AlertCircle, Zap, Play
} from 'lucide-react';

export const LandingPage = ({ onStartDetection, onExploreDataset }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const crops = [
    { name: 'Tomato', conditions: '10 Conditions', tag: 'Staple', color: 'bg-red-50 text-red-700 border-red-200' },
    { name: 'Corn (Maize)', conditions: '4 Conditions', tag: 'Grain', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { name: 'Apple', conditions: '4 Conditions', tag: 'Orchard', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { name: 'Grape', conditions: '4 Conditions', tag: 'Vineyard', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { name: 'Bell Pepper', conditions: '2 Conditions', tag: 'Vegetable', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { name: 'Potato', conditions: '3 Conditions', tag: 'Tuber', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
    { name: 'Strawberry', conditions: '2 Conditions', tag: 'Berry', color: 'bg-pink-50 text-pink-700 border-pink-200' },
    { name: 'Peach', conditions: '2 Conditions', tag: 'Stone Fruit', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { name: 'Cherry', conditions: '2 Conditions', tag: 'Fruit', color: 'bg-red-50 text-red-800 border-red-200' },
    { name: 'Blueberry', conditions: 'Healthy Control', tag: 'Berry', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Orange', conditions: 'Citrus Greening', tag: 'Citrus', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { name: 'Soybean', conditions: 'Healthy Control', tag: 'Legume', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { name: 'Squash', conditions: 'Powdery Mildew', tag: 'Cucurbit', color: 'bg-lime-50 text-lime-800 border-lime-200' },
    { name: 'Raspberry', conditions: 'Healthy Control', tag: 'Caneberry', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Upload Leaf Image',
      desc: 'Upload a clear photograph of the affected plant leaf from a smartphone, camera, or field drone.',
      icon: UploadCloud,
    },
    {
      num: '02',
      title: 'AI Neural Analysis',
      desc: 'Our dual-stream EfficientNet model extracts multi-scale visual features and cross-references 38 pathology patterns.',
      icon: Cpu,
    },
    {
      num: '03',
      title: 'Get Clinical Results',
      desc: 'Inspect the detected disease diagnosis, calibrated confidence, severity rating, and Grad-CAM attention heatmap.',
      icon: FileCheck2,
    },
    {
      num: '04',
      title: 'Take Action',
      desc: 'Follow practical treatment advice, safe fungicide dosage notes, and long-term cultural prevention guidance.',
      icon: Sprout,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDFEFA] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 antialiased overflow-x-hidden">
      
      {/* 1. SLIM CLEAN WHITE TOP NAVIGATION */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-xs'
            : 'bg-white/90 backdrop-blur-xs py-3.5 border-b border-slate-100/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-3">
            <a
              href="#hero"
              onClick={(e) => scrollToSection(e, 'hero')}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0f683a] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Leaf size={19} className="text-white fill-white/20" strokeWidth={2.2} />
              </div>
              <div className="flex flex-col text-left">
                <div className="text-base sm:text-lg font-bold tracking-tight leading-tight flex items-center">
                  <span className="text-[#133e26] font-extrabold font-heading">AgroVision</span>
                  <span className="text-[#16a34a] font-extrabold ml-1 font-heading">AI</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium tracking-normal leading-tight">
                  Plant Disease Detection
                </span>
              </div>
            </a>

            {/* Vertical Divider */}
            <div className="hidden lg:block h-6 w-px bg-slate-200 ml-3 mr-1" />
          </div>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-slate-600">
            <a
              href="#hero"
              onClick={(e) => scrollToSection(e, 'hero')}
              className="bg-[#ebf7ee] text-[#136a38] font-semibold px-4 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              Home
            </a>
            <a
              href="#about"
              onClick={(e) => scrollToSection(e, 'about')}
              className="hover:text-emerald-800 hover:bg-slate-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              About
            </a>
            <a
              href="#crops"
              onClick={(e) => scrollToSection(e, 'crops')}
              className="hover:text-emerald-800 hover:bg-slate-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              Supported Crops
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => scrollToSection(e, 'how-it-works')}
              className="hover:text-emerald-800 hover:bg-slate-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#dataset"
              onClick={(e) => scrollToSection(e, 'dataset')}
              className="hover:text-emerald-800 hover:bg-slate-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              Dataset
            </a>
          </div>

          {/* Right Action Button (Desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={onStartDetection}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0e6234] hover:bg-[#0a4d28] text-white font-medium text-xs sm:text-sm tracking-normal shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              <span>Start Detection</span>
              <span className="text-base font-normal leading-none">→</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/98 border-b border-slate-200 px-6 py-5 space-y-3 backdrop-blur-lg shadow-lg"
            >
              <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
                <a
                  href="#hero"
                  onClick={(e) => scrollToSection(e, 'hero')}
                  className="bg-[#ebf7ee] text-[#136a38] font-semibold px-3 py-2 rounded-lg"
                >
                  Home
                </a>
                <a
                  href="#about"
                  onClick={(e) => scrollToSection(e, 'about')}
                  className="hover:text-emerald-700 px-3 py-1.5"
                >
                  About
                </a>
                <a
                  href="#crops"
                  onClick={(e) => scrollToSection(e, 'crops')}
                  className="hover:text-emerald-700 px-3 py-1.5"
                >
                  Supported Crops
                </a>
                <a
                  href="#how-it-works"
                  onClick={(e) => scrollToSection(e, 'how-it-works')}
                  className="hover:text-emerald-700 px-3 py-1.5"
                >
                  How It Works
                </a>
                <a
                  href="#dataset"
                  onClick={(e) => scrollToSection(e, 'dataset')}
                  className="hover:text-emerald-700 px-3 py-1.5"
                >
                  Dataset
                </a>
              </div>
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onStartDetection();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#0e6234] text-white font-medium text-sm shadow-sm"
                >
                  <span>Start Detection</span>
                  <span>→</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. HERO SECTION — CLEAN WHITE BOTANICAL DESIGN */}
      <section
        id="hero"
        className="relative min-h-[580px] lg:h-screen max-h-[760px] flex flex-col justify-between pt-16 sm:pt-20 pb-0 bg-white overflow-hidden"
      >
        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-7 sm:pt-9">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl space-y-3.5 sm:space-y-4 text-left"
          >
            {/* Eyebrow Label with Green Accent Bar */}
            <div className="inline-flex items-center gap-2.5 mb-1">
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase text-slate-800 font-mono">
                AI FOR HEALTHIER CROPS
              </span>
              <span className="w-9 h-[2.5px] bg-[#16a34a] rounded-full inline-block align-middle" />
            </div>

            {/* Main Bold Editorial Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-[#0f172a] tracking-tight leading-[1.12] font-heading">
              Detect Plant Diseases<br />
              Early,{' '}
              <span className="text-[#15803d] italic font-serif font-bold relative inline-block whitespace-nowrap">
                Protect Your Crops
                <span className="absolute -bottom-2 sm:-bottom-2.5 right-1 w-[55%] flex justify-end pointer-events-none select-none">
                  <svg viewBox="0 0 250 14" fill="none" className="w-full h-auto text-[#16a34a]" preserveAspectRatio="none">
                    <path d="M 4 8 C 65 14, 185 14, 246 6 C 185 11, 70 11, 4 8 Z" fill="currentColor" />
                  </svg>
                </span>
              </span>
            </h1>

            {/* Clear Supporting Description */}
            <p className="text-slate-600 text-sm sm:text-base lg:text-[17px] leading-relaxed max-w-lg pt-1">
              An AI-powered platform to identify plant diseases from leaf images and support timely, data-driven crop care.
            </p>

            {/* Call To Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                onClick={onStartDetection}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-[#0e6234] hover:bg-[#0a4d28] text-white font-medium text-sm tracking-wide shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>Start Detection</span>
                <span className="text-base font-normal leading-none">→</span>
              </button>

              <a
                href="#how-it-works"
                onClick={(e) => scrollToSection(e, 'how-it-works')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-full bg-white hover:bg-slate-50 text-slate-900 font-medium text-sm border border-slate-800 transition-all cursor-pointer shadow-xs"
              >
                <Play size={13} className="fill-transparent stroke-[2.2] text-slate-900" />
                <span>Learn How It Works</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* Panoramic Farm Field Landscape Background across bottom of hero */}
        <div className="absolute inset-x-0 bottom-16 sm:bottom-20 pointer-events-none select-none z-0 overflow-hidden h-44 sm:h-52 md:h-56 lg:h-64">
          <img
            src="/images/dashboard_hero_bg.png"
            alt="Agricultural field panorama with lush crops and morning sun"
            className="w-full h-full object-cover object-bottom"
          />
        </div>

        {/* 3. THREE FEATURE CARDS BOTTOM BAR */}
        <div className="relative z-10 w-full bg-white border-t border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 gap-3 md:gap-0">
              
              {/* Card 1: Fast & Accurate */}
              <div className="flex items-center gap-4 py-1.5 md:py-0 px-2 sm:px-6 text-left">
                <div className="w-11 h-11 rounded-2xl bg-[#ebf7ee] text-[#16a34a] flex items-center justify-center shrink-0 border border-[#d3eed9]/60 shadow-xs">
                  <Zap size={22} className="stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">Fast & Accurate</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    Instant disease identification from leaf images
                  </p>
                </div>
              </div>

              {/* Card 2: Multiple Crops */}
              <div className="flex items-center gap-4 py-1.5 md:py-0 px-2 sm:px-6 text-left">
                <div className="w-11 h-11 rounded-2xl bg-[#ebf7ee] text-[#16a34a] flex items-center justify-center shrink-0 border border-[#d3eed9]/60 shadow-xs">
                  <Sprout size={22} className="stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">Multiple Crops</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    Supports major agricultural crops
                  </p>
                </div>
              </div>

              {/* Card 3: Data-Driven */}
              <div className="flex items-center gap-4 py-1.5 md:py-0 px-2 sm:px-6 text-left">
                <div className="w-11 h-11 rounded-2xl bg-[#ebf7ee] text-[#16a34a] flex items-center justify-center shrink-0 border border-[#d3eed9]/60 shadow-xs">
                  <Layers size={22} className="stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">Data-Driven</h3>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    Built on a curated, research-backed dataset
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT SECTION — TWO COLUMN NATURE & AI */}
      <section id="about" className="py-24 sm:py-32 bg-[#F8FAF7] border-y border-emerald-950/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Mission & 3 Benefit Statements */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div>
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-800 font-mono">
                  About AgroVision AI
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-slate-900 mt-2 tracking-tight leading-tight">
                  Bringing AI to Every Farmer's Field
                </h2>
                <p className="text-base sm:text-lg text-slate-600 mt-4 leading-relaxed">
                  AgroVision AI uses deep learning to analyze plant leaf images and provide understandable disease information, helping users make informed decisions about crop health.
                </p>
              </div>

              {/* 3 Benefit Statements with Icons */}
              <div className="space-y-5 pt-2">
                
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Cpu size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      AI-Based Predictions
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Our dual-stream convolutional architecture analyzes microscopic foliar lesion margins, necrotic spots, and chlorosis patterns with verified empirical accuracy.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Sprout size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Practical Guidance
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Beyond simple labels, receive practical agricultural steps: recommended protective fungicides, immediate quarantine actions, and moisture control guidelines.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <HeartHandshake size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Designed for Real-World Crops
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                      Covers 14 essential food crops including tomato, potato, corn, and grape, ensuring relevance for both smallholder kitchen farms and commercial fields.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Agronomic Intelligence & Architecture Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-lg rounded-3xl bg-white border border-emerald-100 p-7 sm:p-8 shadow-xl relative overflow-hidden text-left space-y-6">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-full blur-3xl pointer-events-none -z-0" />
                
                <div className="relative z-10 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <Leaf size={16} className="text-emerald-600" />
                    <span>Agronomic Intelligence</span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    EfficientNetB3
                  </span>
                </div>

                {/* 4 Metric Stats Grid */}
                <div className="relative z-10 grid grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-slate-200/80">
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Benchmark Dataset</span>
                    <div className="text-2xl font-black text-slate-900 mt-1 font-heading">54,305</div>
                    <span className="text-[11px] text-slate-500">Verified foliar images</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-slate-200/80">
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Pathology Classes</span>
                    <div className="text-2xl font-black text-emerald-700 mt-1 font-heading">38 Classes</div>
                    <span className="text-[11px] text-slate-500">Diseased & healthy states</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-slate-200/80">
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Validation Accuracy</span>
                    <div className="text-2xl font-black text-slate-900 mt-1 font-heading">81.4%</div>
                    <span className="text-[11px] text-slate-500">Multimodal test accuracy</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8FAF7] border border-slate-200/80">
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Supported Crops</span>
                    <div className="text-2xl font-black text-emerald-700 mt-1 font-heading">14 Crops</div>
                    <span className="text-[11px] text-slate-500">Major agricultural species</span>
                  </div>
                </div>

                {/* Architecture Highlights */}
                <div className="relative z-10 p-4 rounded-2xl bg-emerald-950 text-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <Cpu size={14} />
                    <span>Multimodal Architecture Highlights</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Combines high-resolution 300×300 CNN visual feature extraction with BiLSTM semantic symptom processing and Grad-CAM visual heatmaps.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. SUPPORTED CROPS SECTION */}
      <section id="crops" className="py-24 sm:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-800 font-mono">
              Model Coverage
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-slate-900 mt-2 tracking-tight">
              Crops We Support
            </h2>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              Explore the crops covered by our disease detection model. Trained on authentic benchmark specimens with supervised botanical labeling.
            </p>
          </div>

          {/* Clean Botanical Responsive Crop Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {crops.map((crop, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group rounded-2xl bg-[#F8FAF7] border border-slate-200/90 p-4 shadow-xs hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between text-left cursor-pointer"
                onClick={onStartDetection}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-emerald-700 shadow-2xs group-hover:scale-105 group-hover:bg-emerald-50 transition-all">
                      <Sprout size={20} className="stroke-[2.2]" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${crop.color}`}>
                      {crop.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-700 transition-colors">
                    {crop.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    {crop.conditions}
                  </p>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>Diagnose</span>
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action Link to Explore Full Dataset */}
          <div className="mt-12 text-center">
            <button
              onClick={onExploreDataset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs sm:text-sm border border-emerald-200 transition-all shadow-xs cursor-pointer"
            >
              <Database size={15} />
              <span>Explore All 38 Pathologies in Dataset Explorer</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION — 4-STEP WORKFLOW */}
      <section id="how-it-works" className="py-24 sm:py-32 bg-[#F8FAF7] border-y border-emerald-950/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-800 font-mono">
              Operational Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-slate-900 mt-2 tracking-tight">
              From Leaf Image to Actionable Insights
            </h2>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              A transparent, end-to-end diagnostic pipeline providing swift pathological identification and verifiable mitigation advice.
            </p>
          </div>

          {/* 4-Step Horizontal / Stacked Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {steps.map((st, idx) => {
              const IconComp = st.icon;
              return (
                <div
                  key={idx}
                  className="relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between text-left group"
                >
                  {/* Step Number & Icon */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-2xl font-serif font-bold text-emerald-700/60 font-mono">
                        {st.num}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <IconComp size={20} />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {st.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                    <span>Step verified</span>
                    <CheckCircle2 size={12} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA within How It Works */}
          <div className="mt-14 text-center">
            <button
              onClick={onStartDetection}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span>Test the Diagnostic Pipeline Now</span>
              <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* 6. DATASET SECTION — DARK FOREST GREEN BOTANICAL BACKDROP */}
      <section id="dataset" className="py-24 sm:py-32 bg-[#04241B] text-white relative overflow-hidden">
        
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Heading & Provenance Narrative */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
                <Database size={13} />
                <span>OUR DATASET</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-white tracking-tight leading-tight">
                A Diverse and Relevant Plant Image Dataset
              </h2>

              <p className="text-base text-slate-300 leading-relaxed">
                Our dataset provides labelled plant images for training and evaluating the disease detection model. Sourced from the globally validated PlantVillage corpus, curated by Pennsylvania State University and EPFL.
              </p>

              <div className="space-y-3 pt-2 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Standard 80% / 10% / 10% stratified train, validation, and holdout splits</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Verified 0 corruption count across all 5,431 test evaluation specimens</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>Published in Frontiers in Plant Science (Hughes & Salathé, 2015/2016)</span>
                </div>
              </div>

              {/* Action Button: Opens the actual Dataset Explorer component */}
              <div className="pt-4">
                <button
                  onClick={onExploreDataset}
                  className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-xl shadow-emerald-400/20 hover:-translate-y-0.5 cursor-pointer"
                >
                  <Database size={16} />
                  <span>Explore Dataset (Interactive Audit)</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Column: 4 Real Project Statistics Cards */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[11px] font-mono uppercase text-emerald-400 tracking-wider block">
                  Total Corpus Size
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-heading">
                  54,305
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  100% verified foliar images
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[11px] font-mono uppercase text-emerald-400 tracking-wider block">
                  Crops Covered
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-heading">
                  14
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Fruits, vegetables & staple grains
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[11px] font-mono uppercase text-emerald-400 tracking-wider block">
                  Conditions
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-heading">
                  38 Classes
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  26 pathologies + 12 healthy controls
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[11px] font-mono uppercase text-emerald-400 tracking-wider block">
                  Stratified Partition
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-1 font-heading">
                  80 / 10 / 10
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  43.4k Train • 5.4k Val • 5.4k Test
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 7. FINAL CALL-TO-ACTION SECTION — BOTANICAL GRADIENT HERO */}
      <section className="relative py-28 sm:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden text-center bg-gradient-to-br from-[#063321] via-[#04281a] to-[#01140d] border-t border-emerald-900/40">
        
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none z-0" />

        {/* Content Box */}
        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sprout size={14} />
            <span>Protect Your Harvest</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-white tracking-tight leading-tight">
            Check Your Plant's Health Today
          </h2>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Upload a leaf image and explore AI-assisted disease identification and practical crop-care guidance.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartDetection}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base tracking-wide transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto"
            >
              <span>Start Disease Detection</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onExploreDataset}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-md border border-white/20 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Database size={16} />
              <span>Explore Dataset & Provenance</span>
            </button>
          </div>
        </div>
      </section>

      {/* 8. MINIMAL DARK-GREEN FOOTER */}
      <footer className="bg-[#031C15] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center justify-between">
          
          {/* Logo & Description */}
          <div className="md:col-span-6 space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Leaf size={16} />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                AgroVision AI
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              AgroVision AI is an open academic agritech platform bridging deep learning computer vision and everyday farm management.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-6 flex flex-wrap items-center justify-start md:justify-end gap-6 text-xs font-medium text-slate-300">
            <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} className="hover:text-emerald-400 transition-colors">
              Home
            </a>
            <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="hover:text-emerald-400 transition-colors">
              About
            </a>
            <a href="#crops" onClick={(e) => scrollToSection(e, 'crops')} className="hover:text-emerald-400 transition-colors">
              Supported Crops
            </a>
            <a href="#how-it-works" onClick={(e) => scrollToSection(e, 'how-it-works')} className="hover:text-emerald-400 transition-colors">
              How It Works
            </a>
            <button onClick={onExploreDataset} className="hover:text-emerald-400 transition-colors cursor-pointer">
              Dataset
            </button>
            <button onClick={onStartDetection} className="text-emerald-400 font-bold hover:underline cursor-pointer">
              Disease Detection
            </button>
          </div>

          {/* Bottom Copyright & Tech Attribution */}
          <div className="md:col-span-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              © 2026 AgroVision AI. All rights reserved.
            </div>
            <div className="flex items-center gap-3">
              <span>TensorFlow 2.15</span>
              <span>•</span>
              <span>EfficientNetB3</span>
              <span>•</span>
              <span>Grad-CAM Explainability</span>
              <span>•</span>
              <span>PlantVillage Benchmark</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
