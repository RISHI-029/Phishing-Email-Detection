import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { History, Search, Filter, ArrowUpDown, ShieldAlert, ShieldCheck, AlertTriangle, Eye, RefreshCw, X } from 'lucide-react';
import { scansAPI } from '../services/api';
import IndicatorCard from '../components/IndicatorCard';
import RiskGauge from '../components/RiskGauge';

const ScanHistoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialScanId = searchParams.get('scanId');

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [resultFilter, setResultFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date');

  // Selected scan modal state
  const [selectedScan, setSelectedScan] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchScans = async () => {
    setLoading(true);
    try {
      const res = await scansAPI.getScans({
        query: searchQuery || undefined,
        result_filter: resultFilter !== 'ALL' ? resultFilter : undefined,
        sort_by: sortBy,
      });
      setScans(res.data);
    } catch (err) {
      console.error("Fetch scans error:", err);
      setError("Failed to load scan history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [resultFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchScans();
  };

  // Open Detail Modal
  const openScanDetail = async (scanId) => {
    setModalLoading(true);
    try {
      const res = await scansAPI.getScanDetails(scanId);
      setSelectedScan(res.data);
    } catch (err) {
      console.error("Scan detail error:", err);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (initialScanId) {
      openScanDetail(initialScanId);
    }
  }, [initialScanId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <History className="w-8 h-8 text-cyan-400" />
            <span>Audit & Scan History</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review, filter, and inspect previously analyzed email payloads</p>
        </div>

        <button
          onClick={fetchScans}
          className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Refresh History</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search by subject or sender email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-500 text-sm text-white placeholder-slate-500 outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </form>

        {/* Filter Buttons & Sorting */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Result Filter */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'PHISHING', 'SUSPICIOUS', 'SAFE'].map((filter) => (
              <button
                key={filter}
                onClick={() => setResultFilter(filter)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  resultFilter === filter ? 'bg-cyan-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
            >
              <option value="date">Sort by Date (Newest)</option>
              <option value="risk">Sort by Risk Score (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-2"></div>
            Loading historical scan logs...
          </div>
        ) : scans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Sender</th>
                  <th className="px-6 py-3.5">Result</th>
                  <th className="px-6 py-3.5">Risk Score</th>
                  <th className="px-6 py-3.5">Confidence</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {scans.map((scan) => {
                  const dateStr = scan.created_at ? new Date(scan.created_at).toLocaleString() : 'N/A';
                  return (
                    <tr key={scan.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-400 whitespace-nowrap">{dateStr}</td>
                      <td className="px-6 py-4 font-medium text-white max-w-xs truncate">{scan.subject}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 max-w-xs truncate">{scan.sender}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          scan.prediction === 'PHISHING' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                          scan.prediction === 'SUSPICIOUS' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
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
                        <button
                          onClick={() => openScanDetail(scan.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-400 border border-slate-700 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 text-sm">
            No scan logs found matching the selected filter query.
          </div>
        )}
      </div>

      {/* Detailed Report Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-4xl rounded-3xl border-slate-800 overflow-hidden shadow-2xl my-8">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                  <ShieldAlert className="w-6 h-6 text-cyan-400" />
                  <span>Scan Forensic Report #{selectedScan.scan_id}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Full breakdown of extracted indicators and threat score</p>
              </div>
              <button
                onClick={() => setSelectedScan(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400 mb-2">Email Payload Information</h4>
                  <div className="space-y-2 text-sm bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <p><strong className="text-slate-400 text-xs uppercase">Subject:</strong> <span className="text-white font-medium">{selectedScan.subject || 'N/A'}</span></p>
                    <p><strong className="text-slate-400 text-xs uppercase">Sender:</strong> <span className="text-cyan-400 font-mono">{selectedScan.sender_analysis?.sender_email}</span></p>
                    {selectedScan.sender_analysis?.reply_to_mismatch && (
                      <p className="text-xs text-red-400 font-bold">⚠️ Reply-To Mismatch Detected</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-center items-center">
                  <RiskGauge score={selectedScan.risk_score} level={selectedScan.risk_level} />
                </div>
              </div>

              {/* Recommendation */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <p className="font-bold text-slate-200 mb-1">Recommendation:</p>
                <p>{selectedScan.recommendation}</p>
              </div>

              {/* Indicators */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Security Indicators ({selectedScan.indicators?.length || 0})</h4>
                {selectedScan.indicators && selectedScan.indicators.length > 0 ? (
                  selectedScan.indicators.map((ind, i) => (
                    <IndicatorCard key={i} category={ind.category} severity={ind.severity} description={ind.description} />
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No security indicators recorded.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScanHistoryPage;
