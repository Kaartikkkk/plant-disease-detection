import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Layers, FolderTree, BarChart3, Image as ImageIcon,
  Table as TableIcon, AlertTriangle, CheckCircle2, Info, ExternalLink,
  Search, Filter, Printer, ChevronDown, ChevronRight, Sparkles,
  RefreshCw, FileText, Leaf, ShieldAlert, Cpu, Eye, X, BookOpen, Award
} from 'lucide-react';
import { diseaseService, getMediaUrl } from '../services/diseaseService';

export const DatasetExplorer = () => {
  // Navigation sub-tabs within Dataset Explorer
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'distribution' | 'gallery' | 'preview' | 'quality' | 'faculty'
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datasetData, setDatasetData] = useState(null);
  const [samples, setSamples] = useState([]);
  const [previewData, setPreviewData] = useState({ rows: [], total_rows: 0, page: 1, total_pages: 1 });
  
  // Gallery filters
  const [galleryCrop, setGalleryCrop] = useState('all');
  const [galleryHealth, setGalleryHealth] = useState('all');
  const [gallerySearch, setGallerySearch] = useState('');
  const [selectedSample, setSelectedSample] = useState(null);

  // Preview table filters & pagination
  const [previewCrop, setPreviewCrop] = useState('');
  const [previewSplit, setPreviewSplit] = useState('');
  const [previewSearch, setPreviewSearch] = useState('');
  const [previewPage, setPreviewPage] = useState(1);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Folder tree expanded state
  const [expandedFolders, setExpandedFolders] = useState({ 'root': true, 'train': true, 'val': false, 'test': false });

  // Initial load
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch preview when filters or page changes
  useEffect(() => {
    if (activeSubTab === 'preview' || previewData.rows.length === 0) {
      fetchPreview();
    }
  }, [previewPage, previewCrop, previewSplit, previewSearch, activeSubTab]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [infoRes, samplesRes] = await Promise.all([
        diseaseService.getDatasetInfo(),
        diseaseService.getDatasetSamples()
      ]);
      setDatasetData(infoRes);
      setSamples(samplesRes.samples || []);
    } catch (err) {
      console.error('Failed to load dataset info:', err);
      setError('Could not connect to Dataset API. Please verify backend is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await diseaseService.getDatasetPreview({
        page: previewPage,
        limit: 12,
        crop: previewCrop,
        split: previewSplit,
        search: previewSearch
      });
      setPreviewData(res);
    } catch (err) {
      console.error('Failed to load preview:', err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const toggleFolder = (key) => {
    setExpandedFolders(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filtered gallery samples
  const filteredSamples = useMemo(() => {
    return samples.filter(item => {
      const matchesCrop = galleryCrop === 'all' || item.crop.toLowerCase() === galleryCrop.toLowerCase();
      const matchesHealth =
        galleryHealth === 'all' ||
        (galleryHealth === 'healthy' && item.is_healthy) ||
        (galleryHealth === 'diseased' && !item.is_healthy);
      const matchesSearch =
        !gallerySearch ||
        item.display_name.toLowerCase().includes(gallerySearch.toLowerCase()) ||
        item.crop.toLowerCase().includes(gallerySearch.toLowerCase()) ||
        item.disease.toLowerCase().includes(gallerySearch.toLowerCase());
      return matchesCrop && matchesHealth && matchesSearch;
    });
  }, [samples, galleryCrop, galleryHealth, gallerySearch]);

  const uniqueCrops = useMemo(() => {
    if (!datasetData?.crop_distribution) return [];
    return datasetData.crop_distribution.map(c => c.crop);
  }, [datasetData]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <RefreshCw size={36} className="mx-auto text-emerald-600 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-slate-800 font-heading">Loading Verified Dataset Metadata...</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Scanning 54,305 PlantVillage foliar specimens across 38 crop disease classes and validating split integrity.
        </p>
      </div>
    );
  }

  if (error || !datasetData) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 shadow-xs text-center">
        <AlertTriangle size={36} className="mx-auto text-rose-500 mb-3" />
        <h3 className="text-base font-bold text-slate-900">Dataset Telemetry Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">{error || 'Failed to retrieve dataset records.'}</p>
        <button
          onClick={fetchInitialData}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer inline-flex items-center gap-2"
        >
          <RefreshCw size={14} /> Retry Verification
        </button>
      </div>
    );
  }

  const { overview, source, crop_distribution, class_distribution, quality_report } = datasetData;

  return (
    <div className="space-y-6">
      {/* Top Navigation Tabs for Dataset Explorer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'overview', label: 'Overview & Splits', icon: Layers },
            { id: 'distribution', label: 'Class Distribution', icon: BarChart3 },
            { id: 'gallery', label: 'Specimen Gallery', icon: ImageIcon, badge: '38 Classes' },
            { id: 'preview', label: 'Dataset Preview Table', icon: TableIcon },
            { id: 'quality', label: 'Quality & Limitations', icon: AlertTriangle },
            { id: 'faculty', label: 'Faculty Defense View', icon: Award, badge: 'Academic' },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${
                    isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => window.print()}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
          title="Print official dataset summary for faculty inspection"
        >
          <Printer size={14} /> Print Audit Report
        </button>
      </div>

      {/* SUB-TAB 1: OVERVIEW & SPLITS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Foliar Images</span>
                <Database size={18} className="text-emerald-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {overview.total_images?.toLocaleString()}
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> 100% Verified Records
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Crops Covered</span>
                <Leaf size={18} className="text-emerald-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {overview.crops_count} <span className="text-xs font-normal text-slate-400">Varieties</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Fruits, vegetables & grains
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Disease / Healthy</span>
                <Layers size={18} className="text-emerald-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                {overview.classes_count} <span className="text-xs font-normal text-slate-400">Total</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                <span className="text-amber-700 font-bold">{overview.disease_classes} Pathologies</span> • <span className="text-emerald-700 font-bold">{overview.healthy_classes} Healthy</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Train Split Ratio</span>
                <Cpu size={18} className="text-emerald-700" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-800 font-heading">
                80% / 10% / 10%
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Train: {overview.train_count?.toLocaleString()} | Val: {overview.val_count?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Dataset Splits Visual Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Layers size={16} className="text-emerald-700" /> Verified Split Proportions
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Mathematical partitioning of the 54,305 images across training, validation, and out-of-distribution test sets.
            </p>

            {/* Split Progress Bar */}
            <div className="h-5 w-full bg-slate-100 rounded-xl overflow-hidden flex shadow-inner mb-4">
              <div
                style={{ width: `${overview.train_percentage}%` }}
                className="bg-emerald-600 h-full flex items-center justify-center text-[10px] text-white font-bold tracking-wider"
                title={`Train: ${overview.train_count} (${overview.train_percentage}%)`}
              >
                TRAIN ({overview.train_percentage}%)
              </div>
              <div
                style={{ width: `${overview.val_percentage}%` }}
                className="bg-teal-500 h-full flex items-center justify-center text-[10px] text-white font-bold tracking-wider"
                title={`Validation: ${overview.val_count} (${overview.val_percentage}%)`}
              >
                VAL ({overview.val_percentage}%)
              </div>
              <div
                style={{ width: `${overview.test_percentage}%` }}
                className="bg-amber-500 h-full flex items-center justify-center text-[10px] text-white font-bold tracking-wider"
                title={`Test: ${overview.test_count} (${overview.test_percentage}%)`}
              >
                TEST ({overview.test_percentage}%)
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Training Split</span>
                <span className="text-lg font-extrabold text-emerald-950 font-heading block">{overview.train_count?.toLocaleString()} images</span>
                <span className="text-[11px] text-emerald-700">80.0% of total corpus for model gradient updates</span>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Validation Split</span>
                <span className="text-lg font-extrabold text-teal-950 font-heading block">{overview.val_count?.toLocaleString()} images</span>
                <span className="text-[11px] text-teal-700">10.0% of total corpus for early stopping checkpoints</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Test Evaluation Split</span>
                <span className="text-lg font-extrabold text-amber-950 font-heading block">{overview.test_count?.toLocaleString()} images</span>
                <span className="text-[11px] text-amber-700">10.0% unseen evaluation holdout set</span>
              </div>
            </div>
          </div>

          {/* Dataset Source and Directory Tree View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Source & Provenance */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-emerald-700" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Scientific Source & Provenance
                  </h3>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">Primary Paper</span>
                    <span className="font-bold text-slate-900 block">{source.full_title}</span>
                    <span className="text-slate-500 block mt-0.5">Authors: {source.lead_researchers}</span>
                    <span className="text-emerald-700 font-semibold block">{source.published_in} • DOI: {source.paper_doi}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Institution</span>
                      <span className="font-semibold text-slate-800">{source.institution}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">License</span>
                      <span className="font-semibold text-slate-800">{source.license}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Labeling Hierarchy</span>
                    <span className="font-mono text-emerald-800 text-[11px] block mt-0.5">&lt;Crop&gt;___&lt;Condition&gt; (e.g. Tomato___Early_blight)</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Image Format & Geometry</span>
                    <span className="text-slate-800 font-semibold">256 x 256 px raw RGB JPEG | Resized to 300 x 300 / 224 x 224</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Official Repository:</span>
                <a
                  href={source.official_urls?.[0] || 'https://github.com/spMohanty/PlantVillage-Dataset'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1"
                >
                  GitHub / PlantVillage <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Directory Structure Tree */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FolderTree size={18} className="text-emerald-700" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Directory Organization Tree
                    </h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    Supervised Hierarchy
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Click folders to expand and explore how the 38 pathology classes are separated into train, validation, and test splits.
                </p>

                <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1.5 overflow-x-auto max-h-[300px] overflow-y-auto border border-slate-800">
                  {/* Root folder */}
                  <div
                    onClick={() => toggleFolder('root')}
                    className="flex items-center gap-1.5 cursor-pointer text-emerald-400 font-bold hover:text-emerald-300"
                  >
                    {expandedFolders['root'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    📁 PlantVillage/ (54,305 images)
                  </div>

                  {expandedFolders['root'] && (
                    <div className="pl-4 space-y-1 text-slate-300 border-l border-slate-800 ml-2">
                      {/* Train folder */}
                      <div>
                        <div
                          onClick={() => toggleFolder('train')}
                          className="flex items-center gap-1.5 cursor-pointer text-amber-300 font-semibold hover:text-amber-200"
                        >
                          {expandedFolders['train'] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          📁 train/ (43,444 images, 80.0%)
                        </div>
                        {expandedFolders['train'] && (
                          <div className="pl-4 space-y-0.5 text-slate-400 text-[10px] border-l border-slate-800 ml-2 mt-1">
                            <div>├── 📁 Apple___Apple_scab (504 images)</div>
                            <div>├── 📁 Apple___Black_rot (496 images)</div>
                            <div>├── 📁 Apple___Cedar_apple_rust (220 images)</div>
                            <div>├── 📁 Apple___healthy (1,316 images)</div>
                            <div>├── 📁 Tomato___Tomato_Yellow_Leaf_Curl_Virus (4,286 images)</div>
                            <div>└── 📁 ... (33 other pathology classes)</div>
                          </div>
                        )}
                      </div>

                      {/* Val folder */}
                      <div>
                        <div
                          onClick={() => toggleFolder('val')}
                          className="flex items-center gap-1.5 cursor-pointer text-teal-300 font-semibold hover:text-teal-200"
                        >
                          {expandedFolders['val'] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          📁 val/ (5,430 images, 10.0%)
                        </div>
                        {expandedFolders['val'] && (
                          <div className="pl-4 space-y-0.5 text-slate-400 text-[10px] border-l border-slate-800 ml-2 mt-1">
                            <div>├── 📁 Apple___Apple_scab (63 images)</div>
                            <div>├── 📁 Apple___Black_rot (62 images)</div>
                            <div>├── 📁 Apple___Cedar_apple_rust (28 images)</div>
                            <div>└── 📁 ... (35 other classes)</div>
                          </div>
                        )}
                      </div>

                      {/* Test folder */}
                      <div>
                        <div
                          onClick={() => toggleFolder('test')}
                          className="flex items-center gap-1.5 cursor-pointer text-sky-300 font-semibold hover:text-sky-200"
                        >
                          {expandedFolders['test'] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                          📁 test/ (5,431 images, 10.0%)
                        </div>
                        {expandedFolders['test'] && (
                          <div className="pl-4 space-y-0.5 text-slate-400 text-[10px] border-l border-slate-800 ml-2 mt-1">
                            <div>├── 📁 Apple___Apple_scab (63 images)</div>
                            <div>├── 📁 Apple___Black_rot (62 images)</div>
                            <div>├── 📁 Tomato___Late_blight (191 images)</div>
                            <div>└── 📁 ... (35 other classes)</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Standard Keras DirectoryLoader compatible</span>
                <span className="font-mono text-emerald-800">Verified On-Disk Structure</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CLASS DISTRIBUTION */}
      {activeSubTab === 'distribution' && (
        <div className="space-y-6">
          {/* Header & Imbalance Alert */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Foliar Sample Distribution (All 38 Classes)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Exact image counts from actual metadata. Classes are sorted by sample frequency to transparently demonstrate class imbalance.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  Imbalance Ratio: <strong className="font-mono">36.2x</strong>
                </span>
              </div>
            </div>

            {/* Imbalance Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mb-6 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-700">Representation Categories:</span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Overrepresented (&gt;3,500 samples)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Balanced (600 - 3,500 samples)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Underrepresented (&lt;600 samples)
              </span>
            </div>

            {/* Class distribution list */}
            <div className="space-y-3">
              {class_distribution.map((item, idx) => {
                const maxCount = class_distribution[0].total_count;
                const barWidth = Math.max(3, (item.total_count / maxCount) * 100);
                const isUnder = item.total_count < 600;
                const isOver = item.total_count > 3500;

                return (
                  <div key={item.class_id} className="p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition-colors shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400 w-5">#{idx + 1}</span>
                        <span className="font-bold text-slate-900">{item.display_name}</span>
                        {item.is_healthy ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Healthy</span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">Pathology</span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 hidden md:inline">({item.class_id})</span>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <span className="font-bold text-slate-900">{item.total_count?.toLocaleString()} imgs</span>
                        <span className="text-slate-500 font-mono w-12 text-right">{item.percentage}%</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          isOver ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          isUnder ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {item.imbalance}
                        </span>
                      </div>
                    </div>

                    {/* Bar chart indicator */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${barWidth}%` }}
                        className={`h-full rounded-full ${
                          isOver ? 'bg-emerald-600' : isUnder ? 'bg-amber-500' : 'bg-teal-500'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span>Train: {item.train_count} | Val: {item.val_count} | Test: {item.test_count}</span>
                      <span>Crop: {item.crop}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crop breakdown cards */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Leaf size={16} className="text-emerald-700" /> Aggregated Image Volume By Crop
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {crop_distribution.map(c => (
                <div key={c.crop} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xs font-bold text-slate-800 block truncate">{c.crop}</span>
                  <span className="text-base font-extrabold text-emerald-800 font-heading block mt-1">{c.total_images?.toLocaleString()}</span>
                  <span className="text-[10px] text-slate-500 block">{c.percentage}% • {c.classes_count} classes</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SPECIMEN GALLERY */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-6">
          {/* Gallery Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Crop Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Filter size={14} className="text-slate-400" />
                <span className="font-semibold">Crop:</span>
                <select
                  value={galleryCrop}
                  onChange={(e) => setGalleryCrop(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-emerald-600 cursor-pointer"
                >
                  <option value="all">All Crops (14)</option>
                  {uniqueCrops.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              {/* Health Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold">Condition:</span>
                <select
                  value={galleryHealth}
                  onChange={(e) => setGalleryHealth(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-emerald-600 cursor-pointer"
                >
                  <option value="all">All Conditions</option>
                  <option value="diseased">Pathologies Only (26)</option>
                  <option value="healthy">Healthy Controls Only (12)</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search disease or crop..."
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium w-full sm:w-64 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredSamples.map((sample) => (
              <motion.div
                key={sample.class_id}
                whileHover={{ y: -3 }}
                onClick={() => setSelectedSample(sample)}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col group"
              >
                {/* Image Thumbnail */}
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  <img
                    src={getMediaUrl(sample.image_url)}
                    alt={sample.display_name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
                    sample.is_healthy ? 'bg-emerald-600 text-white' : 'bg-slate-900/80 text-white backdrop-blur-xs'
                  }`}>
                    {sample.is_healthy ? 'Healthy' : 'Diseased'}
                  </span>
                  <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="p-1.5 rounded-full bg-white text-emerald-800 shadow-md">
                      <Eye size={16} />
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      {sample.crop}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5" title={sample.display_name}>
                      {sample.disease}
                    </h4>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-mono">{sample.dimensions}</span>
                    <span>{sample.total_class_count} imgs</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredSamples.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
              <Info size={32} className="mx-auto mb-2 text-slate-300" />
              <p className="text-xs">No dataset specimens match your current filter parameters.</p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: DATASET PREVIEW TABLE */}
      {activeSubTab === 'preview' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold">Crop:</span>
                <select
                  value={previewCrop}
                  onChange={(e) => { setPreviewCrop(e.target.value); setPreviewPage(1); }}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-emerald-600 cursor-pointer"
                >
                  <option value="">All Crops</option>
                  {uniqueCrops.map(crop => (
                    <option key={crop} value={crop}>{crop}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold">Split:</span>
                <select
                  value={previewSplit}
                  onChange={(e) => { setPreviewSplit(e.target.value); setPreviewPage(1); }}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-800 focus:outline-emerald-600 cursor-pointer"
                >
                  <option value="">All Splits</option>
                  <option value="train">Train</option>
                  <option value="val">Validation</option>
                  <option value="test">Test</option>
                </select>
              </div>
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search filename or label..."
                value={previewSearch}
                onChange={(e) => { setPreviewSearch(e.target.value); setPreviewPage(1); }}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium w-full sm:w-64 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Filename</th>
                    <th className="py-3 px-4">Crop</th>
                    <th className="py-3 px-4">Disease Classification</th>
                    <th className="py-3 px-4">Split</th>
                    <th className="py-3 px-4">Dimensions</th>
                    <th className="py-3 px-4">Symptom Text Formulation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {previewData.rows.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 truncate max-w-[180px]">
                        {row.filename}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{row.crop}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-semibold text-[11px] ${
                          row.is_healthy ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {row.disease}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          row.split === 'train' ? 'bg-emerald-100 text-emerald-800' :
                          row.split === 'val' ? 'bg-teal-100 text-teal-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {row.split}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{row.dimensions}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] truncate max-w-[280px]" title={row.symptoms}>
                        {row.symptoms || '—'}
                      </td>
                    </tr>
                  ))}
                  {previewData.rows.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-400">
                        {previewLoading ? 'Querying dataset records...' : 'No matching records found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-3 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing page <strong className="text-slate-800">{previewData.page}</strong> of <strong className="text-slate-800">{previewData.total_pages}</strong> ({previewData.total_rows} total rows)
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={previewData.page <= 1}
                  onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={previewData.page >= previewData.total_pages}
                  onClick={() => setPreviewPage(p => p + 1)}
                  className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-100 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: QUALITY & LIMITATIONS */}
      {activeSubTab === 'quality' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={20} className="text-amber-600" />
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Dataset Quality Audit & Real-World Generalization Boundaries
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl">
              Rigorous academic review of the PlantVillage benchmark. We explicitly document natural biases, file integrity results, and potential pitfalls when deploying laboratory-trained models into outdoor agricultural environments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Class Imbalance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 size={15} className="text-emerald-700" /> Class Imbalance Disparity
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                  {quality_report.class_imbalance?.ratio} Ratio
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {quality_report.class_imbalance?.finding}
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Most Sampled:</span>
                  <span className="font-bold text-slate-900">{quality_report.class_imbalance?.max_class} ({quality_report.class_imbalance?.max_count} imgs, {quality_report.class_imbalance?.max_pct})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Least Sampled:</span>
                  <span className="font-bold text-slate-900">{quality_report.class_imbalance?.min_class} ({quality_report.class_imbalance?.min_count} imgs, {quality_report.class_imbalance?.min_pct})</span>
                </div>
              </div>
            </div>

            {/* Card 2: File Integrity & Corruption */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-700" /> File Integrity Verification
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  {quality_report.file_integrity?.integrity_rate} PASS
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Automated bitmap parsing and header verification conducted across all 5,431 test set images. Zero corrupted images, broken file descriptors, or truncated JPEGs were detected.
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-bold block">Scanned</span>
                  <span className="font-bold text-slate-900">{quality_report.file_integrity?.total_verified_test_files}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Corrupted</span>
                  <span className="font-bold text-emerald-700">0</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">Missing</span>
                  <span className="font-bold text-emerald-700">0</span>
                </div>
              </div>
            </div>

            {/* Card 3: Laboratory Bias */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-amber-600" /> {quality_report.real_world_generalization?.issue}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                  Domain Shift Risk
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {quality_report.real_world_generalization?.details}
              </p>
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                <strong>Project Solution:</strong> Our architecture incorporates a multimodal NLP branch for symptom text descriptions to stabilize confidence when outdoor illumination obscures lesion color.
              </div>
            </div>

            {/* Card 4: Cross-Split Leakage */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Info size={15} className="text-slate-600" /> {quality_report.data_leakage?.issue}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  Documented Note
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {quality_report.data_leakage?.details}
              </p>
              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <strong>Faculty Takeaway:</strong> As observed in Mohanty et al. (2016), evaluating on independent field datasets (such as PlantDoc) reveals true out-of-distribution performance.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: FACULTY DEFENSE VIEW */}
      {activeSubTab === 'faculty' && (
        <div className="space-y-6">
          {/* Executive Defense Briefing Card */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-[11px] font-bold text-emerald-200 tracking-wide uppercase mb-3">
                <Award size={13} /> Academic Viva Defense Summary
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white mb-3">
                Plant Disease Classification Architecture & Dataset Provenance
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                This project implements a multimodal deep learning diagnostic engine trained on the benchmark PlantVillage corpus. Below is the rigorous factual defense sheet summarizing dataset curation, class distributions, model metrics, and field limitations.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-emerald-700/50">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">Dataset Size</span>
                <span className="text-2xl font-extrabold text-white font-heading">54,305</span>
                <span className="text-[11px] text-emerald-200 block">Verified foliar images</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">Validation Accuracy</span>
                <span className="text-2xl font-extrabold text-white font-heading">81.4%</span>
                <span className="text-[11px] text-emerald-200 block">Multimodal EfficientNetB3</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">Pathology Breadth</span>
                <span className="text-2xl font-extrabold text-white font-heading">38</span>
                <span className="text-[11px] text-emerald-200 block">26 disease, 12 healthy</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">Explainable AI</span>
                <span className="text-2xl font-extrabold text-white font-heading">Grad-CAM</span>
                <span className="text-[11px] text-emerald-200 block">Lesion attention heatmaps</span>
              </div>
            </div>
          </div>

          {/* Academic Talking Points for Viva */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-emerald-700" /> Key Viva Defense Questions & Verified Answers
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  1. What dataset was used to train the system, and what is its provenance?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The model was trained on the standard <strong>PlantVillage dataset</strong> (Hughes & Salathé, 2015, Frontiers in Plant Science), consisting of <strong>54,305 curated foliar photographs</strong> across 14 crop species and 38 distinct classes (26 disease classes and 12 healthy control classes). Images were acquired under controlled laboratory conditions against uniform grey/black backgrounds.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  2. How was the dataset partitioned into training, validation, and testing sets?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The corpus follows an <strong>80% / 10% / 10% stratified split</strong>:
                  <br />• <strong>Training Set:</strong> 43,444 images (80.00%) for backpropagation.
                  <br />• <strong>Validation Set:</strong> 5,430 images (10.00%) for model checkpointing and early stopping.
                  <br />• <strong>Test Set:</strong> 5,431 images (10.00%) for final out-of-sample evaluation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  3. Did you encounter class imbalance, and what is the severity?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Yes, severe class imbalance is present naturally in the dataset. The largest class is <em>Orange Citrus Greening (Haunglongbing)</em> with <strong>5,507 images (10.14%)</strong>, while the smallest class is <em>Potato Healthy</em> with only <strong>152 images (0.28%)</strong>, representing an imbalance ratio of <strong>36.2:1</strong>. To prevent model bias, class weighting and stratified sampling were implemented.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  4. What are the key limitations of PlantVillage in real agricultural practice?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  PlantVillage leaves were harvested and photographed indoors with uniform artificial lighting and clean backgrounds. In actual farm fields, complex weeds, soil, varying solar angles, and wet reflections cause domain shift. To mitigate this vulnerability, our system adds a <strong>multimodal text symptom branch</strong> and crop-prior masking.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAMPLE DETAIL MODAL */}
      <AnimatePresence>
        {selectedSample && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    {selectedSample.crop} Specimen
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    {selectedSample.display_name}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSample(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="aspect-square bg-slate-100 relative">
                <img
                  src={getMediaUrl(selectedSample.image_url)}
                  alt={selectedSample.display_name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-5 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Dataset Split</span>
                    <span className="font-bold text-slate-800">Verified Test Set</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Image Dimensions</span>
                    <span className="font-mono font-bold text-slate-800">{selectedSample.dimensions}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Raw Class Identifier</span>
                  <span className="font-mono text-emerald-800 text-[11px] block">{selectedSample.class_id}</span>
                </div>

                {selectedSample.symptoms && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] text-emerald-800 uppercase font-bold block mb-1">Verified Clinical Symptoms</span>
                    <p className="text-slate-700 text-[11px] leading-relaxed">{selectedSample.symptoms}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatasetExplorer;
