import React from 'react';
import { 
  X, 
  Plus, 
  CircleDot, 
  Code, 
  FileCode, 
  Sparkles, 
  Copy, 
  Download, 
  Maximize2 
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { FileItem, SupportedLanguage } from '../../types';
import { LanguageSelector } from './LanguageSelector';

export const EditorTabs: React.FC<{ onFormat?: () => void }> = ({ onFormat }) => {
  const {
    currentProject,
    openFiles,
    activeFile,
    openFile,
    closeFile,
    createFile,
    downloadCurrentFile,
    addToast
  } = useProject();

  const handleCopyContent = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content);
      addToast(`Copied ${activeFile.name} content to clipboard`, 'success');
    }
  };

  const getFileBadge = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html': return <span className="text-orange-400 font-bold text-[10px] font-mono">H</span>;
      case 'css': return <span className="text-cyan-400 font-bold text-[10px] font-mono">#</span>;
      case 'js': return <span className="text-amber-300 font-bold text-[10px] font-mono">JS</span>;
      case 'ts': return <span className="text-blue-400 font-bold text-[10px] font-mono">TS</span>;
      case 'py': return <span className="text-emerald-400 font-bold text-[10px] font-mono">PY</span>;
      case 'c': return <span className="text-blue-400 font-bold text-[10px] font-mono">C</span>;
      case 'cpp': return <span className="text-cyan-300 font-bold text-[10px] font-mono">C++</span>;
      case 'java': return <span className="text-red-400 font-bold text-[10px] font-mono">JV</span>;
      case 'php': return <span className="text-indigo-400 font-bold text-[10px] font-mono">PHP</span>;
      case 'sql': return <span className="text-teal-400 font-bold text-[10px] font-mono">SQL</span>;
      case 'go': return <span className="text-cyan-400 font-bold text-[10px] font-mono">GO</span>;
      case 'rs':
      case 'rust': return <span className="text-orange-400 font-bold text-[10px] font-mono">RS</span>;
      case 'json': return <span className="text-rose-400 font-bold text-[10px] font-mono">{}</span>;
      case 'md': return <span className="text-purple-400 font-bold text-[10px] font-mono">M↓</span>;
      default: return <FileCode className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="h-10 bg-slate-900/90 dark:bg-[#0c1017] border-b border-slate-800/80 flex items-center justify-between select-none overflow-hidden">
      {/* Open tabs scrollable container */}
      <div className="flex items-center h-full overflow-x-auto no-scrollbar flex-1">
        {openFiles.map(file => {
          const isActive = activeFile?.id === file.id;
          return (
            <div
              key={file.id}
              onClick={() => openFile(file.id)}
              className={`group flex items-center gap-2 h-full px-3 text-xs border-r border-slate-800/70 cursor-pointer transition-colors max-w-[200px] flex-shrink-0 relative ${
                isActive
                  ? 'bg-slate-950/70 dark:bg-[#131926] text-cyan-400 font-medium border-t-2 border-t-cyan-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                {getFileBadge(file.name)}
              </span>

              <span className="truncate">{file.name}</span>

              {/* Dirty indicator / Close Button */}
              <div className="flex items-center ml-1">
                {file.isDirty ? (
                  <span
                    className="w-2 h-2 rounded-full bg-cyan-400 group-hover:hidden transition-all"
                    title="Unsaved changes"
                  />
                ) : null}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(file.id);
                  }}
                  className={`p-0.5 rounded-sm hover:bg-slate-700/80 text-slate-400 hover:text-white transition-opacity ${
                    file.isDirty ? 'hidden group-hover:block' : 'opacity-60 group-hover:opacity-100'
                  }`}
                  title="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {/* New file quick plus button */}
        <button
          onClick={() => {
            const name = prompt('Enter new file name:');
            if (name && name.trim()) {
              createFile(name.trim());
            }
          }}
          className="p-2 h-full flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
          title="New File"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Tab Bar Utilities */}
      {activeFile && (
        <div className="flex items-center gap-1.5 px-3 flex-shrink-0 text-xs">
          <LanguageSelector />

          {onFormat && (
            <button
              onClick={onFormat}
              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition-colors"
              title="Format Code (Prettier / Monaco)"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={handleCopyContent}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy file contents"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={downloadCurrentFile}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
