import React from 'react';
import { 
  BookOpen, 
  Code2, 
  ShieldCheck, 
  Keyboard, 
  Zap, 
  Terminal, 
  Download, 
  FileCode,
  ExternalLink,
  Cpu,
  Layers
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const DocumentationView: React.FC = () => {
  const { setNavView } = useProject();

  const shortcuts = [
    { key: 'Ctrl + Enter', desc: 'Execute and refresh live preview' },
    { key: 'Ctrl + S', desc: 'Save all active files to local storage' },
    { key: 'Ctrl + B', desc: 'Toggle file explorer sidebar' },
    { key: 'Ctrl + K', desc: 'Open keyboard shortcuts modal' },
    { key: 'Ctrl + F', desc: 'Find and replace within editor' },
    { key: 'Alt + Click', desc: 'Multi-cursor column selection in Monaco' },
    { key: 'Shift + Alt + F', desc: 'Format current document with Prettier' },
    { key: 'F11', desc: 'Toggle full screen mode' }
  ];

  return (
    <div className="h-full bg-gradient-to-b from-[#0b0e14] via-[#0d121c] to-[#07090e] text-slate-100 p-6 sm:p-10 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Developer Handbook</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            CodeForge Documentation & Architecture
          </h1>
          <p className="text-sm text-slate-400">
            Learn how the browser sandbox, Monaco Editor engine, console bridge, and multi-language runtimes interact.
          </p>
        </div>

        {/* Section 1: Overview */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>1. Platform Overview</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            CodeForge is a modern developer studio engineered to eliminate environment friction. You can write multi-file HTML, CSS, JavaScript, TypeScript, and Python projects with instant live preview, deep bi-directional console logging, and local offline persistence.
          </p>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
            <div className="font-semibold text-cyan-400">Core Highlights:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li><strong>Zero setup required:</strong> No Node installation, build step, or cloud server account needed.</li>
              <li><strong>Offline persistence:</strong> Projects are cached locally in your browser so you never lose code across page refreshes.</li>
              <li><strong>Standard file format:</strong> Export clean ZIP files containing your actual files and folder structure.</li>
            </ul>
          </div>
        </div>

        {/* Section 2: Keyboard Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <span>2. Essential Keyboard Shortcuts</span>
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-4">Shortcut</th>
                  <th className="py-2.5 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {shortcuts.map((sc, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 text-cyan-400 font-semibold">{sc.key}</td>
                    <td className="py-2.5 px-4 text-slate-300 font-sans">{sc.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Live Preview & Console Bridge */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyan-400" />
            <span>3. Live Preview & Console Bridge Architecture</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            The live preview executes inside a sandboxed iframe using the HTML5 <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">srcdoc</code> attribute. This guarantees full browser sandbox isolation: user code cannot compromise your local storage or external host cookies.
          </p>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-3">
            <div className="font-semibold text-cyan-400">How the Console Interceptor Works:</div>
            <p className="text-slate-400 leading-relaxed">
              Before user scripts execute, an instrumentation shim wraps <code className="text-slate-200">console.log</code>, <code className="text-slate-200">console.warn</code>, <code className="text-slate-200">console.error</code>, and the global <code className="text-slate-200">window.onerror</code> handler. Each invocation serializes arguments and relays them through <code className="text-slate-200">window.parent.postMessage()</code> to the CodeForge Console Panel in real time.
            </p>
          </div>
        </div>

        {/* Section 4: Multi-Language Specification */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>4. Supported Languages & Runtime Execution Architecture</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            CodeForge provides real code execution across 14 languages utilizing three distinct execution tiers:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-cyan-400 block">Tier 1: Browser-Native Sandboxes</span>
              <p className="text-slate-400">
                <strong>HTML, CSS, JavaScript, TypeScript:</strong> Executed immediately in an isolated browser iframe sandbox with real-time DOM rendering, CSS styling, and bi-directional console interception.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="font-semibold text-emerald-400 block">Tier 2: In-Browser WebAssembly Runtimes</span>
              <p className="text-slate-400">
                <strong>Python (Pyodide 3.12):</strong> Full Python runtime running 100% inside your browser via WebAssembly with math, standard input, and stdout streams.<br />
                <strong>SQL (SQLite wasm):</strong> In-memory relational database executing queries and rendering ASCII formatted tables.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 sm:col-span-2">
              <span className="font-semibold text-indigo-400 block">Tier 3: Sandboxed Backend Compiler Service (Judge0 API)</span>
              <p className="text-slate-400 leading-relaxed">
                <strong>C, C++, Java, PHP, Go, Rust:</strong> Forwarded to a sandboxed Judge0 compiler instance through our secure server proxy (<code className="text-cyan-400 bg-slate-950 px-1 py-0.5 rounded">/api/execute</code>). Server-side resource constraints (5.0s CPU, 10.0s wall time, 128MB RAM) are strictly enforced.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] space-y-1">
                <span className="font-semibold text-slate-300">Configuring API Credentials:</span>
                <p className="text-slate-400">
                  By default, CodeForge connects to the Judge0 CE public instance (<code className="text-cyan-400">https://ce.judge0.com</code>). You can also provide a custom endpoint or RapidAPI key in <strong>Settings → Backend Compiler Integration</strong> or by setting the <code className="text-cyan-400">JUDGE0_API_KEY</code> and <code className="text-cyan-400">JUDGE0_ENDPOINT</code> environment variables.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA to Editor */}
        <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Ready to build something awesome?</span>
          <button
            onClick={() => setNavView('editor')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all"
          >
            <span>Launch Editor</span>
            <Code2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
