import React from 'react';
import { AlertTriangle, ShieldAlert, AlertCircle, Info } from 'lucide-react';

const IndicatorCard = ({ category, severity, description }) => {
  const getSeverityStyle = () => {
    switch (severity?.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          badge: 'bg-red-950/80 text-red-400 border-red-500/40',
          icon: ShieldAlert,
          iconColor: 'text-red-400'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          badge: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
          icon: AlertTriangle,
          iconColor: 'text-amber-400'
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          badge: 'bg-blue-950/80 text-blue-400 border-blue-500/40',
          icon: Info,
          iconColor: 'text-blue-400'
        };
    }
  };

  const style = getSeverityStyle();
  const IconComponent = style.icon;

  return (
    <div className={`p-4 rounded-xl ${style.bg} border ${style.border} flex items-start space-x-3 transition-all hover:scale-[1.01]`}>
      <div className={`p-2 rounded-lg bg-slate-900/60 border border-slate-800 ${style.iconColor} shrink-0 mt-0.5`}>
        <IconComponent className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${style.badge}`}>
            {severity}
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
            {category}
          </span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </div>
  );
};

export default IndicatorCard;
