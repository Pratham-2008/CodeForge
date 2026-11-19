import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useProject } from '../../context/ProjectContext';
import { EditorTabs } from './EditorTabs';
import { Code2, FilePlus, Sparkles } from 'lucide-react';

export const CodeEditor: React.FC = () => {
  const {
    activeFile,
    updateFileContent,
    settings,
    themeMode,
    createFile,
    saveCurrentProject,
    runCode
  } = useProject();

  const editorRef = useRef<any>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom VS-Darker theme with cyan/blue accents
    monaco.editor.defineTheme('forge-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4', fontStyle: 'italic' },
        { token: 'keyword', foreground: '38bdf8', fontStyle: 'bold' },
        { token: 'string', foreground: 'a7f3d0' },
        { token: 'number', foreground: 'fcd34d' },
        { token: 'type', foreground: '818cf8' },
        { token: 'identifier', foreground: 'f8fafc' }
      ],
      colors: {
        'editor.background': '#0b0f17',
        'editor.foreground': '#f8fafc',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#38bdf8',
        'editor.selectionBackground': '#1e293b',
        'editor.lineHighlightBackground': '#13192640',
        'editorCursor.foreground': '#38bdf8'
      }
    });

    // Custom light theme
    monaco.editor.defineTheme('forge-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
        { token: 'keyword', foreground: '0284c7', fontStyle: 'bold' },
        { token: 'string', foreground: '059669' },
        { token: 'number', foreground: 'd97706' },
        { token: 'type', foreground: '4f46e5' }
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#0f172a',
        'editorLineNumber.foreground': '#94a3b8',
        'editorLineNumber.activeForeground': '#0284c7',
        'editor.lineHighlightBackground': '#f1f5f9',
        'editorCursor.foreground': '#0284c7'
      }
    });

    // Set theme according to global theme
    if (settings.theme === 'vs-dark' || settings.theme === 'dracula' || settings.theme === 'monokai') {
      monaco.editor.setTheme('forge-dark');
    } else if (settings.theme === 'light') {
      monaco.editor.setTheme('forge-light');
    } else {
      monaco.editor.setTheme('hc-black');
    }

    // Key binding: Ctrl+S -> Save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      saveCurrentProject();
    });

    // Key binding: Ctrl+Enter -> Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCode();
    });
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  // Map supported language string to Monaco language id
  const getMonacoLanguage = (lang: string): string => {
    switch (lang) {
      case 'html': return 'html';
      case 'css': return 'css';
      case 'javascript': return 'javascript';
      case 'typescript': return 'typescript';
      case 'python': return 'python';
      case 'json': return 'json';
      case 'markdown': return 'markdown';
      case 'cpp': return 'cpp';
      case 'c': return 'c';
      case 'java': return 'java';
      case 'php': return 'php';
      case 'sql': return 'sql';
      case 'go': return 'go';
      case 'rust': return 'rust';
      default: return 'javascript';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 dark:bg-[#0b0f17] overflow-hidden">
      {/* Tab bar */}
      <EditorTabs onFormat={handleFormat} />

      {/* Editor Surface */}
      <div className="flex-1 relative overflow-hidden">
        {activeFile ? (
          <Editor
            height="100%"
            language={getMonacoLanguage(activeFile.language)}
            value={activeFile.content}
            theme={themeMode === 'light' ? 'forge-light' : 'forge-dark'}
            onChange={(val) => {
              if (activeFile && val !== undefined) {
                updateFileContent(activeFile.id, val);
              }
            }}
            onMount={handleEditorMount}
            options={{
              fontSize: settings.fontSize,
              tabSize: settings.tabSize,
              wordWrap: settings.wordWrap,
              minimap: { enabled: settings.minimap },
              lineNumbers: settings.lineNumbers,
              fontFamily: settings.fontFamily,
              fontLigatures: true,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              formatOnPaste: true,
              formatOnType: true,
              bracketPairColorization: { enabled: true },
              padding: { top: 12, bottom: 12 }
            }}
            loading={
              <div className="flex items-center justify-center h-full text-slate-400 gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>Loading Monaco Editor engine...</span>
              </div>
            }
          />
        ) : (
          /* Empty State when no file is open */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 text-cyan-400 shadow-xl shadow-cyan-500/5">
              <Code2 className="w-8 h-8 opacity-80" />
            </div>
            <h2 className="text-lg font-semibold text-slate-200 mb-1">No File Open</h2>
            <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
              Select a file from the explorer on the left or create a new one to begin editing with full syntax highlighting.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => createFile('index.html')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 text-xs font-semibold transition-all"
              >
                <FilePlus className="w-4 h-4" />
                <span>Create index.html</span>
              </button>
              <button
                onClick={() => createFile('script.js')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 text-xs font-medium transition-all"
              >
                <FilePlus className="w-4 h-4" />
                <span>Create script.js</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
