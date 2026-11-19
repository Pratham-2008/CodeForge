import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Type, 
  Code, 
  Save, 
  Zap, 
  RotateCcw,
  Sliders,
  Check,
  Server,
  Key,
  ShieldCheck,
  Cpu,
  Activity
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { DEFAULT_SETTINGS } from '../../utils/storage';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, themeMode, toggleThemeMode, addToast } = useProject();
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

  const handleResetDefaults = () => {
    updateSettings(DEFAULT_SETTINGS);
    addToast('Settings reset to defaults', 'info');
  };

  const handleTestBackend = async () => {
    setTestingConnection(true);
    setConnectionStatus('Testing connection to backend compiler...');
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.status === 'ok') {
        setConnectionStatus(`Connected: Judge0 endpoint configured (${data.judge0Endpoint})`);
        addToast('Backend compiler proxy is healthy!', 'success');
      } else {
        setConnectionStatus('Backend reachable, but Judge0 reported non-OK status.');
      }
    } catch (err: any) {
      setConnectionStatus(`Connection failed: ${err.message}`);
      addToast('Could not reach backend API', 'error');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="h-full bg-[#0b0e14] text-slate-100 p-6 sm:p-10 overflow-y-auto max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800 mb-8">
        <div>
          <div className="flex items-center gap-2.5 text-xl font-bold text-white mb-1">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            <span>Editor & Studio Settings</span>
          </div>
          <p className="text-xs text-slate-400">Configure editor appearance, execution environments, and backend compiler credentials.</p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="space-y-8 pb-12">
        {/* Backend Execution Service (Judge0) */}
        <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
              <Server className="w-4 h-4" />
              <span>Backend Compiler Integration (Judge0)</span>
            </div>
            <button
              onClick={handleTestBackend}
              disabled={testingConnection}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25 text-xs font-medium transition-all"
            >
              <Activity className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            CodeForge uses browser-native runtimes for <strong>HTML, CSS, JavaScript, TypeScript</strong>, in-browser WebAssembly for <strong>Python (Pyodide)</strong> and <strong>SQL (SQLite)</strong>, and a sandboxed Judge0 backend service for <strong>C, C++, Java, PHP, Go, and Rust</strong>.
          </p>

          {connectionStatus && (
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
              {connectionStatus}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Judge0 API Endpoint</label>
              <input
                type="text"
                placeholder="https://ce.judge0.com"
                value={settings.judge0Endpoint || ''}
                onChange={e => updateSettings({ judge0Endpoint: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Default: <code>https://ce.judge0.com</code> or self-hosted Judge0 instance
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Judge0 / RapidAPI Key (Optional)</label>
              <input
                type="password"
                placeholder="Leave blank for public CE, or enter API key"
                value={settings.judge0ApiKey || ''}
                onChange={e => updateSettings({ judge0ApiKey: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Can also be provided via <code>JUDGE0_API_KEY</code> on the server
              </span>
            </div>
          </div>
        </div>

        {/* Appearance Group */}
        <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-800/80 space-y-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400 pb-2 border-b border-slate-800">
            <Palette className="w-4 h-4" />
            <span>Theme & Colors</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Editor Color Theme</label>
              <select
                value={settings.theme}
                onChange={e => updateSettings({ theme: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
              >
                <option value="vs-dark">CodeForge Dark (Recommended)</option>
                <option value="light">CodeForge Light</option>
                <option value="hc-black">High Contrast Black</option>
                <option value="github-dark">GitHub Dark</option>
                <option value="dracula">Dracula</option>
                <option value="monokai">Monokai Pro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Studio UI Mode</label>
              <button
                onClick={toggleThemeMode}
                className="w-full flex items-center justify-between bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 hover:bg-slate-800/50 transition-colors"
              >
                <span>Current Mode: <strong className="capitalize text-cyan-400">{themeMode}</strong></span>
                <span className="text-[11px] underline">Toggle Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Typography & Code Format */}
        <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-800/80 space-y-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400 pb-2 border-b border-slate-800">
            <Type className="w-4 h-4" />
            <span>Typography & Code Formatting</span>
          </div>

          <div className="space-y-4">
            {/* Font Size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-300">Editor Font Size: <span className="font-mono text-cyan-400 font-bold">{settings.fontSize}px</span></label>
              </div>
              <input
                type="range"
                min="11"
                max="24"
                step="1"
                value={settings.fontSize}
                onChange={e => updateSettings({ fontSize: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Tab Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Indentation Tab Size</label>
                <select
                  value={settings.tabSize}
                  onChange={e => updateSettings({ tabSize: parseInt(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value={2}>2 Spaces</option>
                  <option value={4}>4 Spaces</option>
                  <option value={8}>8 Spaces</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Word Wrap Mode</label>
                <select
                  value={settings.wordWrap}
                  onChange={e => updateSettings({ wordWrap: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="on">Word Wrap Enabled (On)</option>
                  <option value="off">No Wrap (Horizontal scroll)</option>
                </select>
              </div>
            </div>

            {/* Checkboxes: Minimap, Line numbers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={settings.minimap}
                  onChange={e => updateSettings({ minimap: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded"
                />
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Show Code Minimap</span>
                  <span className="text-[11px] text-slate-500">Visual code preview scrollbar on right</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={settings.lineNumbers === 'on'}
                  onChange={e => updateSettings({ lineNumbers: e.target.checked ? 'on' : 'off' })}
                  className="w-4 h-4 accent-cyan-400 rounded"
                />
                <div>
                  <span className="text-xs font-medium text-slate-200 block">Show Line Numbers</span>
                  <span className="text-[11px] text-slate-500">Gutter line numbering in editor</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Execution & Auto-save */}
        <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-800/80 space-y-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400 pb-2 border-b border-slate-800">
            <Zap className="w-4 h-4" />
            <span>Persistence & Live Runner</span>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={e => updateSettings({ autoSave: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
              <div>
                <span className="text-xs font-medium text-slate-200 block">Automatic Saving</span>
                <span className="text-[11px] text-slate-500">Automatically syncs dirty files to browser storage</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
              <input
                type="checkbox"
                checked={settings.autoRun}
                onChange={e => updateSettings({ autoRun: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded"
              />
              <div>
                <span className="text-xs font-medium text-slate-200 block">Live Auto-Run Preview</span>
                <span className="text-[11px] text-slate-500">Automatically re-renders preview when saving or editing</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
