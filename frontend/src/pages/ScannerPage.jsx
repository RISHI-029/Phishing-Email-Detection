import React, { useState } from 'react';
import { ShieldAlert, Send, Sparkles, AlertTriangle, Link2, Mail, CheckCircle2, Copy, FileText, ChevronDown, ChevronUp, RefreshCw, Zap } from 'lucide-react';
import RiskGauge from '../components/RiskGauge';
import IndicatorCard from '../components/IndicatorCard';
import { analysisAPI } from '../services/api';

const ScannerPage = () => {
  const [sender, setSender] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [rawHeaders, setRawHeaders] = useState('');
  const [urls, setUrls] = useState('');
  const [showHeadersInput, setShowHeadersInput] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Sample email prefill buttons for easy testing
  const loadPhishingSample = () => {
    setSender('security-update@paypa1-account-verification.com');
    setReplyTo('hacker-collect@gmail.com');
    setSubject('URGENT: Your Account Has Been Restricted!');
    setBody('Dear customer, Unusual sign-in activity was detected on your account. You must verify your credentials immediately at http://paypa1-account-verification.com/reset to prevent permanent suspension.');
    setUrls('http://paypa1-account-verification.com/reset');
    setRawHeaders('From: security-update@paypa1-account-verification.com\nReply-To: hacker-collect@gmail.com\nReceived: from 192.168.1.1\nAuthentication-Results: spf=fail; dkim=fail;');
    setResult(null);
    setError(null);
  };

  const loadSafeSample = () => {
    setSender('project-lead@company.com');
    setReplyTo('');
    setSubject('Quarterly Team Meeting Agenda');
    setBody('Hello everyone, The Q3 project sync will take place tomorrow at 10 AM in Conference Room B. Please review the attached agenda before joining.');
    setUrls('');
    setRawHeaders('From: project-lead@company.com\nReceived: from mail.company.com\nAuthentication-Results: spf=pass; dkim=pass; dmarc=pass;');
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!sender.trim() || !subject.trim() || !body.trim()) {
      setError('Please provide at least Sender Email, Subject, and Email Body.');
      return;
    }

    setLoading(true);
    setError(null);

    // Split manually entered URLs
    const urlList = urls
      ? urls.split(',').map((u) => u.trim()).filter((u) => u.length > 0)
      : [];

    try {
      const payload = {
        sender: sender.trim(),
        reply_to: replyTo.trim() || null,
        subject: subject.trim(),
        body: body.trim(),
        urls: urlList.length > 0 ? urlList : null,
        raw_headers: rawHeaders.trim() || null,
      };

      const res = await analysisAPI.analyzeEmail(payload);
      setResult(res.data);
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.response?.data?.detail || 'Unable to analyze email. Please verify inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center space-x-3">
            <ShieldAlert className="w-8 h-8 text-cyan-400" />
            <span>Phishing Email Threat Scanner</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Perform static feature analysis, ML classification, static URL inspection, and risk scoring.
          </p>
        </div>

        {/* Preset Sample Buttons */}
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={loadPhishingSample}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold transition-all flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Sample Phishing Email</span>
          </button>
          <button
            type="button"
            onClick={loadSafeSample}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all flex items-center space-x-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sample Safe Email</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Column */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleAnalyze} className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center space-x-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              <span>Email Content Input</span>
            </h2>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Sender & Reply-To */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Sender Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. security@paypa1-update.com"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                  Reply-To Email <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. collector@hacker.com"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Email Subject <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. URGENT: Account Suspended"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Email Body Text <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={6}
                placeholder="Paste the full body text of the email here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-500 outline-none transition-all resize-y"
              ></textarea>
            </div>

            {/* Manual URLs Input */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-300 mb-1">
                Extracted URLs <span className="text-slate-500 font-normal">(Auto-extracted or comma separated)</span>
              </label>
              <input
                type="text"
                placeholder="http://paypa1-update.com/login, http://verify-secure.net"
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Collapsible Headers Section */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHeadersInput(!showHeadersInput)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{showHeadersInput ? 'Hide Raw Email Headers' : 'Advanced: Paste Raw Email Headers (+SPF/DKIM)'}</span>
                {showHeadersInput ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showHeadersInput && (
                <div className="mt-3">
                  <textarea
                    rows={4}
                    placeholder="Paste raw MIME headers (From, Received, Authentication-Results)..."
                    value={rawHeaders}
                    onChange={(e) => setRawHeaders(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 placeholder-slate-600 outline-none"
                  ></textarea>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Running ML Threat Analysis...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Analyze Email</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-6 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Overall Result Banner & Risk Gauge */}
              <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-6">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Classification Result</span>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`text-2xl font-black px-4 py-1 rounded-xl border ${
                        result.prediction === 'PHISHING' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                        result.prediction === 'SUSPICIOUS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {result.prediction === 'PHISHING' ? '🔴 PHISHING' : result.prediction === 'SUSPICIOUS' ? '🟡 SUSPICIOUS' : '🟢 SAFE / LEGITIMATE'}
                      </span>
                    </div>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">ML Confidence</span>
                    <p className="text-2xl font-black text-cyan-400 mt-1">{Math.round(result.confidence * 100)}%</p>
                  </div>
                </div>

                {/* Risk Gauge Visual Component */}
                <div className="flex justify-center">
                  <RiskGauge score={result.risk_score} level={result.risk_level} />
                </div>

                {/* Recommendation Box */}
                <div className={`p-4 rounded-xl text-xs font-medium leading-relaxed border ${
                  result.risk_score > 60 ? 'bg-red-950/40 text-red-300 border-red-500/30' :
                  result.risk_score > 30 ? 'bg-amber-950/40 text-amber-300 border-amber-500/30' :
                  'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                }`}>
                  <p className="font-bold text-sm mb-1 uppercase tracking-wider">Security Recommendation</p>
                  <p>{result.recommendation}</p>
                </div>
              </div>

              {/* Explainable Suspicious Indicators */}
              <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Explainable Security Indicators ({result.indicators.length})</span>
                </h3>

                {result.indicators.length > 0 ? (
                  <div className="space-y-3">
                    {result.indicators.map((ind, idx) => (
                      <IndicatorCard key={idx} category={ind.category} severity={ind.severity} description={ind.description} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No suspicious security indicators flagged for this message.</p>
                )}
              </div>

              {/* Extracted URLs Analysis Breakdown */}
              {result.urls && result.urls.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Link2 className="w-5 h-5 text-cyan-400" />
                    <span>Extracted URL Analysis ({result.urls.length})</span>
                  </h3>

                  <div className="space-y-3">
                    {result.urls.map((u, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                        <div className="min-w-0 pr-4">
                          <p className="text-xs font-mono text-cyan-300 truncate">{u.url}</p>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-xs font-bold text-slate-300">{u.risk_score}/100</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            u.risk_score > 60 ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                            u.risk_score > 30 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {u.risk_level}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Header Authentication Status */}
              {result.header_analysis && (
                <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <span>Email Header Authentication</span>
                  </h3>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-[10px] uppercase font-bold text-slate-400">SPF</p>
                      <p className={`text-sm font-black mt-1 ${result.header_analysis.spf === 'PASS' ? 'text-emerald-400' : result.header_analysis.spf === 'FAIL' ? 'text-red-400' : 'text-slate-400'}`}>
                        {result.header_analysis.spf}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-[10px] uppercase font-bold text-slate-400">DKIM</p>
                      <p className={`text-sm font-black mt-1 ${result.header_analysis.dkim === 'PASS' ? 'text-emerald-400' : result.header_analysis.dkim === 'FAIL' ? 'text-red-400' : 'text-slate-400'}`}>
                        {result.header_analysis.dkim}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <p className="text-[10px] uppercase font-bold text-slate-400">DMARC</p>
                      <p className={`text-sm font-black mt-1 ${result.header_analysis.dmarc === 'PASS' ? 'text-emerald-400' : result.header_analysis.dmarc === 'FAIL' ? 'text-red-400' : 'text-slate-400'}`}>
                        {result.header_analysis.dmarc}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 rounded-2xl border-slate-800 text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready for Threat Analysis</h3>
              <p className="text-sm text-slate-400 max-w-md">
                Enter email details or click "Sample Phishing Email" above to trigger real-time ML classification and explainable security indicators.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
