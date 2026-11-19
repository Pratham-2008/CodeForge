import React from 'react';
import { 
  Files, 
  Search, 
  FolderGit2, 
  Settings as SettingsIcon, 
  BookOpen, 
  Keyboard, 
  Terminal, 
  Layout, 
  Play
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { SidebarTab } from '../../types';

export const ActivityBar: React.FC = () => {
  const {
    sidebarOpen,
    setSidebarOpen,
    activeSidebarTab,
    setActiveSidebarTab,
    previewOpen,
    togglePreview,
    previewTab,
    setPreviewTab,
    setShowShortcutsModal,
    setNavView,
    logs
  } = useProject();

  const handleTabClick = (tab: SidebarTab) => {
    if (sidebarOpen && activeSidebarTab === tab) {
      setSidebarOpen(false);
    } else {
      setActiveSidebarTab(tab);
      setSidebarOpen(true);
    }
  };

  const errorCount = logs.filter(l => l.type === 'error').length;

  return (
    <aside className="w-12 bg-slate-950 dark:bg-[#070a10] border-r border-slate-800/80 flex flex-col items-center justify-between py-3 select-none z-20 flex-shrink-0">
      {/* Top Activity Icons */}
      <div className="flex flex-col items-center gap-2">
        {/* Explorer */}
        <button
          onClick={() => handleTabClick('explorer')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            sidebarOpen && activeSidebarTab === 'explorer'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="File Explorer (Ctrl+B)"
        >
          <Files className="w-4 h-4" />
        </button>

        {/* Search */}
        <button
          onClick={() => handleTabClick('search')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            sidebarOpen && activeSidebarTab === 'search'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Search in Files"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Projects View */}
        <button
          onClick={() => setNavView('projects')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all"
          title="Project Manager"
        >
          <FolderGit2 className="w-4 h-4" />
        </button>

        {/* Console / Terminal Shortcut */}
        <button
          onClick={() => {
            if (!previewOpen) togglePreview();
            setPreviewTab('console');
          }}
          className={`w-9 h-9 rounded-xl flex items-center justify-center relative transition-all ${
            previewOpen && previewTab === 'console'
              ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Console & Logs Panel"
        >
          <Terminal className="w-4 h-4" />
          {logs.length > 0 && (
            <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
              errorCount > 0 ? 'bg-red-400' : 'bg-cyan-400'
            }`} />
          )}
        </button>
      </div>

      {/* Bottom Utility Icons */}
      <div className="flex flex-col items-center gap-2">
        {/* Shortcuts */}
        <button
          onClick={() => setShowShortcutsModal(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all"
          title="Keyboard Shortcuts (Ctrl+K)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Documentation */}
        <button
          onClick={() => setNavView('docs')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all"
          title="Documentation & Guide"
        >
          <BookOpen className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={() => setNavView('settings')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-all"
          title="Editor Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
