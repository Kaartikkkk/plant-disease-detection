import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, Filter, ShieldCheck, AlertTriangle,
  Pill, Droplets, Calendar, Sparkles, ChevronRight, X, ArrowRight, ExternalLink
} from 'lucide-react';
import { diseaseService } from '../services/diseaseService';

export const PathologyLibrary = ({ onTestInScanner }) => {
  const [pathologies, setPathologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedPathology, setSelectedPathology] = useState(null);

  useEffect(() => {
    loadPathologies();
  }, []);

  const loadPathologies = async () => {
    setLoading(true);
    try {
      const data = await diseaseService.getPathologies();
      if (Array.isArray(data) && data.length > 0) {
        setPathologies(data);
      }
    } catch (err) {
      console.error('Failed to load pathology database:', err);
    } finally {
      setLoading(false);
    }
  };

  const crops = ['All', ...new Set(pathologies.map((p) => p.crop).filter(Boolean))].sort();

  const filtered = pathologies.filter((item) => {
    const matchesCrop = selectedCrop === 'All' || item.crop.toLowerCase() === selectedCrop.toLowerCase();
    const matchesSeverity =
      selectedSeverity === 'All' ||
      (selectedSeverity === 'Healthy' && item.is_healthy) ||
      (selectedSeverity === 'Severe' && (item.severity === 'Severe' || item.severity === 'High')) ||
      (selectedSeverity === 'Moderate' && item.severity === 'Moderate');

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.disease_name.toLowerCase().includes(q) ||
      item.crop.toLowerCase().includes(q) ||
      (item.symptoms && item.symptoms.toLowerCase().includes(q)) ||
      (item.fungicide && item.fungicide.toLowerCase().includes(q));

    return matchesCrop && matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-3xl relative z-10">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen size={14} className="text-emerald-600" />
            Agronomic Field Encyclopedia
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
            Comprehensive Pathology Library
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            Clinical profiles, symptom descriptions, and verified intervention protocols for all 38 foliar conditions detected by our multimodal neural network.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mt-6 pt-6 border-t border-slate-100 relative z-10">
          <div className="sm:col-span-6 relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search diseases, symptoms, crops, or fungicides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none cursor-pointer"
            >
              <option value="All">All Severities</option>
              <option value="Severe">High / Severe</option>
              <option value="Moderate">Moderate</option>
              <option value="Healthy">Healthy Clean Foliage</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center justify-end text-xs text-slate-500 font-semibold px-2">
            Showing <span className="text-emerald-700 font-bold mx-1">{filtered.length}</span> of {pathologies.length}
          </div>
        </div>

        {/* Crop Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-4 scrollbar-none relative z-10">
          {crops.map((crop) => (
            <button
              key={crop}
              onClick={() => setSelectedCrop(crop)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCrop === crop
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60'
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {/* Pathology Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-500 gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">Loading pathology encyclopedia...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 text-sm border border-slate-200">
          No pathologies match the current filters. Try resetting the search or crop filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isHealthy = item.is_healthy;
            const isSevere = item.severity === 'Severe' || item.severity === 'High';

            return (
              <motion.div
                key={item.id}
                layout
                whileHover={{ y: -3 }}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {item.crop}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isHealthy
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isSevere
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {isHealthy ? <ShieldCheck size={11} /> : <AlertTriangle size={11} />}
                      {item.severity}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2 font-heading">
                    {item.disease_name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {item.symptoms}
                  </p>

                  {/* Treatment Snippet */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 mb-4">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                      <Pill size={12} className="text-emerald-600" />
                      Recommended Protocol
                    </div>
                    <p className="text-slate-700 line-clamp-2 text-[11px]">
                      {item.fungicide || item.immediate_action}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedPathology(item)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold transition-all text-center cursor-pointer border border-slate-200/60"
                  >
                    View Protocol Details
                  </button>

                  <button
                    onClick={() => onTestInScanner && onTestInScanner(item)}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 border border-emerald-200 transition-all cursor-pointer shadow-xs"
                    title="Load symptoms in AI Scanner"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pathology Detail Modal */}
      <AnimatePresence>
        {selectedPathology && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative border border-slate-200 shadow-2xl"
            >
              <button
                onClick={() => setSelectedPathology(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {selectedPathology.crop}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {selectedPathology.severity} Severity
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 font-heading mb-4">
                {selectedPathology.disease_name}
              </h2>

              <div className="space-y-5 text-xs sm:text-sm">
                <div>
                  <h4 className="font-bold text-emerald-800 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-600" /> Foliar Clinical Symptoms
                  </h4>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {selectedPathology.symptoms}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                      Fungicide & Compound
                    </span>
                    <p className="font-bold text-slate-900">{selectedPathology.fungicide}</p>
                    <p className="text-xs text-slate-600 mt-1">Dosage: {selectedPathology.dosage}</p>
                    <p className="text-xs text-slate-600">Interval: {selectedPathology.frequency}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
                      Immediate Intervention
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {selectedPathology.immediate_action}
                    </p>
                  </div>
                </div>

                {selectedPathology.prevention && (
                  <div>
                    <h4 className="font-bold text-emerald-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-emerald-600" /> Cultural & Preventative Practices
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {(Array.isArray(selectedPathology.prevention)
                        ? selectedPathology.prevention
                        : [selectedPathology.prevention]
                      ).map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (onTestInScanner) onTestInScanner(selectedPathology);
                      setSelectedPathology(null);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <span>Load Into AI Scanner</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PathologyLibrary;
