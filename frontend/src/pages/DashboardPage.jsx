import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldAlert, ShieldCheck, AlertTriangle, ArrowUpRight, BarChart2, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { dashboardAPI } from '../services/api';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to connect to security API backend. Ensure FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-400">Loading live security statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 glass-panel p-6 rounded-2xl border-red-500/30 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
        <h3 className="text-xl font-bold text-white">Security API Error</h3>
        <p className="text-sm text-slate-400">{error}</p>
        <button
          onClick={fetchDashboardStats}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-semibold hover:bg-cyan-400 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  // Chart Data Configurations
  const pieData = [
    { name: 'Phishing', value: stats.phishing_count, color: '#ef4444' },
    { name: 'Safe', value: stats.safe_count, color: '#10b981' },
    { name: 'Suspicious', value: stats.suspicious_count, color: '#f59e0b' },
  ];

  const riskDistData = [
    { level: 'LOW', count: stats.risk_distribution?.LOW || 0, fill: '#10b981' },
    { level: 'MEDIUM', count: stats.risk_distribution?.MEDIUM || 0, fill: '#f59e0b' },
    { level: 'HIGH', count: stats.risk_distribution?.HIGH || 0, fill: '#f97316' },
    { level: 'CRITICAL', count: stats.risk_distribution?.CRITICAL || 0, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <Activity className="w-8 h-8 text-cyan-400" />
            <span>Security Operations Dashboard</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time threat intelligence and scan statistics</p>
        </div>

        <button
          onClick={fetchDashboardStats}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card p-5 rounded-2xl border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Scans</p>
          <p className="text-3xl font-black text-white mt-2">{stats.total_scans}</p>
          <p className="text-[11px] text-slate-400 mt-1">Processed emails</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-red-500/20 bg-red-500/5">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wider flex items-center justify-between">
            <span>Phishing</span>
            <ShieldAlert className="w-4 h-4" />
          </p>
          <p className="text-3xl font-black text-red-400 mt-2">{stats.phishing_count}</p>
          <p className="text-[11px] text-slate-400 mt-1">Threats detected</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-emerald-500/20 bg-emerald-500/5">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
            <span>Safe Emails</span>
            <ShieldCheck className="w-4 h-4" />
          </p>
          <p className="text-3xl font-black text-emerald-400 mt-2">{stats.safe_count}</p>
          <p className="text-[11px] text-slate-400 mt-1">Legitimate traffic</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-amber-500/20 bg-amber-500/5">
          <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center justify-between">
            <span>Suspicious</span>
            <AlertTriangle className="w-4 h-4" />
          </p>
          <p className="text-3xl font-black text-amber-400 mt-2">{stats.suspicious_count}</p>
          <p className="text-[11px] text-slate-400 mt-1">Medium risk warnings</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border-cyan-500/20 bg-cyan-500/5">
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Avg Risk Score</p>
          <p className="text-3xl font-black text-cyan-400 mt-2">{stats.average_risk_score} <span className="text-xs font-normal text-slate-400">/ 100</span></p>
          <p className="text-[11px] text-slate-400 mt-1">Global risk metric</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Phishing vs Safe Pie Chart */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <span>Detection Distribution (Phishing vs Safe)</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Level Distribution Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            <span>Risk Score Level Breakdown</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskDistData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="level" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" name="Email Count" radius={[6, 6, 0, 0]}>
                  {riskDistData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Scans Table */}
      <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Security Scans</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest emails analyzed by the threat engine</p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            <span>View Full History</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Subject</th>
                <th className="px-6 py-3.5">Sender</th>
                <th className="px-6 py-3.5">Result</th>
                <th className="px-6 py-3.5">Risk Score</th>
                <th className="px-6 py-3.5">Confidence</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {stats.recent_scans && stats.recent_scans.length > 0 ? (
                stats.recent_scans.map((scan) => {
                  const isPhish = scan.prediction === 'PHISHING';
                  const isSusp = scan.prediction === 'SUSPICIOUS';
                  return (
                    <tr key={scan.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-white max-w-xs truncate">{scan.subject}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">{scan.sender}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isPhish ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                          isSusp ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {scan.prediction}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        <span className={scan.risk_score > 60 ? 'text-red-400' : scan.risk_score > 30 ? 'text-amber-400' : 'text-emerald-400'}>
                          {scan.risk_score} / 100
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">{Math.round(scan.confidence * 100)}%</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/history?scanId=${scan.id}`}
                          className="text-xs font-semibold text-cyan-400 hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-400 text-sm">
                    No scan logs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
