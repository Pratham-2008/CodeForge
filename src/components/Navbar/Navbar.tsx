import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Save, 
  Download, 
  Moon, 
  Sun, 
  Maximize2, 
  Minimize2, 
  Keyboard, 
  Layout, 
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
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import { ProfileModal } from '../Auth/ProfileModal';
import { getLanguageConfig } from '../../data/languages';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    saveCurrentProject,
    hasUnsavedChanges,
    exportZip,
    themeMode,
    toggleThemeMode,
    previewOpen,
    togglePreview,
    isFullscreen,
    toggleFullscreen,
    setShowShortcutsModal
  } = useProject();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(currentProject?.name || '');
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== currentProject?.name) {
      renameProject(currentProject.id, titleInput.trim());
    }
  };

  const handleNavigate = (view: any) => {
    setNavView(view);
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="h-14 bg-slate-900/95 dark:bg-[#0c1017]/95 backdrop-blur border-b border-slate-800 dark:border-slate-800/80 px-3 sm:px-4 flex items-center justify-between select-none z-30 transition-colors relative">
      {/* ============================================================ */}
      {/* LEFT: Brand Logo & Project Title (Editor view)               */}
      {/* ============================================================ */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button 
          onClick={() => handleNavigate('home')}
          className="flex items-center gap-2.5 group focus:outline-none shrink-0"
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

        {/* Project Name & Save Status when in Editor */}
        {navView === 'editor' && currentProject && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block shrink-0" />
            
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
                className="bg-slate-800 text-slate-100 text-xs px-2.5 py-1 rounded border border-cyan-500/50 outline-none w-36 sm:w-48 font-medium"
              />
            ) : (
              <button
                onClick={() => {
                  setTitleInput(currentProject.name);
                  setIsEditingTitle(true);
                }}
                className="text-xs font-medium text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60 transition-colors flex items-center gap-1.5 group max-w-[140px] sm:max-w-[200px] truncate"
                title="Click to rename project"
              >
                <span className="truncate">{currentProject.name}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-slate-400 font-mono">✎</span>
              </button>
            )}

            {/* Unsaved / Saved indicator */}
            {hasUnsavedChanges ? (
              <span 
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0"
                title="Unsaved changes (Auto-saving...)"
              >
                <CircleDot className="w-2.5 h-2.5 animate-pulse" />
                <span className="hidden md:inline">Unsaved</span>
              </span>
            ) : (
              <span 
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0"
                title="All changes saved to storage"
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span className="hidden md:inline">Saved</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* CENTER: Main Navigation Tabs (Desktop & Tablet)              */}
      {/* ============================================================ */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 shadow-inner">
        <button
          onClick={() => handleNavigate('home')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            navView === 'home'
              ? 'bg-cyan-500/15 text-cyan-400 font-semibold shadow-sm border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNavigate('editor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            navView === 'editor'
              ? 'bg-cyan-500/15 text-cyan-400 font-semibold shadow-sm border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>

        <button
          onClick={() => handleNavigate('projects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            navView === 'projects'
              ? 'bg-cyan-500/15 text-cyan-400 font-semibold shadow-sm border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects</span>
        </button>

        <button
          onClick={() => handleNavigate('docs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            navView === 'docs'
              ? 'bg-cyan-500/15 text-cyan-400 font-semibold shadow-sm border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Documentation</span>
        </button>

        <button
          onClick={() => handleNavigate('settings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            navView === 'settings'
              ? 'bg-cyan-500/15 text-cyan-400 font-semibold shadow-sm border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>

        {user?.role === 'Admin' && (
          <button
            onClick={() => handleNavigate('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

      {/* ============================================================ */}
      {/* RIGHT: Actions + Auth + Hamburger Menu Button               */}
      {/* ============================================================ */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Editor-specific quick toolbar: Run / Save / Preview */}
        {navView === 'editor' && (
          <div className="flex items-center gap-1.5">
            {/* Run / Stop Button */}
            {isRunning ? (
              <button
                onClick={stopCode}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shadow-rose-600/30 active:scale-95 transition-all animate-pulse"
                title="Stop Execution (Interrupt)"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
                {executionStatus && (
                  <span className="hidden xl:inline text-[10px] text-rose-200 ml-1 font-mono max-w-[100px] truncate">
                    ({executionStatus})
                  </span>
                )}
              </button>
            ) : (
              <button
                onClick={runCode}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
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
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800/70 text-xs font-medium flex items-center gap-1.5 border border-slate-700/60 transition-all hidden md:flex"
              title="Export Project as ZIP"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">Export ZIP</span>
            </button>

            {/* Split Layout Preview Toggle */}
            <button
              onClick={togglePreview}
              className={`p-1.5 rounded-md border transition-all ${
                previewOpen 
                  ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' 
                  : 'text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
              title="Toggle Live Preview & Output Panel"
            >
              <Layout className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* When NOT in Editor: Quick "Open Editor" CTA */}
        {navView !== 'editor' && (
          <button
            onClick={() => handleNavigate('editor')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all hidden sm:flex"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Open Editor</span>
          </button>
        )}

        {/* Auth Buttons when Logged Out */}
        {!isAuthenticated && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleNavigate('login')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all border border-slate-700/70"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => handleNavigate('signup')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20 transition-all hidden sm:flex"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>
          </div>
        )}

        {/* User Mini Avatar / Status Indicator when authenticated */}
        {isAuthenticated && user && (
          <button
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 transition-all text-left"
            title={`Logged in as ${user.fullName} (${user.role}) - Open Menu`}
          >
            <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] uppercase shrink-0 ${
              user.role === 'Admin' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40' : 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
            }`}>
              {user.fullName.slice(0, 2)}
            </div>
            <span className="text-xs font-medium text-slate-300 hidden xl:inline max-w-[80px] truncate">
              {user.fullName}
            </span>
          </button>
        )}

        {/* Theme Mode Quick Button */}
        <button
          onClick={toggleThemeMode}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 border border-slate-700/60 transition-all hidden md:flex"
          title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-0.5" />

        {/* HAMBURGER MENU BUTTON (Three Horizontal Lines) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all relative group focus:outline-none ${
            isMenuOpen 
              ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 shadow-md shadow-cyan-500/20' 
              : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border-slate-700/80'
          }`}
          title="Open Navigation Menu"
        >
          <div className="w-4 h-4 flex flex-col justify-center items-center gap-1">
            <span 
              className={`block h-0.5 w-3.5 bg-current rounded-full transition-transform duration-200 ${
                isMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`} 
            />
            <span 
              className={`block h-0.5 w-3.5 bg-current rounded-full transition-opacity duration-200 ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`} 
            />
            <span 
              className={`block h-0.5 w-3.5 bg-current rounded-full transition-transform duration-200 ${
                isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`} 
            />
          </div>
          <span className="text-xs font-semibold hidden md:inline">Menu</span>
        </button>
      </div>
    </header>

    {/* ============================================================ */}
    {/* SLIDE-IN HAMBURGER NAVIGATION DRAWER & BACKDROP              */}
    {/* ============================================================ */}
    {isMenuOpen && (
      <div 
        className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
    )}

    <aside
      ref={drawerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Site Navigation Drawer"
      className={`fixed top-0 right-0 h-screen h-[100dvh] w-80 sm:w-96 max-w-[85vw] bg-slate-900/98 dark:bg-[#0d121c]/98 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out select-none ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
        {/* Drawer Header */}
        <div className="h-14 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px]">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              CodeForge Menu
            </span>
          </div>

          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
            title="Close Menu (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-5 text-slate-300 text-xs">
          {/* USER ACCOUNT CARD */}
          {isAuthenticated && user ? (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm uppercase shrink-0 ${
                  user.role === 'Admin' ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-500/30' : 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/30'
                }`}>
                  {user.fullName.slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm truncate">{user.fullName}</div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium border ${
                      user.role === 'Admin'
                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    }`}>
                      {user.role} Account
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setShowProfileModal(true);
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Profile</span>
                </button>
                {user.role === 'Admin' ? (
                  <button
                    onClick={() => handleNavigate('admin')}
                    className="py-1.5 px-2.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-indigo-500/30 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Admin Panel</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                      setNavView('login');
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-rose-500/20 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-950/90 to-slate-900/90 border border-slate-800">
              <p className="text-xs text-slate-300 font-medium mb-1">Join CodeForge</p>
              <p className="text-[11px] text-slate-400 mb-3">Sign in or create an account to save projects and access admin features.</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavigate('login')}
                  className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => handleNavigate('signup')}
                  className="py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            </div>
          )}

          {/* MAIN NAVIGATION LINKS */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">
              Navigation
            </div>
            <div className="space-y-1">
              {/* Home */}
              <button
                onClick={() => handleNavigate('home')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                  navView === 'home'
                    ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${navView === 'home' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">Home Dashboard</div>
                    <div className="text-[10px] text-slate-500">Overview, hero & recent projects</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              {/* Editor */}
              <button
                onClick={() => handleNavigate('editor')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                  navView === 'editor'
                    ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${navView === 'editor' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">Code Editor</div>
                    <div className="text-[10px] text-slate-500">Monaco IDE with 14 languages & runner</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              {/* Projects */}
              <button
                onClick={() => handleNavigate('projects')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                  navView === 'projects'
                    ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${navView === 'projects' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">Projects</div>
                    <div className="text-[10px] text-slate-500">Manage, export, and create workspaces</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              {/* Documentation */}
              <button
                onClick={() => handleNavigate('docs')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                  navView === 'docs'
                    ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${navView === 'docs' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">Documentation</div>
                    <div className="text-[10px] text-slate-500">Language guides, compilers & shortcuts</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              {/* Settings */}
              <button
                onClick={() => handleNavigate('settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                  navView === 'settings'
                    ? 'bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${navView === 'settings' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">Settings</div>
                    <div className="text-[10px] text-slate-500">Preferences, fonts & compiler connectivity</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>

              {/* Admin Dashboard (If Administrator) */}
              {user?.role === 'Admin' && (
                <button
                  onClick={() => handleNavigate('admin')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                    navView === 'admin'
                      ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/40'
                      : 'text-indigo-300 hover:text-white hover:bg-indigo-500/10 border border-indigo-500/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-indigo-500/25 text-indigo-300">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-indigo-300">Admin Dashboard</div>
                      <div className="text-[10px] text-indigo-400/80">User database, analytics & controls</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-400" />
                </button>
              )}
            </div>
          </div>

          {/* QUICK TOOLS & PREFERENCES */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-2">
              Tools & Controls
            </div>
            <div className="space-y-1">
              {/* Open Editor Button */}
              <button
                onClick={() => handleNavigate('editor')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Code2 className="w-4 h-4" />
                  <span className="font-semibold">Open Editor</span>
                </div>
                <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded font-mono">Launch</span>
              </button>

              {/* Keyboard Shortcuts */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setShowShortcutsModal(true);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Keyboard className="w-4 h-4 text-slate-400" />
                  <span>Keyboard Shortcuts</span>
                </div>
                <kbd className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-700">
                  Ctrl+K
                </kbd>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleThemeMode}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {themeMode === 'dark' ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  )}
                  <span>Theme Mode</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400 capitalize">
                  {themeMode === 'dark' ? 'Dark' : 'Light'}
                </span>
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Fullscreen Mode</span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">
                  {isFullscreen ? 'Active' : 'Windowed'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-950/60">
          {isAuthenticated ? (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                logout();
                setNavView('login');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 transition-all font-medium text-xs border border-rose-500/20"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out ({user?.fullName})</span>
            </button>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>CodeForge v1.0</span>
              <span className="text-cyan-400">Sandboxed IDE</span>
            </div>
          )}
        </div>
      </aside>

      {/* User Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
    </>
  );
};
