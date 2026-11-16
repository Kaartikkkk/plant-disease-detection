import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, CheckCircle2, Clock, Calendar,
  Printer, ArrowLeft, ArrowRight, Eye, Maximize2, X, Pill, Droplets,
  Sprout, Wind, ThermometerSun, AlertCircle, FileText, CheckSquare, Square,
  Layers, ShieldAlert, Sparkles, HelpCircle, ExternalLink, Leaf
} from 'lucide-react';
import { getMediaUrl } from '../services/diseaseService';

export const DiagnosticReport = ({
  result,
  uploadedImageSrc,
  onNewScan
}) => {
  const [showGradCam, setShowGradCam] = useState(false);
  const [showEnlargeModal, setShowEnlargeModal] = useState(false);
  
  // Interactive checklist state
  const [checklist, setChecklist] = useState({
    isolate: false,
    prune: false,
    sanitize: false,
    irrigation: false,
    treatment: false,
    scouting: false
  });

  if (!result || !result.prediction) return null;

  const pred = result.prediction;
  const diseaseInfo = result.disease_info || {};
  const treatment = result.treatment || {};
  const isHealthy = Boolean(pred.is_healthy);
  const confidencePercent = (pred.confidence * 100).toFixed(1);
  const cropName = pred.crop || 'Agricultural Crop';
  const diseaseTitle = pred.disease || 'Detected Pathology';
  const severityLevel = isHealthy ? 'Healthy (No Pathogen)' : (pred.severity || diseaseInfo.severity_level || 'Moderate');
  const topPredictions = result.top_3 || [];
  const gradCamUrl = result.grad_cam_image;
  const analysisTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const analysisDate = new Date().toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });

  const toggleChecklistItem = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Structured Plain-English Knowledge from verified dataset
  const symptomsText = diseaseInfo.symptoms ||
    (isHealthy
      ? "Foliage shows uniform green chlorophyll distribution, normal venation, and absence of necrotic spotting or chlorosis."
      : "Visible discoloration, spots, or chlorotic halos observed on leaf blade surface.");

  const immediateActionText = treatment.immediate_action ||
    (isHealthy
      ? "No chemical or corrective intervention needed. Continue regular field nutrition and irrigation."
      : "Isolate infected plant sections. Carefully prune diseased foliage and safely dispose of debris outside the field.");

  const fungicideText = treatment.fungicide && treatment.fungicide !== "N/A"
    ? treatment.fungicide
    : (isHealthy ? "None required" : "Copper-based protective fungicide or bio-fungicide");

  const dosageText = treatment.dosage && treatment.dosage !== "N/A"
    ? treatment.dosage
    : "Refer to regional crop extension label";

  const frequencyText = treatment.frequency && treatment.frequency !== "N/A"
    ? treatment.frequency
    : "Every 10 - 14 days if wet conditions persist";

  const preventionList = Array.isArray(diseaseInfo.prevention_tips) && diseaseInfo.prevention_tips.length > 0
    ? diseaseInfo.prevention_tips
    : (typeof treatment.prevention === 'string' && treatment.prevention.length > 0
      ? treatment.prevention.split(',').map(s => s.trim())
      : [
        "Avoid overhead sprinkler irrigation to keep foliage dry.",
        "Space plants adequately to encourage continuous airflow through the canopy.",
        "Sanitize shears and equipment between handling different crop rows."
      ]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Report Header Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            Official Field Diagnostic Report
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
            Crop Pathology Assessment
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
            <span>Report ID: <strong className="font-mono text-slate-700 font-normal">{result.scan_id ? result.scan_id.slice(0, 8) : 'AUTO-GEN'}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1"><Calendar size={13} /> {analysisDate} at {analysisTime}</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Verified Agronomic Model</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={onNewScan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Analyze Another Image</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Printer size={14} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* SECTION 4.A: TWO-COLUMN MAIN DIAGNOSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Analyzed plant image */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative">
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Analyzed Plant Specimen
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  Actual Uploaded Foliage
                </span>
              </div>

              {gradCamUrl && (
                <button
                  type="button"
                  onClick={() => setShowGradCam(!showGradCam)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                    showGradCam
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <Layers size={13} />
                  <span>{showGradCam ? 'Show Original' : 'View AI Heatmap'}</span>
                </button>
              )}
            </div>

            {/* Specimen Frame */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] border border-slate-200 flex items-center justify-center group shadow-inner">
              <img
                src={showGradCam && gradCamUrl ? gradCamUrl : uploadedImageSrc}
                alt="Analyzed leaf specimen"
                className="w-full h-full object-contain"
              />

              {/* Detected crop overlay badge */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-xs font-semibold border border-white/20">
                <Leaf size={13} className="text-emerald-400" />
                <span>Crop: {cropName}</span>
              </div>

              {/* Enlarge button */}
              <button
                onClick={() => setShowEnlargeModal(true)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                title="Enlarge Image"
              >
                <Maximize2 size={15} />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 mt-3">
              <span>Inspect spots, chlorosis, and lesions</span>
              <span className="font-mono text-emerald-800 font-semibold">100% User Upload</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Diagnosis details */}
        <div className="lg:col-span-7 space-y-5">
          <div className={`rounded-3xl p-6 sm:p-7 border shadow-sm ${
            isHealthy
              ? 'bg-emerald-50/70 border-emerald-200'
              : 'bg-rose-50/60 border-rose-200'
          }`}>
            
            {/* Status Pill & Confidence */}
            <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isHealthy
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {isHealthy ? <ShieldCheck size={14} className="text-emerald-700" /> : <ShieldAlert size={14} className="text-rose-700" />}
                  {isHealthy ? 'No Disease Detected' : 'Disease Detected'}
                </span>

                <span className="text-xs font-semibold text-slate-600">
                  in {cropName}
                </span>
              </div>

              <div className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs text-right">
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                  Model Confidence
                </span>
                <span className="text-sm font-extrabold text-emerald-800 font-mono">
                  {confidencePercent}%
                </span>
              </div>
            </div>

            {/* Disease Heading */}
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mb-2">
              {diseaseTitle}
            </h3>

            {/* Short Plain-English Summary */}
            <p className="text-sm text-slate-700 leading-relaxed mb-5">
              {isHealthy
                ? `The neural diagnostic model detected no foliar pathologies on this ${cropName} leaf. Canopy tissues display healthy chlorophyl pigmentation with uniform cellular density.`
                : `Our dual-stream model identified symptoms characteristic of ${diseaseTitle} on this ${cropName} sample with ${confidencePercent}% model confidence.`}
            </p>

            {/* Alternative Predictions Breakdown */}
            {topPredictions.length > 1 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/80 mb-5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2.5">
                  <span>Candidate Pathology Probabilities</span>
                  <span className="text-[10px] text-slate-400 font-normal">Top model classifications</span>
                </div>
                
                <div className="space-y-2.5">
                  {topPredictions.map((cand, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-800 font-semibold truncate max-w-[260px]">{cand.disease}</span>
                        <span className="font-mono text-emerald-800 font-bold">{cand.confidence_percent}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            idx === 0 ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                          style={{ width: cand.confidence_percent }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#treatment-section"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>View Prevention & Treatment Advice</span>
                <ArrowRight size={13} />
              </a>

              <button
                onClick={onNewScan}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-all cursor-pointer shadow-xs"
              >
                New Scan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4.B: KEY FINDINGS SECTION */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Summary of Key Findings
        </h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
            <span className="text-[11px] text-slate-500 font-medium block mb-1">
              Crop Identified
            </span>
            <p className="text-base font-extrabold text-slate-900 font-heading">
              {cropName}
            </p>
            <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Foliage specimen</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
            <span className="text-[11px] text-slate-500 font-medium block mb-1">
              Pathology Diagnosis
            </span>
            <p className="text-base font-extrabold text-slate-900 font-heading truncate" title={diseaseTitle}>
              {diseaseTitle}
            </p>
            <span className="text-[10px] text-slate-500 mt-1 block">{isHealthy ? 'Normal growth' : 'Pathogen active'}</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
            <span className="text-[11px] text-slate-500 font-medium block mb-1">
              Condition Severity
            </span>
            <p className="text-base font-extrabold font-heading">
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                isHealthy
                  ? 'bg-emerald-100 text-emerald-800'
                  : severityLevel.toLowerCase().includes('high') || severityLevel.toLowerCase().includes('severe')
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
              }`}>
                {severityLevel}
              </span>
            </p>
            <span className="text-[10px] text-slate-500 mt-1 block">Field triage metric</span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm">
            <span className="text-[11px] text-slate-500 font-medium block mb-1">
              Model Confidence
            </span>
            <p className="text-base font-extrabold text-emerald-800 font-heading font-mono">
              {confidencePercent}%
            </p>
            <span className="text-[10px] text-slate-500 mt-1 block">Not diagnostic certainty</span>
          </div>
        </div>
      </div>

      {/* SECTION 4.C: DISEASE OVERVIEW */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h4 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
            <Sprout size={18} className="text-emerald-700" />
            Disease Overview & Biology
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Understanding pathogen behavior, propagation triggers, and visible symptoms in {cropName}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          
          {/* Visible Symptoms */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-emerald-800">
              <Eye size={14} className="text-emerald-700" />
              Visible Foliar Symptoms
            </h5>
            <p className="text-slate-700 leading-relaxed">
              {symptomsText}
            </p>
          </div>

          {/* How the Disease Spreads */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-teal-800">
              <Wind size={14} className="text-teal-700" />
              How the Disease Spreads
            </h5>
            <p className="text-slate-700 leading-relaxed">
              Fungal and bacterial crop pathogens spread primarily through windblown microscopic spores, rain splash onto lower leaves, infected crop residues from previous seasons, and contaminated pruning tools.
            </p>
          </div>

          {/* Favorable Environmental Conditions */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-800">
              <ThermometerSun size={14} className="text-amber-700" />
              Conditions Favoring Development
            </h5>
            <p className="text-slate-700 leading-relaxed">
              Warm, humid periods with prolonged leaf surface wetness (over 6 to 8 hours), dense planting canopies with poor air movement, and mild overcast mornings significantly accelerate spore germination.
            </p>
          </div>

          {/* Potential Yield Impact */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
            <h5 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wider text-rose-800">
              <AlertCircle size={14} className="text-rose-700" />
              Potential Harvest Impact
            </h5>
            <p className="text-slate-700 leading-relaxed">
              Unchecked foliar infections cause premature defoliation, drastically lowering photosynthetic capacity, stunting crop vigor, and reducing harvest yield and commercial fruit quality.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4.D: PREVENTION AND TREATMENT SECTION */}
      <div id="treatment-section" className="space-y-4">
        <div>
          <h4 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
            <Pill size={18} className="text-emerald-700" />
            Actionable Prevention & Treatment Recommendations
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Step-by-step guidance formatted for practical field management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Card 1: What to do now */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm border-t-4 border-t-rose-600 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 text-xs font-bold uppercase tracking-wider">
              <span className="w-6 h-6 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 font-bold">1</span>
              What To Do Now (Immediate Steps)
            </div>

            <p className="text-sm font-semibold text-slate-900">
              {immediateActionText}
            </p>

            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                <span>Isolate heavily affected plants immediately to stop physical spore transfer.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                <span>Safely bag and remove diseased foliage from the field. <strong>Do not compost</strong> infected material.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                <span>Sanitize pruning tools with 70% rubbing alcohol or 10% bleach after handling affected plants.</span>
              </li>
            </ul>
          </div>

          {/* Card 2: How to prevent it from spreading */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm border-t-4 border-t-emerald-600 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">2</span>
              How To Prevent It From Spreading
            </div>

            <p className="text-sm font-semibold text-slate-900">
              Cultural & Field Preventive Practices
            </p>

            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              {preventionList.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-700 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <CheckCircle2 size={13} className="text-emerald-700 shrink-0 mt-0.5" />
                <span>Switch from overhead sprinklers to ground-level drip irrigation to keep foliage completely dry.</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Treatment options */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm border-t-4 border-t-teal-600 space-y-3">
            <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider">
              <span className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700 font-bold">3</span>
              Treatment Options
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Recommended Compound / Control</span>
                <p className="text-sm font-extrabold text-slate-900">{fungicideText}</p>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div>Dosage: <strong className="text-slate-800">{dosageText}</strong></div>
                  <div>Interval: <strong className="text-slate-800">{frequencyText}</strong></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <strong>Important Label Notice:</strong> Product selection, spray timing, and pesticide application must strictly adhere to local crop extension guidelines and the chemical manufacturer's registered label.
              </div>
            </div>
          </div>

          {/* Card 4: When to contact an expert */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm border-t-4 border-t-amber-600 space-y-3">
            <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <span className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 font-bold">4</span>
              When To Contact An Agricultural Expert
            </div>

            <p className="text-sm font-semibold text-slate-900">
              When Field Consultation is Advised
            </p>

            <ul className="space-y-2 text-xs text-slate-600 pt-2">
              <li className="flex items-start gap-2">
                <HelpCircle size={14} className="text-amber-700 shrink-0 mt-0.5" />
                <span>If symptoms continue spreading rapidly across more than 15% of the crop plot within 48-72 hours.</span>
              </li>
              <li className="flex items-start gap-2">
                <HelpCircle size={14} className="text-amber-700 shrink-0 mt-0.5" />
                <span>When model prediction confidence is low or visible leaf lesions do not match typical disease patterns.</span>
              </li>
              <li className="flex items-start gap-2">
                <HelpCircle size={14} className="text-amber-700 shrink-0 mt-0.5" />
                <span>Contact your local University Agricultural Extension agent or certified crop advisor for definitive laboratory culture verification.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION 4.E: INTERACTIVE DISEASE PREVENTION CHECKLIST */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
              <CheckSquare size={18} className="text-emerald-700" />
              Farmer Action Checklist
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Check off recommended field intervention tasks as you complete them
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {Object.values(checklist).filter(Boolean).length} of {Object.keys(checklist).length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { key: 'isolate', label: 'Flag and isolate heavily infected plants in the affected field block' },
            { key: 'prune', label: 'Prune diseased foliage and safely dispose in waste (do not compost)' },
            { key: 'sanitize', label: 'Disinfect pruning shears and hand tools with 70% alcohol or bleach' },
            { key: 'irrigation', label: 'Verify drip irrigation is functioning and canopy remains dry' },
            { key: 'treatment', label: 'Apply approved protective spray according to manufacturer label dosage' },
            { key: 'scouting', label: 'Schedule follow-up visual scouting inspection in 5 to 7 days' }
          ].map((item) => {
            const isChecked = checklist[item.key];
            return (
              <div
                key={item.key}
                onClick={() => toggleChecklistItem(item.key)}
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
                  isChecked
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="mt-0.5 text-emerald-700 shrink-0">
                  {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                </div>
                <span className={`leading-relaxed ${isChecked ? 'line-through text-slate-500 font-normal' : ''}`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ENLARGE IMAGE MODAL */}
      <AnimatePresence>
        {showEnlargeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 max-w-3xl w-full relative shadow-2xl border border-slate-200"
            >
              <button
                onClick={() => setShowEnlargeModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>

              <h4 className="text-base font-bold text-slate-900 font-heading mb-4">
                Specimen High-Resolution Inspection ({cropName} — {diseaseTitle})
              </h4>

              <div className="rounded-2xl overflow-hidden bg-slate-950 max-h-[75vh] flex items-center justify-center">
                <img
                  src={showGradCam && gradCamUrl ? gradCamUrl : uploadedImageSrc}
                  alt="High-resolution specimen view"
                  className="w-full max-h-[75vh] object-contain"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiagnosticReport;
