import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Cpu, RefreshCw, Trophy, AlertTriangle } from 'lucide-react';
import { metricsAPI } from '../services/api';

const ModelMetricsPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await metricsAPI.getMetrics();
      setMetrics(res.data);
    } catch (err) {
      console.error("Metrics error:", err);
      setError("Failed to fetch model evaluation metrics from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Loading ML evaluation metrics & validation matrices...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 glass-panel p-6 rounded-2xl border-red-500/30 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Evaluation Load Failure</h3>
        <p className="text-sm text-slate-400">{error}</p>
        <button
          onClick={fetchMetrics}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-semibold hover:bg-cyan-400"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Metrics Load</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            <span>Machine Learning Model Evaluation</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Empirical validation metrics generated during TF-IDF multi-model training
          </p>
        </div>

        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-bold">
          <Trophy className="w-4 h-4 text-cyan-400" />
          <span>Deployed Model: {metrics.best_model}</span>
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Training Corpus</p>
          <p className="text-3xl font-black text-white mt-2">{metrics.dataset_info?.total_samples || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Labeled email text samples</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Training Set (80%)</p>
          <p className="text-3xl font-black text-cyan-400 mt-2">{metrics.dataset_info?.train_samples || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">TF-IDF vector matrix fit</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Validation Test Set (20%)</p>
          <p className="text-3xl font-black text-emerald-400 mt-2">{metrics.dataset_info?.test_samples || 0}</p>
          <p className="text-[11px] text-slate-400 mt-1">Stratified test evaluation</p>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>Algorithm Performance Comparison</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Empirical metrics evaluated on test set</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Model Name</th>
                <th className="px-6 py-3.5">Accuracy</th>
                <th className="px-6 py-3.5">Precision</th>
                <th className="px-6 py-3.5">Recall</th>
                <th className="px-6 py-3.5">F1-Score</th>
                <th className="px-6 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {metrics.all_models && Object.entries(metrics.all_models).map(([name, m]) => {
                const isSelected = name === metrics.best_model;
                return (
                  <tr key={name} className={`hover:bg-slate-900/40 transition-colors ${isSelected ? 'bg-cyan-500/5' : ''}`}>
                    <td className="px-6 py-4 font-bold text-white flex items-center space-x-2">
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      <span>{name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-200">{(m.accuracy * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-200">{(m.precision * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4 font-mono font-semibold text-slate-200">{(m.recall * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4 font-mono font-black text-cyan-400">{(m.f1_score * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4 text-right">
                      {isSelected ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                          BEST MODEL
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Evaluated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion Matrix Section */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white">Confusion Matrix ({metrics.best_model})</h3>
        <p className="text-xs text-slate-400">Shows classification performance on True Negatives, False Positives, False Negatives, and True Positives.</p>

        {metrics.selected_metrics?.confusion_matrix && (
          <div className="max-w-md mx-auto grid grid-cols-2 gap-3 text-center p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
              <p className="text-2xl font-black text-emerald-400">{metrics.selected_metrics.confusion_matrix[0][0]}</p>
              <p className="text-[11px] font-semibold text-slate-300 mt-1 uppercase">True Negative (Safe)</p>
            </div>
            <div className="p-4 rounded-lg bg-red-950/40 border border-red-500/30">
              <p className="text-2xl font-black text-red-400">{metrics.selected_metrics.confusion_matrix[0][1]}</p>
              <p className="text-[11px] font-semibold text-slate-300 mt-1 uppercase">False Positive (False Alarm)</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-500/30">
              <p className="text-2xl font-black text-amber-400">{metrics.selected_metrics.confusion_matrix[1][0]}</p>
              <p className="text-[11px] font-semibold text-slate-300 mt-1 uppercase">False Negative (Missed)</p>
            </div>
            <div className="p-4 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
              <p className="text-2xl font-black text-cyan-400">{metrics.selected_metrics.confusion_matrix[1][1]}</p>
              <p className="text-[11px] font-semibold text-slate-300 mt-1 uppercase">True Positive (Phishing)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelMetricsPage;
