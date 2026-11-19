import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useProject();

  if (toasts.length === 0) return null;

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      default: return <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />;
    }
  };

  const getToastStyle = (type: string) => {
    switch (type) {
      case 'success': return 'border-emerald-500/40 bg-slate-900/95 text-emerald-200';
      case 'error': return 'border-red-500/40 bg-slate-900/95 text-red-200';
      case 'warning': return 'border-amber-500/40 bg-slate-900/95 text-amber-200';
      default: return 'border-cyan-500/40 bg-slate-900/95 text-slate-200';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none select-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-3 rounded-xl border shadow-xl backdrop-blur flex items-center justify-between gap-3 text-xs transition-all animate-slide-in ${getToastStyle(toast.type)}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {getToastIcon(toast.type)}
            <span className="truncate">{toast.text}</span>
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
