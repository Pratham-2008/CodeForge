import React, { useState, useRef } from 'react';
import { 
  RotateCw, 
  ExternalLink, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Play, 
  Sparkles, 
  Maximize2,
  Terminal,
  CheckCircle2
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export const LivePreview: React.FC = () => {
  const { 
    executionHtml, 
    refreshPreview, 
    isRunning, 
    previewTab, 
    setPreviewTab,
    logs
  } = useProject();

  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const errorCount = logs.filter(l => l.type === 'error').length;
  const warnCount = logs.filter(l => l.type === 'warn').length;

  const handleOpenInNewTab = () => {
    const blob = new Blob([executionHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      default: return '100%';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 dark:bg-[#090d14] overflow-hidden border-l border-slate-800/80">
      {/* Top Preview Control Header Bar */}
      <div className="h-10 bg-slate-900/90 dark:bg-[#0d121c] border-b border-slate-800/80 px-3 flex items-center justify-between text-xs select-none">
        {/* Left: Live status + tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewTab('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${
              previewTab === 'preview'
                ? 'bg-cyan-500/15 text-cyan-400 font-medium border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Preview</span>
          </button>

          <button
            onClick={() => setPreviewTab('console')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all ${
              previewTab === 'console'
                ? 'bg-cyan-500/15 text-cyan-400 font-medium border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Console</span>
            {logs.length > 0 && (
              <span className={`text-[10px] px-1.5 rounded-full font-mono ${
                errorCount > 0 
                  ? 'bg-red-500/20 text-red-400 font-bold' 
                  : 'bg-slate-800 text-slate-300'
              }`}>
                {logs.length}
              </span>
            )}
          </button>
        </div>

        {/* Middle: Simulated Browser Address Bar */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950/70 border border-slate-800/70 text-[11px] text-slate-400 font-mono max-w-[240px] truncate">
          <span className="text-emerald-400">🔒</span>
          <span className="truncate">codeforge://preview/index.html</span>
        </div>

        {/* Right: Viewport Controls & Refresh */}
        <div className="flex items-center gap-1">
          {/* Responsive viewport toggles */}
          <div className="flex items-center bg-slate-950/50 p-0.5 rounded border border-slate-800 hidden md:flex">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1 rounded ${viewport === 'desktop' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1 rounded ${viewport === 'tablet' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1 rounded ${viewport === 'mobile' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'}`}
              title="Mobile View (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={refreshPreview}
            disabled={isRunning}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition-colors"
            title="Refresh Live Preview"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Open in new window */}
          <button
            onClick={handleOpenInNewTab}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Open preview in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Preview Iframe Container */}
      <div className="flex-1 bg-slate-950/80 flex items-center justify-center p-2 relative overflow-auto">
        <div
          className="h-full bg-white transition-all duration-300 rounded shadow-2xl relative overflow-hidden flex flex-col"
          style={{ width: getViewportWidth(), maxWidth: '100%' }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={executionHtml}
            title="CodeForge Live Preview"
            sandbox="allow-scripts allow-modals allow-popups allow-forms allow-same-origin"
            className="w-full h-full border-none bg-white"
          />
        </div>
      </div>
    </div>
  );
};
