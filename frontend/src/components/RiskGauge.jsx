import React from 'react';

const RiskGauge = ({ score = 0, level = 'LOW' }) => {
  // Determine color theme based on score & level
  const getColorScheme = () => {
    if (score <= 30) {
      return {
        stroke: '#10b981', // emerald
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        label: 'LOW RISK'
      };
    } else if (score <= 60) {
      return {
        stroke: '#f59e0b', // amber
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        label: 'MEDIUM RISK'
      };
    } else if (score <= 80) {
      return {
        stroke: '#f97316', // orange
        text: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        label: 'HIGH RISK'
      };
    } else {
      return {
        stroke: '#ef4444', // red
        text: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        label: 'CRITICAL RISK'
      };
    }
  };

  const scheme = getColorScheme();
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl ${scheme.bg} border ${scheme.border} relative overflow-hidden`}>
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* SVG Circular Progress Meter */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="text-slate-800"
            strokeWidth="10"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={scheme.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-black ${scheme.text}`}>{score}</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">/ 100</span>
        </div>
      </div>

      <div className="mt-4 text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
          {level} RISK
        </span>
      </div>
    </div>
  );
};

export default RiskGauge;
