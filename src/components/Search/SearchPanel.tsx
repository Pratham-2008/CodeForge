import React from 'react';
import { Search, FileCode, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const SearchPanel: React.FC = () => {
  const { searchTerm, setSearchTerm, searchResults, openFile } = useProject();

  return (
    <div className="h-full flex flex-col bg-slate-900/90 dark:bg-[#0e131d] border-r border-slate-800/80 text-xs text-slate-300 select-none">
      {/* Header */}
      <div className="h-9 px-3 border-b border-slate-800/70 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400">
        <span>Search in Project</span>
      </div>

      {/* Input */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950 rounded border border-slate-700/80 focus-within:border-cyan-500 transition-colors">
          <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-xs outline-none"
          />
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {!searchTerm.trim() ? (
          <div className="p-4 text-center text-slate-500 text-xs">
            Type in search query above to inspect files across your project.
          </div>
        ) : searchResults.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs">
            No matching results found for "{searchTerm}".
          </div>
        ) : (
          searchResults.map(({ file, matches }) => (
            <div key={file.id} className="bg-slate-950/40 rounded border border-slate-800/60 overflow-hidden">
              <div 
                onClick={() => openFile(file.id)}
                className="px-2.5 py-1.5 bg-slate-800/50 flex items-center justify-between text-slate-200 cursor-pointer hover:bg-slate-800 transition-colors font-medium"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <FileCode className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded">
                  {matches.length}
                </span>
              </div>

              <div className="p-1 divide-y divide-slate-800/40 font-mono text-[11px]">
                {matches.map((m, idx) => (
                  <div
                    key={idx}
                    onClick={() => openFile(file.id)}
                    className="p-1.5 hover:bg-slate-800/60 cursor-pointer rounded flex items-start gap-2 text-slate-300"
                  >
                    <span className="text-slate-500 flex-shrink-0 w-6 text-right">
                      {m.line}:
                    </span>
                    <span className="truncate flex-1 text-slate-300">
                      {m.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
