import React from 'react';
import { ShieldCheck, Cpu, Database, Lock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 mt-16 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-slate-200 tracking-wide">PhishGuard AI System</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              An advanced MCA Major Project integrating Machine Learning (TF-IDF, Logistic Regression, Random Forest, Linear SVM), static URL heuristics, and NLP pattern analysis to deliver defensive email threat intelligence.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Core Stack</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>FastAPI & Scikit-Learn</span>
              </li>
              <li className="flex items-center space-x-2">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>SQLAlchemy & SQLite DB</span>
              </li>
              <li className="flex items-center space-x-2">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>JWT & Bcrypt Hashing</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">Disclaimer</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Defensive static cybersecurity tool. All scans are non-executing. Results are heuristic and machine learning predictions designed for security analysis.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© 2026 PhishGuard AI System. MCA Cybersecurity Major Project.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              ● API Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
