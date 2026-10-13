import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Activity, Cpu, Lock, Search, FileText, CheckCircle2, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="space-y-24 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-inner">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-Powered Defensive Cybersecurity Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-6">
            AI-Based Phishing Email Detection & <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">Risk Analysis System</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal mb-10">
            Defend against spear-phishing campaigns, credential harvesting, and social engineering attacks using TF-IDF Machine Learning classifiers, static URL heuristics, and explainable threat indicators.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/scanner"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>Analyze Email Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-600 font-bold text-base transition-all"
            >
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>View Dashboard</span>
            </Link>
          </div>

          {/* Quick Metrics Pill Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl font-black text-cyan-400">96.8%</p>
              <p className="text-xs text-slate-400 font-medium mt-1">ML Model F1-Score</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl font-black text-emerald-400">0–100</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Precise Risk Score</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl font-black text-amber-400">Static</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Non-Execution URL Check</p>
            </div>
            <div className="glass-card p-4 rounded-xl text-center">
              <p className="text-2xl font-black text-blue-400">Explainable</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Severity Threat Badges</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Comprehensive Cybersecurity Analysis Stack
          </h2>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto text-sm">
            Built with modern security techniques to detect malicious emails before credentials or sensitive data are compromised.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Multi-Model Machine Learning</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Trains Logistic Regression, Random Forest, and Linear SVM classifiers on TF-IDF word & bigram features, selecting the top model based on real validation metrics.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Static URL & Domain Heuristics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Safely inspects link lengths, dot counts, hyphens, subdomains, IP hosts, URL shorteners, and typosquatting lookalike domains (e.g. paypa1.com) without executing malicious code.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Explainable Risk Scoring</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Provides detailed severity badges (HIGH, MEDIUM, LOW) and a 0–100 risk score breakdown explaining exactly why an email was classified as Phishing, Suspicious, or Safe.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-900/40 py-16 rounded-3xl border border-slate-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">How The Threat Engine Works</h2>
          <p className="text-slate-400 mt-2 text-sm">Four seamless steps from email ingestion to actionable intelligence report.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-3 p-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-sm">1</div>
            <h4 className="font-bold text-white text-base">Ingest Email Payload</h4>
            <p className="text-slate-400 text-xs leading-relaxed">Submit sender address, subject line, body text, and optional raw email headers.</p>
          </div>

          <div className="space-y-3 p-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-sm">2</div>
            <h4 className="font-bold text-white text-base">NLP & Static Extraction</h4>
            <p className="text-slate-400 text-xs leading-relaxed">Cleans tokens, extracts embedded URLs, identifies urgency phrases, and checks sender syntax.</p>
          </div>

          <div className="space-y-3 p-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-sm">3</div>
            <h4 className="font-bold text-white text-base">ML Inference Model</h4>
            <p className="text-slate-400 text-xs leading-relaxed">Evaluates TF-IDF vector matrix through trained Scikit-Learn model to predict phishing probability.</p>
          </div>

          <div className="space-y-3 p-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-sm">4</div>
            <h4 className="font-bold text-white text-base">Generate Risk Report</h4>
            <p className="text-slate-400 text-xs leading-relaxed">Outputs 0-100 risk score, explainable threat badges, URL breakdown, and security recommendations.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
