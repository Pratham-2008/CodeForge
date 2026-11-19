import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  Check, 
  Code2, 
  Sparkles, 
  Cpu, 
  Globe, 
  Layers, 
  FileCode,
  FileText
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { SupportedLanguage } from '../../types';
import { LANGUAGES, LANGUAGE_MAP, getLanguageConfig } from '../../data/languages';

export const LanguageSelector: React.FC = () => {
  const { activeFile, setFileLanguage, addToast } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeFile) return null;

  const currentConfig = getLanguageConfig(activeFile.language);

  const filteredLanguages = LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    l.extension.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleSelectLanguage = (langId: SupportedLanguage, replaceContent = false) => {
    setFileLanguage(activeFile.id, langId, replaceContent);
    setIsOpen(false);
    setSearchFilter('');
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'web': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
      case 'wasm': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'backend': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      default: return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 text-slate-200 text-xs font-medium transition-all group focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
        title="Change programming language for active file"
      >
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="font-semibold text-white tracking-tight">{currentConfig.name}</span>
        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">{currentConfig.extension}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform ${isOpen ? 'rotate-180 text-cyan-400' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl z-50 overflow-hidden animate-fade-in divide-y divide-slate-800/80">
          {/* Top Filter Bar */}
          <div className="p-2.5 bg-slate-950/70">
            <input
              type="text"
              placeholder="Search 14 languages..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500 font-sans"
              autoFocus
            />
          </div>

          {/* Languages List */}
          <div className="max-h-80 overflow-y-auto p-1.5 space-y-1">
            {filteredLanguages.map(lang => {
              const isSelected = activeFile.language === lang.id;
              return (
                <div
                  key={lang.id}
                  onClick={() => handleSelectLanguage(lang.id, false)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer text-xs transition-all ${
                    isSelected 
                      ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-4 h-4 flex items-center justify-center font-mono font-bold text-[11px] text-cyan-400 flex-shrink-0">
                      {lang.extension.replace('.', '')}
                    </span>
                    <div className="truncate">
                      <span className="font-medium text-slate-100 mr-1.5">{lang.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({lang.extension})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${getCategoryColor(lang.category)}`}>
                      {lang.badgeText}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </div>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="p-3 text-center text-xs text-slate-500">
                No matching language found.
              </div>
            )}
          </div>

          {/* Bottom Action: Load Starter Code */}
          <div className="p-2 bg-slate-950/60 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Need starter code?</span>
            <button
              type="button"
              onClick={() => handleSelectLanguage(activeFile.language, true)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline flex items-center gap-1"
              title="Replace file contents with idiomatic starter code for this language"
            >
              <Sparkles className="w-3 h-3" />
              <span>Load Starter Code</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
