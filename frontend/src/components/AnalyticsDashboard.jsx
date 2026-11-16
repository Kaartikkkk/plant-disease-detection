import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Activity, ShieldCheck, AlertTriangle, Flame,
  Clock, RefreshCw, Eye, ArrowUpRight, TrendingUp, Cpu, CheckCircle2, Leaf
} from 'lucide-react';
import { diseaseService, getMediaUrl } from '../services/diseaseService';

export const AnalyticsDashboard = ({ onOpenScan, onNavigateToScanner }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await diseaseService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-slate-500">
        <div className="w-10 h-10 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Aggregating field diagnostic telemetry...</p>
      </div>
    );
  }

  const totalScans = stats?.total_scans || 0;
  const healthyCount = stats?.healthy_count || 0;
  const infectedCount = stats?.infected_count || 0;
  const healthyPercent = stats?.healthy_percentage || 0;
  const infectedPercent = totalScans > 0 ? (100 - healthyPercent).toFixed(1) : 0;
  const topDiseases = stats?.top_diseases || [];
  const cropDist = stats?.crop_distribution || [];
  const recentActivity = stats?.recent_activity || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity size={14} className="text-emerald-600" />
            Diagnostic Telemetry & Field Intelligence
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
            Crop Health Analytics Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Real-time statistical synthesis of plant pathology scans, infection severity distributions, and vulnerable crop varieties.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-emerald-600' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={onNavigateToScanner}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 text-xs font-bold transition-all cursor-pointer"
          >
            <Leaf size={14} />
            <span>New Diagnosis</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Scans */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
            <span>Total Crop Inspections</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Activity size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-heading">{totalScans}</span>
            <span className="text-xs font-semibold text-emerald-700 flex items-center">
              <TrendingUp size={12} className="mr-0.5" /> Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Historical leaf samples evaluated across all plots
          </p>
          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-emerald-500 opacity-80" />
        </div>

        {/* KPI 2: Healthy Foliage Ratio */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
            <span>Healthy Foliage Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700 font-heading">{healthyPercent}%</span>
            <span className="text-xs text-slate-500">({healthyCount} healthy)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${healthyPercent}%` }}
            />
          </div>
          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-emerald-600 opacity-80" />
        </div>

        {/* KPI 3: Disease Incidence */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
            <span>Pathology Incidence</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-100">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-700 font-heading">{infectedPercent}%</span>
            <span className="text-xs text-slate-500">({infectedCount} infected)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className="bg-rose-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${infectedPercent}%` }}
            />
          </div>
          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-rose-500 opacity-80" />
        </div>

        {/* KPI 4: Engine Speed & Classes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-3">
            <span>Supported Classes</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
              <Cpu size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-heading">38</span>
            <span className="text-xs text-teal-700 font-semibold">across 14 crops</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            EfficientNetB3 + Dual-stream Multimodal
          </p>
          <div className="absolute -bottom-1 left-0 right-0 h-1 bg-teal-500 opacity-80" />
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Top Pathologies & Crop Distribution */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Pathologies Chart */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
                  <Flame size={18} className="text-amber-500" />
                  Most Prevalent Crop Pathologies
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Frequency and mean model confidence across detected disease incidents
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Top Diagnoses
              </span>
            </div>

            {topDiseases.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No disease records detected in current scan batch.
              </div>
            ) : (
              <div className="space-y-4">
                {topDiseases.map((item, idx) => {
                  const maxCount = Math.max(...topDiseases.map(d => d.count), 1);
                  const barWidth = Math.max(15, (item.count / maxCount) * 100);

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{item.disease}</span>
                        <div className="flex items-center gap-3 text-slate-500">
                          <span className="text-emerald-700 font-mono text-[11px] font-semibold">
                            Avg {(item.avg_confidence * 100).toFixed(1)}% Conf
                          </span>
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {item.count} {item.count === 1 ? 'scan' : 'scans'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Crop Breakdown Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 font-heading mb-4 flex items-center gap-2">
              <Leaf size={18} className="text-emerald-600" />
              Inspections by Crop Category
            </h3>

            {cropDist.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No crop breakdown recorded yet.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {cropDist.map((cropItem, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all"
                  >
                    <span className="text-xs text-slate-500 block font-semibold truncate">
                      {cropItem.crop}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="text-2xl font-bold text-slate-900 font-heading">
                        {cropItem.count}
                      </span>
                      <span className="text-[11px] text-emerald-700 font-bold">
                        {totalScans > 0 ? ((cropItem.count / totalScans) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Health Donut & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Health Gauge Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-base font-bold text-slate-900 font-heading mb-1">
              Field Health Index
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Proportion of clean foliage vs diagnosed pathologies
            </p>

            {/* SVG Donut */}
            <div className="relative w-44 h-44 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#059669"
                  strokeWidth="12"
                  strokeDasharray={`${(healthyPercent * 2.51).toFixed(1)} 251.2`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900 font-heading">
                  {healthyPercent}%
                </span>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                  Healthy
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0" />
                <div className="text-left">
                  <div className="font-bold">{healthyCount}</div>
                  <div className="text-[10px] text-slate-500">Healthy</div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-800">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0" />
                <div className="text-left">
                  <div className="font-bold">{infectedCount}</div>
                  <div className="text-[10px] text-slate-500">Pathogenic</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity Mini-Feed */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 font-heading flex items-center gap-1.5">
                <Clock size={16} className="text-emerald-600" />
                Recent Diagnostic Logs
              </h3>
              <span className="text-[10px] text-slate-400">Latest</span>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No scan records in database.</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((scan) => {
                  const isHealthy = scan.is_healthy === 1;
                  return (
                    <div
                      key={scan.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              isHealthy ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}
                          />
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {scan.disease_name || 'Crop Scan'}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-500 ml-3.5 mt-0.5">
                          {scan.crop_type || 'Unknown Crop'} • {scan.scan_date || 'Today'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono text-emerald-700">
                          {((scan.confidence || 0) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
