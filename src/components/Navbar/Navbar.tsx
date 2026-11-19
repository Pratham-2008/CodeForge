import React, { useState } from 'react';
import { 
  Play, 
  Square,
  RotateCw, 
  Save, 
  Download, 
  Moon, 
  Sun, 
  Maximize2, 
  Minimize2, 
  Keyboard, 
  Layout, 
  Terminal, 
  FolderPlus, 
  BookOpen, 
  Settings as SettingsIcon, 
  Home, 
  Code2, 
  FolderGit2,
  CheckCircle2,
  CircleDot,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  ChevronDown
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { ProfileModal } from '../Auth/ProfileModal';
import { getLanguageConfig } from '../../data/languages';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const {
    navView,
    setNavView,
    currentProject,
    renameProject,
    activeFile,
    runCode,
    stopCode,
    isRunning,
    executionStatus,
    refreshPreview,
    saveCurrentProject,
    hasUnsavedChanges,
    exportZip,
    downloadCurrentFile,
    themeMode,
    toggleThemeMode,
    previewOpen,
    togglePreview,
    previewTab,
    setPreviewTab,
    isFullscreen,
    toggleFullscreen,
    setShowShortcutsModal,
    setShowNewProjectModal
  } = useProject();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentProject?.name || '');

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== currentProject.name) {
      renameProject(currentProject.id, titleInput.trim());
    }
  };

  return (
    <header className="h-14 bg-slate-900/95 dark:bg-[#0c1017]/95 backdrop-blur border-b border-slate-800 dark:border-slate-800/80 px-4 flex items-center justify-between select-none z-30 transition-colors">
      {/* Left: Brand + Project Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setNavView('home')}
          className="flex items-center gap-2.5 group focus:outline-none"
          title="Return to Home Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
              <Code2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-base tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              CodeForge
            </span>
          </div>
        </button>

        <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

        {/* Project Name & Status */}
        {navView === 'editor' && currentProject && (
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleTitleSubmit();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                autoFocus
                className="bg-slate-800 text-slate-100 text-xs px-2.5 py-1 rounded border border-cyan-500/50 outline-none w-48 font-medium"
              />
            ) : (
              <button
                onClick={() => {
                  setTitleInput(currentProject.name);
                  setIsEditingTitle(true);
                }}
                className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60 transition-colors flex items-center gap-1.5 group max-w-[200px] truncate"
                title="Click to rename project"
              >
                <span className="truncate">{currentProject.name}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-400 font-mono">✎</span>
              </button>
            )}

            {/* Unsaved indicator */}
            {hasUnsavedChanges ? (
              <span 
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"
                title="Unsaved changes (Auto-saving...)"
              >
                <CircleDot className="w-2.5 h-2.5 animate-pulse" />
                <span className="hidden md:inline">Unsaved</span>
              </span>
            ) : (
              <span 
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                title="All changes saved to browser storage"
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span className="hidden md:inline">Saved</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Middle: Main Navigation Tabs */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800/70">
        <button
          onClick={() => setNavView('home')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            navView === 'home'
              ? 'bg-cyan-500/15 text-cyan-400 shadow-sm border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setNavView('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            navView === 'editor'
              ? 'bg-cyan-500/15 text-cyan-400 shadow-sm border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>

        <button
          onClick={() => setNavView('projects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            navView === 'projects'
              ? 'bg-cyan-500/15 text-cyan-400 shadow-sm border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => setNavView('docs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            navView === 'docs'
              ? 'bg-cyan-500/15 text-cyan-400 shadow-sm border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Documentation</span>
        </button>

        <button
          onClick={() => setNavView('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            navView === 'settings'
              ? 'bg-cyan-500/15 text-cyan-400 shadow-sm border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>

        {user?.role === 'Admin' && (
          <button
            onClick={() => setNavView('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              navView === 'admin'
                ? 'bg-indigo-500/25 text-indigo-300 shadow-sm border border-indigo-500/40'
                : 'text-indigo-400 hover:text-indigo-200 hover:bg-indigo-500/10 border border-indigo-500/20'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Admin</span>
          </button>
        )}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {navView === 'editor' && (
          <>
            {/* Run / Stop Button */}
            {isRunning ? (
              <button
                onClick={stopCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/30 active:scale-95 transition-all animate-pulse"
                title="Stop Execution (Interrupt)"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
                {executionStatus && (
                  <span className="hidden xl:inline text-[10px] text-rose-200 ml-1 font-mono max-w-[120px] truncate">
                    ({executionStatus})
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={runCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
                title={`Run ${activeFile ? getLanguageConfig(activeFile.language).name : 'Code'} (Ctrl + Enter)`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
                {activeFile && (
                  <span className="hidden sm:inline font-mono text-[11px] opacity-80">
                    {getLanguageConfig(activeFile.language).name}
                  </span>
                )}
                <kbd className="hidden md:inline-block text-[9px] bg-emerald-950/40 text-emerald-100 px-1 py-0.5 rounded ml-0.5 font-mono">
                  ^↵
                </kbd>
              </button>
            )}

            {/* Save Button */}
            <button
              onClick={saveCurrentProject}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/70 text-xs font-medium flex items-center gap-1.5 border border-slate-700/60 transition-all"
              title="Save All Files (Ctrl + S)"
            >
              <Save className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Save</span>
            </button>

            {/* Export ZIP */}
            <button
              onClick={exportZip}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/70 text-xs font-medium flex items-center gap-1.5 border border-slate-700/60 transition-all"
              title="Export Project as ZIP"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Export ZIP</span>
            </button>

            {/* Split layout toggle preview */}
            <button
              onClick={togglePreview}
              className={`p-1.5 rounded-md border transition-all ${
                previewOpen 
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' 
                  : 'text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
              title="Toggle Live Preview & Console Panel"
            >
              <Layout className="w-4 h-4" />
            </button>
          </>
        )}

        {navView !== 'editor' && (
          <button
            onClick={() => setNavView('editor')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Open Editor</span>
          </button>
        )}

        {/* Shortcuts */}
        <button
          onClick={() => setShowShortcutsModal(true)}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-slate-700/60 transition-all hidden md:flex"
          title="Keyboard Shortcuts (Ctrl+K)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleThemeMode}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-slate-700/60 transition-all"
          title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {themeMode === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-slate-700/60 transition-all hidden sm:flex"
          title="Toggle Fullscreen Mode"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-0.5 hidden sm:block" />

        {/* User Auth Controls */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-left"
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] uppercase shrink-0 ${
                user.role === 'Admin' ? 'bg-indigo-500/25 text-indigo-300' : 'bg-cyan-500/25 text-cyan-300'
              }`}>
                {user.fullName.slice(0, 2)}
              </div>
              <div className="hidden lg:flex flex-col min-w-0">
                <span className="text-xs font-medium text-slate-200 leading-tight max-w-[90px] truncate">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-slate-400 leading-none">
                  {user.role}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {userDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs animate-fadeIn">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <div className="font-semibold text-white truncate">{user.fullName}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                      user.role === 'Admin'
                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {user.role} Account
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Profile & Password</span>
                  </button>

                  {user.role === 'Admin' && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setNavView('admin');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-500/20 transition-colors text-left"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Admin Dashboard</span>
                    </button>
                  )}

                  <div className="h-[1px] bg-slate-800 my-1" />

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                      setNavView('login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setNavView('login')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all border border-slate-700/60"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => setNavView('signup')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Up</span>
            </button>
          </div>
        )}
      </div>

      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </header>
  );
};
