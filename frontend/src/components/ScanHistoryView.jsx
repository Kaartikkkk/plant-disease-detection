import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Search, ShieldCheck, AlertTriangle, Eye, Calendar,
  RefreshCw, MapPin, ExternalLink, X, FileText, CheckCircle2, Copy
} from 'lucide-react';
import { diseaseService, getMediaUrl } from '../services/diseaseService';

export const ScanHistoryView = ({ onSelectScan }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cropFilter, setCropFilter] = useState('All');
  const [selectedScan, setSelectedScan] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await diseaseService.getScanHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  const crops = ['All', ...new Set(history.map(s => s.crop_type).filter(Boolean))];

  const filtered = history.filter(item => {
    const matchesCrop = cropFilter === 'All' || item.crop_type === cropFilter;
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item.disease_name && item.disease_name.toLowerCase().includes(q)) ||
      (item.crop_type && item.crop_type.toLowerCase().includes(q)) ||
      (item.symptoms_text && item.symptoms_text.toLowerCase().includes(q)) ||
      (item.farm_id && item.farm_id.toLowerCase().includes(q));

    return matchesCrop && matchesSearch;
  });

  const handleCopyPrescription = (scan) => {
    const text = `Crop Health Diagnostic Report:
ID: ${scan.id}
Date: ${scan.scan_date || scan.created_at}
Crop: ${scan.crop_type || 'Unknown'}
Diagnosis: ${scan.disease_name}
Confidence: ${((scan.confidence || 0) * 100).toFixed(1)}%
Severity: ${scan.severity || 'Moderate'}
Fungicide: ${scan.treatment_json?.fungicide || 'N/A'}
Dosage: ${scan.treatment_json?.dosage || 'N/A'}
Action: ${scan.treatment_json?.immediate_action || 'N/A'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(scan.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Clock size={14} className="text-emerald-600" /> Field Diagnostic Archives
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
            Inspection History & Audit Logs
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Complete historical record of field scans, Grad-CAM activation overlays, confidence metrics, and agronomic prescriptions.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold self-start sm:self-auto transition-all shadow-xs cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-emerald-600' : ''} />
          <span>Refresh Log</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by disease, crop, symptoms, or plot ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-800 outline-none cursor-pointer"
          >
            {crops.map((c) => (
              <option key={c} value={c}>{c === 'All' ? 'All Crops' : c}</option>
            ))}
          </select>
          <span className="text-xs text-slate-500 whitespace-nowrap px-2">
            Total: <span className="font-bold text-slate-900">{filtered.length}</span>
          </span>
        </div>
      </div>

      {/* Scans List / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-500 gap-3">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs">Loading inspection logs...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-500 text-sm border border-slate-200">
          No past inspections found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((scan) => {
            const isHealthy = Boolean(scan.is_healthy);
            const conf = ((scan.confidence || 0) * 100).toFixed(1);
            const imageUrl = scan.image_filename ? getMediaUrl(`/uploads/${scan.image_filename}`) : null;
            const gradCamUrl = scan.grad_cam_url ? getMediaUrl(scan.grad_cam_url) : null;

            return (
              <div
                key={scan.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {scan.crop_type || 'General Crop'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isHealthy
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {isHealthy ? <ShieldCheck size={11} /> : <AlertTriangle size={11} />}
                      {isHealthy ? 'Healthy Foliage' : `${conf}% Confidence`}
                    </span>
                  </div>

                  {/* Leaf Image Thumbnail */}
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 mb-3 relative group/img border border-slate-200">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={scan.disease_name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No image archived
                      </div>
                    )}
                    {gradCamUrl && (
                      <span className="absolute bottom-1.5 right-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-700 text-white backdrop-blur-md shadow-xs">
                        Grad-CAM Ready
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-1 font-heading">
                    {scan.disease_name}
                  </h3>

                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                    <Calendar size={12} /> {scan.scan_date || scan.created_at || 'Recorded Scan'}
                    {scan.farm_id && (
                      <span className="ml-2 text-emerald-700 font-semibold flex items-center gap-0.5">
                        <MapPin size={11} /> {scan.farm_id}
                      </span>
                    )}
                  </p>

                  {scan.symptoms_text && (
                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mb-3 italic">
                      "{scan.symptoms_text}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedScan(scan)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-slate-200/60 cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>View Inspection</span>
                  </button>

                  <button
                    onClick={() => handleCopyPrescription(scan)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200/60 transition-all cursor-pointer"
                    title="Copy Rx Prescription"
                  >
                    {copiedId === scan.id ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for full scan detail */}
      <AnimatePresence>
        {selectedScan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-3xl rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto relative border border-slate-200 shadow-2xl"
            >
              <button
                onClick={() => setSelectedScan(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {selectedScan.crop_type || 'Crop'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  ID: {selectedScan.id?.slice(0, 8)}...
                </span>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 font-heading mb-4">
                {selectedScan.disease_name}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Original Foliage Photo
                  </span>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
                    {selectedScan.image_filename ? (
                      <img
                        src={getMediaUrl(`/uploads/${selectedScan.image_filename}`)}
                        alt="Original leaf"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    Grad-CAM Saliency Heatmap
                  </span>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-emerald-300 shadow-sm">
                    {selectedScan.grad_cam_url ? (
                      <img
                        src={getMediaUrl(selectedScan.grad_cam_url)}
                        alt="Grad-CAM"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                        Heatmap unavailable
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Treatment details */}
              {selectedScan.treatment_json && (
                <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-3 text-xs sm:text-sm">
                  <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-xs">
                    Archived Agronomic Prescription
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-500 text-xs">Recommended Chemical:</span>
                      <p className="font-bold text-slate-900">{selectedScan.treatment_json.fungicide || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-xs">Dosage & Frequency:</span>
                      <p className="font-bold text-slate-900">
                        {selectedScan.treatment_json.dosage || 'Standard'} ({selectedScan.treatment_json.frequency || 'N/A'})
                      </p>
                    </div>
                  </div>
                  {selectedScan.treatment_json.immediate_action && (
                    <div>
                      <span className="text-slate-500 text-xs">Immediate Field Intervention:</span>
                      <p className="text-slate-700 mt-0.5">{selectedScan.treatment_json.immediate_action}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScanHistoryView;
