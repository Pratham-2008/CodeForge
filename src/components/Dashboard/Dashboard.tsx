import React from 'react';
import { 
  Play, 
  Sparkles, 
  Code2, 
  Layers, 
  Terminal, 
  Cpu, 
  Download, 
  Zap, 
  FolderPlus, 
  ArrowRight, 
  Clock, 
  Trash2, 
  Copy, 
  FileCode2, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Workflow
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { STARTER_PROJECTS } from '../../data/starterProjects';

export const Dashboard: React.FC = () => {
  const { 
    setNavView, 
    projects, 
    selectProject, 
    createProject, 
    deleteProject, 
    duplicateProject, 
    setShowNewProjectModal 
  } = useProject();

  const handleOpenProject = (id: string) => {
    selectProject(id);
    setNavView('editor');
  };

  const languages = [
    { name: 'HTML5', ext: '.html', tag: 'Live Preview', color: 'from-orange-500/20 to-amber-500/10 text-orange-400 border-orange-500/30', desc: 'Structure & semantic web markup with instant rendering' },
    { name: 'CSS3', ext: '.css', tag: 'Live Preview', color: 'from-blue-500/20 to-cyan-500/10 text-cyan-400 border-blue-500/30', desc: 'Modern styling, CSS Grid, Flexbox, custom variables & keyframes' },
    { name: 'JavaScript', ext: '.js', tag: 'Live Preview', color: 'from-amber-500/20 to-yellow-500/10 text-yellow-300 border-amber-500/30', desc: 'ES6+ interactivity, async/await, DOM APIs & console bridge' },
    { name: 'TypeScript', ext: '.ts', tag: 'Transpiled', color: 'from-blue-600/20 to-indigo-500/10 text-blue-400 border-blue-500/30', desc: 'Type-safe JavaScript syntax checking and Monaco diagnostics' },
    { name: 'Python', ext: '.py', tag: 'Pyodide WASM', color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30', desc: 'Full in-browser Python 3.12 WebAssembly execution & standard input' },
    { name: 'SQL', ext: '.sql', tag: 'SQLite WASM', color: 'from-teal-500/20 to-cyan-500/10 text-teal-300 border-teal-500/30', desc: 'In-browser relational database engine with formatted ASCII result tables' },
    { name: 'C', ext: '.c', tag: 'Judge0 Sandboxed', color: 'from-blue-500/20 to-indigo-500/10 text-blue-300 border-blue-500/30', desc: 'GCC 9.2 native compilation with stdin, stdout, and execution metrics' },
    { name: 'C++', ext: '.cpp', tag: 'Judge0 Sandboxed', color: 'from-cyan-500/20 to-blue-500/10 text-cyan-300 border-cyan-500/30', desc: 'Modern C++20 with STL algorithms, stdin streams & compiler diagnostics' },
    { name: 'Java', ext: '.java', tag: 'Judge0 Sandboxed', color: 'from-red-500/20 to-orange-500/10 text-red-400 border-red-500/30', desc: 'OpenJDK 13 compilation and execution with memory metrics' },
    { name: 'PHP', ext: '.php', tag: 'Judge0 Sandboxed', color: 'from-indigo-500/20 to-purple-500/10 text-indigo-300 border-indigo-500/30', desc: 'PHP 7.4 runtime script execution with standard output stream' },
    { name: 'Go', ext: '.go', tag: 'Judge0 Sandboxed', color: 'from-cyan-500/20 to-sky-500/10 text-cyan-400 border-cyan-500/30', desc: 'Go 1.13 compilation with goroutines, slices & standard input' },
    { name: 'Rust', ext: '.rs', tag: 'Judge0 Sandboxed', color: 'from-orange-500/20 to-amber-500/10 text-orange-400 border-orange-500/30', desc: 'Rustc 1.40 native compiled execution with safety guarantees' },
    { name: 'JSON', ext: '.json', tag: 'Syntax Validator', color: 'from-rose-500/20 to-amber-500/10 text-rose-400 border-rose-500/30', desc: 'Configuration syntax formatting, linting and tree inspection' },
    { name: 'Markdown', ext: '.md', tag: 'Live Formatted', color: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30', desc: 'Rich documentation with tables, headers, blockquotes & formatting' }
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-[#0b0e14] via-[#0d121c] to-[#07090e] text-slate-100 overflow-y-auto">
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 max-w-6xl mx-auto text-center">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-purple-600/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold mb-6 shadow-sm shadow-cyan-500/10 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Professional Cloud IDE & Live Development Studio</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
          Code. Create. Run. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Repeat.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
          CodeForge delivers a high-speed, browser-native development environment powered by the Monaco Editor. Write HTML, CSS, JavaScript, and Python with live preview, deep console interception, and zero configuration.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setNavView('editor')}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 active:scale-95 transition-all group"
          >
            <Play className="w-4 h-4 fill-current group-hover:translate-x-0.5 transition-transform" />
            <span>Start Coding Now</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium text-sm transition-all shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-cyan-400" />
            <span>Create New Project</span>
          </button>
        </div>

        {/* Quick specs pill bar */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Monaco VS Code Engine</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Sandboxed IFrame Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>Local Offline Persistence</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>ZIP Export & Import</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="px-6 py-12 max-w-6xl mx-auto border-t border-slate-800/60">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Engineered for Modern Developers
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Everything you expect from an industrial-grade code editor, packaged directly inside your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-cyan-500/20">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Monaco Code Editor</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Powered by Microsoft's Monaco Editor with multi-cursor support, syntax highlighting, bracket colorization, find & replace, and code folding.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-900/90 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-blue-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Live Sandboxed Preview</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Real-time browser preview executing within an isolated sandbox. Styles and scripts update instantaneously as you type or run.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-emerald-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Bi-directional Console Bridge</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Intercepts console.log, info, warnings, runtime exceptions, and unhandled promise rejections directly in the integrated console panel.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900/90 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-purple-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">VS Code File Explorer</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Create nested folders, rename, delete, organize, and switch between multiple open tabs with dirty indicators and automatic persistence.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900/90 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-amber-500/20">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Instant ZIP Export & Import</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Export your full workspace as a standard .zip archive with one click, or upload any existing ZIP project to resume working instantly.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 hover:bg-slate-900/90 transition-all duration-300 group">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-rose-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Zero Login & Full Privacy</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              No account required. All project files, settings, and code revisions stay safe in your browser storage with zero external tracking.
            </p>
          </div>
        </div>
      </section>

      {/* Recently Opened Projects Section */}
      <section className="px-6 py-12 max-w-6xl mx-auto border-t border-slate-800/60">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Your Projects</h2>
            <p className="text-slate-400 text-sm">Resume where you left off or create a new sandbox</p>
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 text-xs font-semibold transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-cyan-500/5 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors text-base truncate">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => duplicateProject(project.id)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                      title="Duplicate project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {projects.length > 1 && (
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  {project.description || 'Custom CodeForge development workspace.'}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/50"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-800/40">
                    {project.files.filter(f => !f.isFolder).length} files
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>

                <button
                  onClick={() => handleOpenProject(project.id)}
                  className="flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition-all"
                >
                  <span>Open in Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Programming Languages Section */}
      <section className="px-6 py-12 max-w-6xl mx-auto border-t border-slate-800/60 mb-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">
            Supported Languages & Runtimes
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Real browser execution for web stacks and architecture-ready interfaces for compiled languages.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {languages.map((lang, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-all flex items-start gap-3.5"
            >
              <div className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/50">
                <FileCode2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm text-slate-200">{lang.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${lang.color}`}>
                    {lang.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-normal">{lang.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
