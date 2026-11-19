import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const ShortcutsModal: React.FC = () => {
  const { showShortcutsModal, setShowShortcutsModal } = useProject();

  if (!showShortcutsModal) return null;

  const shortcutGroups = [
    {
      group: 'General & Execution',
      items: [
        { keys: ['Ctrl', 'Enter'], desc: 'Execute project & refresh preview' },
        { keys: ['Ctrl', 'S'], desc: 'Save all files to browser storage' },
        { keys: ['Ctrl', 'B'], desc: 'Toggle file explorer sidebar' },
        { keys: ['Ctrl', 'K'], desc: 'Open keyboard shortcuts dialog' },
        { keys: ['F11'], desc: 'Toggle full screen mode' }
      ]
    },
    {
      group: 'Monaco Editor Commands',
      items: [
        { keys: ['Ctrl', 'F'], desc: 'Find and Replace in active editor' },
        { keys: ['Shift', 'Alt', 'F'], desc: 'Format document' },
        { keys: ['Ctrl', '/'], desc: 'Toggle line comment' },
        { keys: ['Ctrl', 'Z'], desc: 'Undo last change' },
        { keys: ['Ctrl', 'Y'], desc: 'Redo last undone change' },
        { keys: ['Alt', '↑ / ↓'], desc: 'Move current line up or down' },
        { keys: ['Ctrl', 'D'], desc: 'Select next occurrence of word' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden select-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <span>Keyboard Shortcuts</span>
          </div>
          <button
            onClick={() => setShowShortcutsModal(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-6">
          {shortcutGroups.map((g, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                {g.group}
              </h4>
              <div className="space-y-2">
                {g.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-300">{item.desc}</span>
                    <div className="flex items-center gap-1 font-mono">
                      {item.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-semibold shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/40 text-center text-xs text-slate-500">
          Press <kbd className="font-mono text-slate-400 bg-slate-900 px-1 py-0.5 rounded border border-slate-800">Esc</kbd> or click outside to dismiss
        </div>
      </div>
    </div>
  );
};
