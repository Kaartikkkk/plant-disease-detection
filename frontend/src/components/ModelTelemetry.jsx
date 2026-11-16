import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Cpu, Layers, Eye, Network, CheckCircle, Database,
  Terminal, ShieldCheck, Zap, Server, Activity, ArrowRight
} from 'lucide-react';
import { diseaseService } from '../services/diseaseService';

export const ModelTelemetry = () => {
  const [modelInfo, setModelInfo] = useState(null);
  const [healthInfo, setHealthInfo] = useState(null);

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      const [mInfo, hInfo] = await Promise.all([
        diseaseService.getModelInfo(),
        diseaseService.checkHealth()
      ]);
      setModelInfo(mInfo);
      setHealthInfo(hInfo);
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    }
  };

  const endpoints = [
    { method: 'POST', path: '/predict', desc: 'Accepts leaf image + symptoms text; returns top 3 classes, Grad-CAM, & treatments' },
    { method: 'GET', path: '/health', desc: 'Liveness, active model status, uptime, & hardware device info' },
    { method: 'GET', path: '/stats', desc: 'Aggregated analytics: crop distributions, disease prevalence, healthy rates' },
    { method: 'GET', path: '/pathologies', desc: 'Full 38-class agronomic encyclopedia with chemical & organic protocols' },
    { method: 'GET', path: '/samples', desc: 'Curated 1-click test leaves with realistic symptoms for instant verification' },
    { method: 'GET', path: '/history', desc: 'Retrieves audit logs of past scans stored in persistent SQLite' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="max-w-3xl relative z-10">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu size={14} className="text-emerald-600" />
            Dual-Stream Deep Learning Telemetry
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
            Neural Architecture & Hardware Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
            Technical blueprint of our multimodal plant diagnostic engine: combining high-resolution visual backbones with semantic NLP symptom representations and explainable Grad-CAM saliency heatmaps.
          </p>
        </div>

        {/* Runtime Specs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 relative z-10">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Active Weights
            </span>
            <p className="text-xs font-bold text-emerald-700 font-mono mt-1 truncate">
              {modelInfo?.primary_model || 'plant_disease_model_final.keras'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Validation Accuracy
            </span>
            <p className="text-xs font-bold text-slate-900 font-mono mt-1">
              81.40% (Top-1) / 96.2% (Top-3)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Inference Hardware
            </span>
            <p className="text-xs font-bold text-emerald-700 font-mono mt-1">
              {healthInfo?.device || 'CPU'} Accelerated
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Input Shape
            </span>
            <p className="text-xs font-bold text-slate-900 font-mono mt-1">
              (300, 300, 3) RGB
            </p>
          </div>
        </div>
      </div>

      {/* Multimodal Architecture Visual Pipeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
              <Network size={20} className="text-emerald-600" />
              Dual-Stream Multimodal Architecture Pipeline
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Simultaneous processing of image leaf pathology and farmer field symptom reports
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Multimodal Fusion
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative">
          
          {/* Stream 1: Vision Backbone */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Layers size={14} className="text-emerald-600" /> Stream 1: Vision Backbone
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">EfficientNetB3 CNN Extractor</h4>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">Input Tensor:</span>
                <span className="font-mono font-bold text-emerald-800">[300, 300, 3]</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">Normalization:</span>
                <span className="font-mono text-slate-800">[-1.0 to 1.0]</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">Feature Map:</span>
                <span className="font-mono text-slate-800">top_conv (1536-d)</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">Attention Layer:</span>
                <span className="font-mono font-bold text-emerald-700">Grad-CAM Saliency</span>
              </li>
            </ul>
          </div>

          {/* Stream 2: Semantic NLP Embedding */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
            <div className="flex items-center gap-2 text-teal-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Terminal size={14} className="text-teal-600" /> Stream 2: Symptom NLP Stream
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Text Tokenizer & Dense Projection</h4>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">Context Window:</span>
                <span className="font-mono font-bold text-teal-800">50 tokens max</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">Vocab Lexicon:</span>
                <span className="font-mono text-slate-800">5,000 words</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">Dense Projection:</span>
                <span className="font-mono text-slate-800">Dense(128, ReLU)</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">Fallback Mode:</span>
                <span className="font-mono text-slate-500">Zero-vector padding</span>
              </li>
            </ul>
          </div>

          {/* Fusion & Classification Output */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              <Zap size={14} className="text-emerald-600" /> Fusion & Diagnostic Head
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Concatenation & Softmax</h4>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">Fusion Layer:</span>
                <span className="font-mono font-bold text-emerald-800">Concatenate()</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">Dense Hidden:</span>
                <span className="font-mono text-slate-800">Dense(512) + Dropout(0.3)</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">Output Layer:</span>
                <span className="font-mono font-bold text-emerald-700">Dense(38, Softmax)</span>
              </li>
              <li className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200/70">
                <span className="text-slate-500">Top-k Ranking:</span>
                <span className="font-mono text-slate-800">Top-3 Probabilities</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Explainable AI: Grad-CAM Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Eye size={16} className="text-emerald-600" /> Explainable Artificial Intelligence
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading mb-3">
            Grad-CAM Saliency Activation Heatmaps
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            Gradient-weighted Class Activation Mapping (Grad-CAM) computes gradients of the predicted pathology score with respect to feature activation maps in the deepest convolutional layer.
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <p className="text-slate-700">
                <strong className="text-slate-900">Convolutional Target:</strong> Features extracted from the penultimate conv block before global average pooling.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <p className="text-slate-700">
                <strong className="text-slate-900">Heatmap Normalization:</strong> ReLU activation retains features positively correlating with the disease class.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <p className="text-slate-700">
                <strong className="text-slate-900">False Positive Mitigation:</strong> Allows agronomists to confirm whether the AI is focusing on actual foliar lesions rather than soil or background noise.
              </p>
            </div>
          </div>
        </div>

        {/* REST API Endpoints Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Server size={16} className="text-emerald-600" /> Backend Microservice Specification
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-heading mb-4">
            REST API Surface
          </h3>

          <div className="space-y-2.5">
            {endpoints.map((ep, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        ep.method === 'POST'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-teal-100 text-teal-800 border border-teal-300'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-slate-900 font-bold">{ep.path}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{ep.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelTelemetry;
