import React, { useState, useRef, useEffect } from 'react';
import { 
  Trash2, 
  Terminal, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Search, 
  CornerDownLeft, 
  Sparkles,
  Filter,
  Square,
  RotateCw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { ConsoleLog } from '../../types';

export const ConsolePanel: React.FC = () => {
  const { 
    logs, 
    clearLogs, 
    previewTab, 
    setPreviewTab, 
    addToast,
    isRunning,
    stopCode,
    executionStatus,
    stdin,
    setStdin
  } = useProject();

  const [filterType, setFilterType] = useState<string>('all');
  const [logFilterQuery, setLogFilterQuery] = useState<string>('');
  const [replInput, setReplInput] = useState<string>('');
  const [showStdin, setShowStdin] = useState<boolean>(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all' && log.type !== filterType) return false;
    if (logFilterQuery.trim()) {
      const q = logFilterQuery.toLowerCase();
      const stringified = JSON.stringify(log.args).toLowerCase();
      return stringified.includes(q);
    }
    return true;
  });

  const handleReplSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replInput.trim()) return;

    const inputCode = replInput.trim();
    setReplInput('');

    try {
      const iframe = document.querySelector('iframe') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          const win = iframe.contentWindow as any;
          const evalResult = win.Function('"use strict"; return (' + inputCode + ')')();
          console.log(`> ${inputCode}`);
          if (evalResult !== undefined) {
            console.log(evalResult);
          }
        } catch (evalErr: any) {
          console.error(`> ${inputCode}\n${evalErr.message}`);
        }
      } else {
        const executeFn = new Function('"use strict"; return (' + inputCode + ')');
        const result = executeFn();
        console.log(`> ${inputCode}`);
        if (result !== undefined) console.log(result);
      }
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const getLogIcon = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error': return <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />;
      case 'warn': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />;
      case 'info': return <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />;
      case 'system': return <Sparkles className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />;
      default: return <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] text-slate-500 font-mono flex-shrink-0">›</span>;
    }
  };

  const getLogRowStyle = (type: ConsoleLog['type']) => {
    switch (type) {
      case 'error': return 'bg-red-500/10 text-red-300 border-l-2 border-red-500';
      case 'warn': return 'bg-amber-500/10 text-amber-300 border-l-2 border-amber-500';
      case 'info': return 'bg-blue-500/10 text-blue-300 border-l-2 border-blue-500';
      case 'system': return 'bg-cyan-500/10 text-cyan-300 border-l-2 border-cyan-500';
      default: return 'text-slate-300 hover:bg-slate-800/40 border-l-2 border-transparent';
    }
  };

  const formatArg = (arg: any) => {
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 dark:bg-[#080c14] border-t border-slate-800/80 font-mono text-xs select-none">
      {/* Console Top Toolbar */}
      <div className="h-9 px-3 bg-slate-900/90 dark:bg-[#0d121c] border-b border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-1">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] tracking-wide uppercase">Console Output</span>
          </div>

          {/* Running Spinner Indicator */}
          {isRunning && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-sans">
              <RotateCw className="w-3 h-3 animate-spin" />
              <span className="truncate max-w-[150px]">{executionStatus || 'Running...'}</span>
            </div>
          )}

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Filter Pills */}
          <div className="hidden sm:flex items-center gap-1">
            {['all', 'log', 'info', 'warn', 'error'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2 py-0.5 rounded text-[10px] capitalize transition-colors ${
                  filterType === t
                    ? 'bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-1.5">
          {/* Stdin Toggle Button */}
          <button
            onClick={() => setShowStdin(prev => !prev)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-sans border transition-all ${
              showStdin || stdin.trim()
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-semibold'
                : 'text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
            }`}
            title="Configure Standard Input (stdin) for programs expecting user input"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Stdin</span>
            {stdin.trim() && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            {showStdin ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {/* Stop Button (When executing) */}
          {isRunning && (
            <button
              onClick={stopCode}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-sans font-semibold text-[10px] transition-all"
              title="Stop execution"
            >
              <Square className="w-2.5 h-2.5 fill-current" />
              <span>Stop</span>
            </button>
          )}

          {/* Search inside logs */}
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300">
            <Search className="w-3 h-3 text-slate-500" />
            <input
              type="text"
              placeholder="Filter..."
              value={logFilterQuery}
              onChange={e => setLogFilterQuery(e.target.value)}
              className="bg-transparent text-[11px] outline-none w-16 lg:w-24 text-slate-200 placeholder:text-slate-600 font-sans"
            />
          </div>

          {/* Clear Output Button */}
          <button
            onClick={clearLogs}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors text-[10px] font-sans"
            title="Clear all console logs and output"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear Output</span>
          </button>
        </div>
      </div>

      {/* Standard Input (Stdin) Drawer */}
      {showStdin && (
        <div className="p-2.5 bg-slate-900 border-b border-slate-800 text-xs animate-slide-in">
          <div className="flex items-center justify-between mb-1.5 font-sans">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
              <FileText className="w-3.5 h-3.5" />
              <span>Standard Input (stdin)</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Passed to input(), scanf(), cin, fgets(), etc.
            </span>
          </div>
          <textarea
            value={stdin}
            onChange={e => setStdin(e.target.value)}
            placeholder="Type input values here (one per line)..."
            rows={2}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none focus:border-amber-400 placeholder:text-slate-600 resize-y"
          />
        </div>
      )}

      {/* Logs Stream Container */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[12px] select-text">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 select-none text-xs">
            <Terminal className="w-6 h-6 mb-2 opacity-40 text-cyan-400" />
            <p>No console messages captured.</p>
            <p className="text-[11px] text-slate-600 mt-1">Output from code execution, print statements, and compiler logs will appear here.</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className={`p-1.5 rounded flex items-start gap-2.5 leading-relaxed transition-colors ${getLogRowStyle(log.type)}`}
            >
              {getLogIcon(log.type)}

              <div className="flex-1 min-w-0 break-words whitespace-pre-wrap">
                {log.args.map((arg, idx) => (
                  <span key={idx} className="mr-2">
                    {formatArg(arg)}
                  </span>
                ))}
              </div>

              {/* Repetition badge */}
              {log.count > 1 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-bold text-cyan-400 border border-slate-700">
                  {log.count}
                </span>
              )}

              {/* Timestamp */}
              <span className="text-[10px] text-slate-500 select-none flex-shrink-0 font-sans">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>

      {/* Interactive JavaScript REPL Input */}
      <form onSubmit={handleReplSubmit} className="h-9 px-3 bg-slate-900/90 dark:bg-[#0d121c] border-t border-slate-800/80 flex items-center gap-2 select-none">
        <span className="text-cyan-400 font-bold text-xs select-none">›</span>
        <input
          type="text"
          placeholder="Evaluate JavaScript expression in preview context (e.g. document.title or 2+2)..."
          value={replInput}
          onChange={e => setReplInput(e.target.value)}
          className="flex-1 bg-transparent text-xs text-slate-100 placeholder:text-slate-600 outline-none font-mono"
        />
        <button
          type="submit"
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition-colors"
          title="Execute expression (Enter)"
        >
          <CornerDownLeft className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
