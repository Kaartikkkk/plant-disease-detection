import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, Image, X, AlertCircle, Loader2, Leaf, Search,
  ChevronDown, PenLine, Sliders, ArrowRight, Zap, Target,
  Layers, ShieldCheck
} from 'lucide-react';
import { diseaseService } from '../services/diseaseService';
import DiagnosticReport from './DiagnosticReport';

export const DiseaseScanner = ({
  initialSymptoms = '',
  initialCrop = '',
  onScanComplete = null
}) => {
  // Scanner state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [symptoms, setSymptoms] = useState(initialSymptoms);
  const [cropType, setCropType] = useState(initialCrop);
  const [farmId, setFarmId] = useState('');

  // Status & loading
  const [flaskStatus, setFlaskStatus] = useState('checking');
  const [modelName, setModelName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Preprocessing leaf tensor...');

  // Results
  const [result, setResult] = useState(null);

  // UX state
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Sync initial props
  useEffect(() => {
    if (initialSymptoms) setSymptoms(initialSymptoms);
    if (initialCrop) setCropType(initialCrop);
  }, [initialSymptoms, initialCrop]);

  // Monitor Backend Health
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    try {
      const data = await diseaseService.checkHealth();
      if (data.online || data.status === 'ok') {
        setFlaskStatus('online');
        setModelName(data.model_name || 'EfficientNetB3');
      } else {
        setFlaskStatus('offline');
      }
    } catch {
      setFlaskStatus('offline');
    }
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type) && !file.type.startsWith('image/')) {
      setError('Please upload a valid JPG, PNG, or WEBP leaf image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Photo exceeds the 10MB limit. Please upload a smaller leaf image.');
      return;
    }

    setError(null);
    setImageFile(file);
    setSelectedImage(URL.createObjectURL(file));
    setResult(null);
  };

  const triggerBrowse = () => fileInputRef.current?.click();

  const removePhoto = () => {
    setImageFile(null);
    setSelectedImage(null);
    setResult(null);
    setError(null);
  };

  const startLoadingMessages = () => {
    const messages = [
      "Extracting 300x300 RGB foliar tensors...",
      "Evaluating EfficientNetB3 feature activations...",
      "Computing semantic NLP text embeddings...",
      "Synthesizing multimodal dense fusion...",
      "Generating Grad-CAM saliency heatmaps..."
    ];
    let index = 0;
    setLoadingMessage(messages[0]);
    const timer = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 1300);
    return timer;
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      triggerBrowse();
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    const messageTimer = startLoadingMessages();

    try {
      const response = await diseaseService.predictDisease(imageFile, symptoms, cropType, farmId);
      setResult(response);
      if (onScanComplete) {
        onScanComplete(response);
      }
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (err) {
      console.error('Diagnosis error:', err);
      if (err.message && (err.message.includes('Network Error') || err.code === 'ERR_NETWORK' || err.message.includes('failed to fetch'))) {
        setError(`Cannot reach backend API at "${diseaseService.getBaseUrl ? diseaseService.getBaseUrl() : 'configured URL'}". If you deployed on Render, make sure VITE_API_URL in Vercel is set to your actual live URL (e.g. https://agrovision-api-p3lg.onrender.com) and redeploy.`);
      } else {
        const detail = err.response?.data?.details || err.response?.data?.error || err.message;
        setError(`Analysis failed: ${detail}`);
      }
    } finally {
      clearInterval(messageTimer);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* If result exists, render the Comprehensive Diagnostic Report */}
      {result ? (
        <DiagnosticReport
          result={result}
          uploadedImageSrc={selectedImage}
          onNewScan={removePhoto}
        />
      ) : (
        /* Image Upload & Specification Interface */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left Column: Upload Plant Specimen Box */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              
              {/* Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-[#ebf7ee] text-[#16a34a] flex items-center justify-center shrink-0">
                  <UploadCloud size={19} className="stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading tracking-tight">
                    Upload Plant Specimen
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload a clear leaf image (JPG, PNG) for disease detection.
                  </p>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
              />

              {/* Drag & Drop Area */}
              {!selectedImage ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={triggerBrowse}
                  className={`flex-1 flex flex-col items-center justify-center min-h-[240px] border-2 border-dashed rounded-2xl cursor-pointer p-8 sm:p-10 transition-all text-center relative overflow-hidden group ${
                    dragOver
                      ? 'border-emerald-500 bg-[#ebf7ee]/70 shadow-xs'
                      : 'border-[#86efac] bg-[#fbfdfb] hover:bg-[#f4fbf6]'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#ebf7ee] text-[#16a34a] flex items-center justify-center mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                    <UploadCloud size={26} strokeWidth={2.2} />
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5">
                    Drag &amp; drop your leaf image here
                  </h4>
                  <p className="text-xs text-slate-500 mb-4">
                    or click to browse from your device
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerBrowse();
                    }}
                    className="bg-[#168a42] hover:bg-[#15803d] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Image size={15} strokeWidth={2.2} />
                    <span>Choose Image</span>
                  </button>

                  <span className="text-[11px] text-slate-400 mt-4 block">
                    Supported formats: JPG, PNG | Max size: 10 MB
                  </span>
                </div>
              ) : (
                /* Selected Image Preview */
                <div className="flex-1 flex flex-col justify-center space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 min-h-[220px] max-h-[260px] flex items-center justify-center group shadow-xs">
                    <img
                      src={selectedImage}
                      alt="Selected leaf specimen"
                      className="w-full max-h-[260px] object-contain"
                    />

                    {/* Laser Scanline when analyzing */}
                    {isAnalyzing && (
                      <div className="animate-scanline pointer-events-none z-30" />
                    )}

                    {/* Actions overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
                      <button
                        type="button"
                        onClick={triggerBrowse}
                        className="px-3 py-1 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold rounded-lg border border-white/20 transition-all cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="p-1.5 bg-rose-600 hover:bg-rose-700 backdrop-blur-md text-white rounded-lg transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {/* Loading Overlay */}
                    <AnimatePresence>
                      {isAnalyzing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white z-20"
                        >
                          <Loader2 className="animate-spin text-emerald-400 mb-2" size={36} />
                          <span className="text-xs font-bold tracking-wide font-heading text-slate-100">
                            {loadingMessage}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {imageFile && (
                    <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
                      <span className="truncate font-mono max-w-[240px] text-slate-800 font-medium">{imageFile.name}</span>
                      <span className="font-mono text-slate-500">{(imageFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  )}
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}
            </div>

            {/* Right Column: Analysis Settings */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[#ebf7ee] text-[#16a34a] flex items-center justify-center shrink-0">
                    <Sliders size={18} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-heading tracking-tight">
                      Analysis Settings
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure optional details for better prediction.
                    </p>
                  </div>
                </div>

                {/* Form Controls */}
                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Crop Type
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#16a34a]">
                        <Leaf size={16} strokeWidth={2} />
                      </div>
                      <select
                        value={cropType}
                        onChange={(e) => setCropType(e.target.value)}
                        className="w-full text-xs sm:text-sm pl-10 pr-10 py-3.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-slate-800 outline-none cursor-pointer shadow-2xs appearance-none font-medium transition-all"
                      >
                        <option value="">-- Auto-Detect From Image --</option>
                        <option value="Apple">Apple</option>
                        <option value="Blueberry">Blueberry</option>
                        <option value="Cherry">Cherry</option>
                        <option value="Corn (maize)">Corn (Maize)</option>
                        <option value="Grape">Grape</option>
                        <option value="Orange">Orange</option>
                        <option value="Peach">Peach</option>
                        <option value="Pepper bell">Pepper (Bell)</option>
                        <option value="Potato">Potato</option>
                        <option value="Raspberry">Raspberry</option>
                        <option value="Soybean">Soybean</option>
                        <option value="Squash">Squash</option>
                        <option value="Strawberry">Strawberry</option>
                        <option value="Tomato">Tomato</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">
                      Observed Symptoms (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#16a34a]">
                        <PenLine size={16} strokeWidth={2} />
                      </div>
                      <input
                        type="text"
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="e.g. brown spots, yellow halos, leaf curling"
                        className="w-full text-xs sm:text-sm pl-10 pr-4 py-3.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 bg-white text-slate-800 outline-none shadow-2xs font-medium placeholder:text-slate-400 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Analyze Action Button */}
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !selectedImage}
                className={`w-full py-3.5 px-6 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all mt-6 cursor-pointer ${
                  isAnalyzing
                    ? 'bg-[#0e6234]/80 cursor-wait'
                    : !selectedImage
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#0e6234] hover:bg-[#0a4d28] hover:shadow-md active:scale-[0.99]'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Analyzing Leaf...</span>
                  </>
                ) : (
                  <>
                    <Search size={16} strokeWidth={2.2} />
                    <span>Analyze Leaf</span>
                    <ArrowRight size={16} strokeWidth={2.2} className="ml-0.5" />
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Bottom 4-Feature Cards Strip */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-3 first:pl-0 first:pt-0">
              <div className="w-10 h-10 rounded-xl bg-[#ebf7ee] text-[#16a34a] flex items-center justify-center shrink-0">
                <Zap size={18} className="stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  Fast Detection
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                  Get results in seconds
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-4">
              <div className="w-10 h-10 rounded-xl bg-[#ebf7ee] text-[#16a34a] flex items-center justify-center shrink-0">
                <Target size={18} className="stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  High Accuracy
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                  Powered by EfficientNet-B3
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-4">
              <div className="w-10 h-10 rounded-xl bg-[#ebf7ee] text-[#16a34a] flex items-center justify-center shrink-0">
                <Layers size={18} className="stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  38 Classes
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                  Multiple crop diseases
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-4">
              <div className="w-10 h-10 rounded-xl bg-[#ebf7ee] text-[#16a34a] flex items-center justify-center shrink-0">
                <ShieldCheck size={18} className="stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  Reliable &amp; Scalable
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                  Built for real-field use
                </p>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default DiseaseScanner;
