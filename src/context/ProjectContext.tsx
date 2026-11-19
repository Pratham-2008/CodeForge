import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { 
  Project, 
  FileItem, 
  EditorSettings, 
  ConsoleLog, 
  SidebarTab, 
  NavView, 
  PreviewTab, 
  SupportedLanguage,
  ExecutionResult 
} from '../types';
import { 
  getStoredProjects, 
  setStoredProjects, 
  getActiveProjectId, 
  setActiveProjectId, 
  getStoredSettings, 
  setStoredSettings, 
  getStoredThemeMode, 
  setStoredThemeMode,
  exportProjectZip,
  downloadFile,
  importProjectZip,
  DEFAULT_SETTINGS
} from '../utils/storage';
import { generateId, getLanguageFromFilename, buildExecutionHtml, getDefaultExtension } from '../utils/fileHelpers';
import { STARTER_PROJECTS } from '../data/starterProjects';
import { LANGUAGES, LANGUAGE_MAP, getLanguageConfig } from '../data/languages';
import { runPythonCode } from '../services/pyodideRunner';
import { runSqlQuery } from '../services/sqlRunner';
import { runJudge0Code } from '../services/judge0Runner';

export interface SearchMatch {
  file: FileItem;
  matches: { line: number; text: string; index: number }[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error' | 'warning';
  text: string;
}

interface ProjectContextType {
  // Navigation
  navView: NavView;
  setNavView: (view: NavView) => void;
  // Projects
  projects: Project[];
  currentProject: Project;
  selectProject: (id: string) => void;
  createProject: (name: string, description?: string, templateId?: string) => Project;
  renameProject: (id: string, newName: string) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  saveCurrentProject: () => void;
  exportZip: () => Promise<void>;
  importZipFile: (file: File) => Promise<void>;
  downloadCurrentFile: () => void;
  // Files
  activeFile: FileItem | null;
  openFiles: FileItem[];
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  createFile: (name: string, parentId?: string | null, isFolder?: boolean, initialLanguage?: SupportedLanguage) => FileItem | null;
  renameFile: (fileId: string, newName: string) => void;
  deleteFile: (fileId: string) => void;
  setFileLanguage: (fileId: string, newLang: SupportedLanguage, replaceContent?: boolean) => void;
  hasUnsavedChanges: boolean;
  // Execution & Live Preview
  executionHtml: string;
  runCode: () => void;
  stopCode: () => void;
  isRunning: boolean;
  executionStatus: string | null;
  stdin: string;
  setStdin: (val: string) => void;
  logs: ConsoleLog[];
  clearLogs: () => void;
  refreshPreview: () => void;
  previewTab: PreviewTab;
  setPreviewTab: (tab: PreviewTab) => void;
  // Settings & Theme
  settings: EditorSettings;
  updateSettings: (newSettings: Partial<EditorSettings>) => void;
  themeMode: 'dark' | 'light';
  toggleThemeMode: () => void;
  // Panels & Layout
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  activeSidebarTab: SidebarTab;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  previewOpen: boolean;
  setPreviewOpen: (open: boolean) => void;
  togglePreview: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  searchResults: SearchMatch[];
  // Toasts
  toasts: ToastMessage[];
  addToast: (text: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  // Modals
  showShortcutsModal: boolean;
  setShowShortcutsModal: (show: boolean) => void;
  showNewProjectModal: boolean;
  setShowNewProjectModal: (show: boolean) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation (persisted in sessionStorage so refreshes keep the current view)
  const [navView, setNavViewState] = useState<NavView>(() => {
    try {
      const saved = sessionStorage.getItem('codeforge_nav_view') as NavView | null;
      if (saved && ['home', 'editor', 'projects', 'docs', 'settings', 'login', 'signup', 'admin'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'home';
  });

  const setNavView = (view: NavView) => {
    setNavViewState(view);
    try {
      sessionStorage.setItem('codeforge_nav_view', view);
    } catch {}
  };

  // Persistence Initial Load
  const [projects, setProjects] = useState<Project[]>(() => getStoredProjects());
  const [currentProjectId, setCurrentProjectId] = useState<string>(() => {
    const loaded = getStoredProjects();
    return getActiveProjectId(loaded);
  });
  const [settings, setSettings] = useState<EditorSettings>(() => getStoredSettings());
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => getStoredThemeMode());

  // Panels & UI State
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('explorer');
  const [previewOpen, setPreviewOpen] = useState<boolean>(true);
  const [previewTab, setPreviewTab] = useState<PreviewTab>('preview');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [showNewProjectModal, setShowNewProjectModal] = useState<boolean>(false);

  // Search
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Execution & Logs
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionStatus, setExecutionStatus] = useState<string | null>(null);
  const [stdin, setStdin] = useState<string>('');
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [executionHtml, setExecutionHtml] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const autoSaveTimerRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync projects to localStorage
  useEffect(() => {
    setStoredProjects(projects);
  }, [projects]);

  // Sync current project id
  useEffect(() => {
    setActiveProjectId(currentProjectId);
  }, [currentProjectId]);

  // Sync settings
  useEffect(() => {
    setStoredSettings(settings);
  }, [settings]);

  // Sync theme to <html> tag
  useEffect(() => {
    setStoredThemeMode(themeMode);
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [themeMode]);

  const addToast = (text: string, type: ToastMessage['type'] = 'info') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Find current project
  const currentProject = useMemo(() => {
    const found = projects.find(p => p.id === currentProjectId);
    return found || projects[0] || STARTER_PROJECTS[0];
  }, [projects, currentProjectId]);

  // Active File
  const activeFile = useMemo(() => {
    if (!currentProject) return null;
    return currentProject.files.find(f => f.id === currentProject.activeFileId) || null;
  }, [currentProject]);

  // Open Files
  const openFiles = useMemo(() => {
    if (!currentProject) return [];
    return currentProject.openFileIds
      .map(id => currentProject.files.find(f => f.id === id))
      .filter((f): f is FileItem => !!f && !f.isFolder);
  }, [currentProject]);

  // Stop code execution
  const stopCode = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsRunning(false);
    setExecutionStatus(null);
    addToast('Execution stopped', 'warning');
    setLogs(prev => [
      ...prev,
      {
        id: generateId(),
        type: 'warn',
        args: ['⏹️ Execution interrupted by user.'],
        timestamp: Date.now(),
        count: 1
      }
    ]);
  };

  // Build and execute code
  const runCode = async () => {
    if (isRunning) {
      stopCode();
      return;
    }

    if (!activeFile) {
      addToast('No active file selected to run', 'warning');
      return;
    }

    setIsRunning(true);
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const lang = activeFile.language;
    const config = getLanguageConfig(lang);

    try {
      // 1. Python execution via Pyodide WebAssembly
      if (lang === 'python') {
        setPreviewTab('console');
        setExecutionStatus('Initializing Python runtime...');
        addToast(`Executing ${activeFile.name}...`, 'info');

        const initialLog: ConsoleLog = {
          id: generateId(),
          type: 'system',
          args: [`🐍 Python 3.12 (Pyodide WebAssembly): Running "${activeFile.name}"...`],
          timestamp: Date.now(),
          count: 1
        };
        setLogs(prev => [...prev, initialLog]);

        const result = await runPythonCode(
          {
            code: activeFile.content,
            stdin,
            signal
          },
          msg => setExecutionStatus(msg)
        );

        if (result.stdout) {
          const lines = result.stdout.trimEnd().split('\n');
          lines.forEach(line => {
            setLogs(prev => [
              ...prev,
              { id: generateId(), type: 'log', args: [line], timestamp: Date.now(), count: 1 }
            ]);
          });
        }

        if (result.stderr) {
          setLogs(prev => [
            ...prev,
            { id: generateId(), type: 'error', args: [result.stderr], timestamp: Date.now(), count: 1 }
          ]);
        }

        const completionLog: ConsoleLog = {
          id: generateId(),
          type: result.error ? 'error' : 'system',
          args: [`[Process finished in ${result.executionTimeMs}ms]`],
          timestamp: Date.now(),
          count: 1
        };
        setLogs(prev => [...prev, completionLog]);
        addToast(result.error ? 'Python execution error' : 'Python script completed', result.error ? 'error' : 'success');
        return;
      }

      // 2. SQL execution via SQLite WebAssembly
      if (lang === 'sql') {
        setPreviewTab('console');
        setExecutionStatus('Executing SQL in SQLite...');
        addToast(`Executing SQL queries...`, 'info');

        const initialLog: ConsoleLog = {
          id: generateId(),
          type: 'system',
          args: [`🗄️ SQLite WebAssembly Engine: Executing "${activeFile.name}"...`],
          timestamp: Date.now(),
          count: 1
        };
        setLogs(prev => [...prev, initialLog]);

        const result = await runSqlQuery(
          {
            query: activeFile.content,
            signal
          },
          msg => setExecutionStatus(msg)
        );

        if (result.stdout) {
          setLogs(prev => [
            ...prev,
            { id: generateId(), type: 'log', args: [result.stdout], timestamp: Date.now(), count: 1 }
          ]);
        }

        if (result.stderr) {
          setLogs(prev => [
            ...prev,
            { id: generateId(), type: 'error', args: [result.stderr], timestamp: Date.now(), count: 1 }
          ]);
        }

        const completionLog: ConsoleLog = {
          id: generateId(),
          type: result.error ? 'error' : 'system',
          args: [`[SQLite queries finished in ${result.executionTimeMs}ms]`],
          timestamp: Date.now(),
          count: 1
        };
        setLogs(prev => [...prev, completionLog]);
        addToast(result.error ? 'SQL execution failed' : 'SQL queries executed', result.error ? 'error' : 'success');
        return;
      }

      // 3. Compiled Languages: C, C++, Java, PHP, Go, Rust via Judge0 Backend API
      if (['c', 'cpp', 'java', 'php', 'go', 'rust'].includes(lang)) {
        setPreviewTab('console');
        setExecutionStatus(`Compiling and running ${config.name}...`);
        addToast(`Submitting ${activeFile.name} to sandbox...`, 'info');

        const initialLog: ConsoleLog = {
          id: generateId(),
          type: 'system',
          args: [`⚡ ${config.name} Sandboxed Execution: Submitting "${activeFile.name}" to Judge0 backend API...`],
          timestamp: Date.now(),
          count: 1
        };
        setLogs(prev => [...prev, initialLog]);

        const result: ExecutionResult = await runJudge0Code(
          {
            language: lang,
            code: activeFile.content,
            stdin,
            endpoint: settings.judge0Endpoint,
            apiKey: settings.judge0ApiKey,
            signal
          },
          msg => setExecutionStatus(msg)
        );

        if (result.compileOutput) {
          setLogs(prev => [
            ...prev,
            { id: generateId(), type: 'warn', args: [`Compiler Output:\n${result.compileOutput}`], timestamp: Date.now(), count: 1 }
          ]);
        }

        if (result.stdout) {
          const lines = result.stdout.trimEnd().split('\n');
          lines.forEach(line => {
            setLogs(prev => [
              ...prev,
              { id: generateId(), type: 'log', args: [line], timestamp: Date.now(), count: 1 }
            ]);
          });
        }

        if (result.stderr) {
          setLogs(prev => [
            ...prev,
            { id: generateId(), type: 'error', args: [result.stderr], timestamp: Date.now(), count: 1 }
          ]);
        }

        if (result.error && !result.isConfigured) {
          setLogs(prev => [
            ...prev,
            {
              id: generateId(),
              type: 'error',
              args: [
                `❌ Backend Execution Error: ${result.error}`,
                `ℹ️ Configuration Guide: To execute native compiled languages (C, C++, Java, PHP, Go, Rust), provide a Judge0 CE endpoint or RapidAPI key in Settings or backend environment variables.`
              ],
              timestamp: Date.now(),
              count: 1
            }
          ]);
          addToast(`Judge0 service not configured or reachable`, 'warning');
        } else {
          const statusText = result.status ? `Status: ${result.status}` : 'Completed';
          const timeText = result.time ? ` | Time: ${result.time}` : '';
          const memoryText = result.memory ? ` | Memory: ${result.memory}` : '';
          
          setLogs(prev => [
            ...prev,
            { id: generateId(), type: 'system', args: [`[${statusText}${timeText}${memoryText}]`], timestamp: Date.now(), count: 1 }
          ]);
          addToast(`${config.name} execution finished (${result.status || 'Done'})`, 'success');
        }
        return;
      }

      // 4. JSON Validator
      if (lang === 'json') {
        setPreviewTab('console');
        try {
          const parsed = JSON.parse(activeFile.content);
          setLogs(prev => [
            ...prev,
            { id: generateId(), type: 'system', args: [`✅ Valid JSON document: ${Object.keys(parsed).length} top-level key(s)`], timestamp: Date.now(), count: 1 },
            { id: generateId(), type: 'log', args: [JSON.stringify(parsed, null, 2)], timestamp: Date.now(), count: 1 }
          ]);
          addToast('JSON syntax valid', 'success');
        } catch (jsonErr: any) {
          setLogs(prev => [
            ...prev,
            { id: generateId(), type: 'error', args: [`❌ JSON Syntax Error: ${jsonErr.message}`], timestamp: Date.now(), count: 1 }
          ]);
          addToast('Invalid JSON syntax', 'error');
        }
        return;
      }

      // 5. Default HTML / CSS / JS / TS bundle for live browser preview
      const html = buildExecutionHtml(currentProject.files);
      setExecutionHtml(html);
      setPreviewTab('preview');
      addToast('Project built & live preview refreshed!', 'success');
    } catch (e: any) {
      if (e.message?.includes('interrupted')) {
        return;
      }
      setLogs(prev => [
        ...prev,
        { id: generateId(), type: 'error', args: [`Execution Error: ${e.message}`], timestamp: Date.now(), count: 1 }
      ]);
      addToast(`Error: ${e.message}`, 'error');
    } finally {
      setIsRunning(false);
      setExecutionStatus(null);
      abortControllerRef.current = null;
    }
  };

  const refreshPreview = () => {
    runCode();
  };

  // Listen for messages from iframe preview
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.source === 'codeforge-preview') {
        const { type, args, timestamp } = event.data;
        const newLog: ConsoleLog = {
          id: generateId(),
          type: type || 'log',
          args: Array.isArray(args) ? args : [args],
          timestamp: timestamp || Date.now(),
          count: 1
        };

        setLogs(prev => {
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            if (last.type === newLog.type && JSON.stringify(last.args) === JSON.stringify(newLog.args)) {
              return [
                ...prev.slice(0, -1),
                { ...last, count: last.count + 1, timestamp: newLog.timestamp }
              ];
            }
          }
          return [...prev, newLog];
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Initial code run on mount or project switch
  useEffect(() => {
    if (currentProject) {
      const html = buildExecutionHtml(currentProject.files);
      setExecutionHtml(html);
    }
  }, [currentProjectId]);

  // Project Management Actions
  const selectProject = (id: string) => {
    if (projects.some(p => p.id === id)) {
      setCurrentProjectId(id);
      setLogs([]);
      setHasUnsavedChanges(false);
      addToast(`Opened project`, 'info');
    }
  };

  const createProject = (name: string, description = 'Created in CodeForge', templateId?: string): Project => {
    let baseFiles: FileItem[] = [];
    if (templateId) {
      const template = STARTER_PROJECTS.find(t => t.id === templateId);
      if (template) {
        baseFiles = template.files.map(f => ({ ...f, id: generateId() }));
      }
    }

    if (baseFiles.length === 0) {
      const htmlId = generateId();
      const cssId = generateId();
      const jsId = generateId();

      baseFiles = [
        {
          id: htmlId,
          name: 'index.html',
          path: '/index.html',
          language: 'html',
          isFolder: false,
          parentId: null,
          content: getLanguageConfig('html').starterCode
        },
        {
          id: cssId,
          name: 'style.css',
          path: '/style.css',
          language: 'css',
          isFolder: false,
          parentId: null,
          content: getLanguageConfig('css').starterCode
        },
        {
          id: jsId,
          name: 'script.js',
          path: '/script.js',
          language: 'javascript',
          isFolder: false,
          parentId: null,
          content: getLanguageConfig('javascript').starterCode
        }
      ];
    }

    const firstFile = baseFiles.find(f => !f.isFolder) || baseFiles[0];

    const newProject: Project = {
      id: generateId(),
      name: name.trim() || 'Untitled Project',
      description: description.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      files: baseFiles,
      activeFileId: firstFile ? firstFile.id : '',
      openFileIds: baseFiles.filter(f => !f.isFolder).map(f => f.id),
      tags: ['Custom']
    };

    setProjects(prev => [newProject, ...prev]);
    setCurrentProjectId(newProject.id);
    setLogs([]);
    setHasUnsavedChanges(false);
    addToast(`Project "${newProject.name}" created!`, 'success');
    return newProject;
  };

  const renameProject = (id: string, newName: string) => {
    if (!newName.trim()) return;
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, name: newName.trim(), updatedAt: Date.now() };
      }
      return p;
    }));
    addToast('Project renamed successfully', 'success');
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) {
      addToast('Cannot delete the last remaining project', 'warning');
      return;
    }
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    if (currentProjectId === id) {
      setCurrentProjectId(remaining[0].id);
    }
    addToast('Project deleted', 'info');
  };

  const duplicateProject = (id: string) => {
    const target = projects.find(p => p.id === id);
    if (!target) return;
    const clonedFiles = target.files.map(f => ({ ...f, id: generateId() }));
    const activeClone = clonedFiles.find(f => !f.isFolder);

    const cloned: Project = {
      ...target,
      id: generateId(),
      name: `${target.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      files: clonedFiles,
      activeFileId: activeClone ? activeClone.id : '',
      openFileIds: clonedFiles.filter(f => !f.isFolder).map(f => f.id)
    };

    setProjects(prev => [cloned, ...prev]);
    setCurrentProjectId(cloned.id);
    addToast(`Duplicated as "${cloned.name}"`, 'success');
  };

  const saveCurrentProject = () => {
    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        return {
          ...p,
          updatedAt: Date.now(),
          files: p.files.map(f => ({ ...f, isDirty: false }))
        };
      }
      return p;
    }));
    setHasUnsavedChanges(false);
    addToast('All changes saved to browser storage', 'success');
  };

  const exportZip = async () => {
    try {
      addToast('Exporting project ZIP archive...', 'info');
      await exportProjectZip(currentProject);
      addToast(`Downloaded ${currentProject.name}.zip`, 'success');
    } catch (e: any) {
      addToast(`Failed to export ZIP: ${e.message}`, 'error');
    }
  };

  const importZipFile = async (file: File) => {
    try {
      addToast(`Importing ${file.name}...`, 'info');
      const newProj = await importProjectZip(file);
      setProjects(prev => [newProj, ...prev]);
      setCurrentProjectId(newProj.id);
      setNavView('editor');
      addToast(`Imported project "${newProj.name}" successfully!`, 'success');
    } catch (e: any) {
      addToast(`Failed to import ZIP: ${e.message}`, 'error');
    }
  };

  const downloadCurrentFile = () => {
    if (activeFile) {
      downloadFile(activeFile);
      addToast(`Downloaded ${activeFile.name}`, 'info');
    }
  };

  // File Operations
  const openFile = (fileId: string) => {
    const file = currentProject.files.find(f => f.id === fileId);
    if (!file || file.isFolder) return;

    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        const nextOpen = p.openFileIds.includes(fileId) ? p.openFileIds : [...p.openFileIds, fileId];
        return { ...p, activeFileId: fileId, openFileIds: nextOpen };
      }
      return p;
    }));
  };

  const closeFile = (fileId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        const nextOpen = p.openFileIds.filter(id => id !== fileId);
        let nextActive = p.activeFileId;
        if (p.activeFileId === fileId) {
          nextActive = nextOpen.length > 0 ? nextOpen[nextOpen.length - 1] : '';
        }
        return { ...p, openFileIds: nextOpen, activeFileId: nextActive };
      }
      return p;
    }));
  };

  const updateFileContent = (fileId: string, content: string) => {
    setHasUnsavedChanges(true);

    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        const updatedFiles = p.files.map(f => {
          if (f.id === fileId) {
            return { ...f, content, isDirty: true };
          }
          return f;
        });
        return { ...p, files: updatedFiles, updatedAt: Date.now() };
      }
      return p;
    }));

    if (settings.autoSave) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        saveCurrentProject();
        if (settings.autoRun && activeFile?.language === 'html') {
          setExecutionHtml(buildExecutionHtml(currentProject.files.map(f => f.id === fileId ? { ...f, content } : f)));
        }
      }, settings.autoSaveDelay);
    }
  };

  // Switch language of a file without losing code
  const setFileLanguage = (fileId: string, newLang: SupportedLanguage, replaceContent = false) => {
    const targetFile = currentProject.files.find(f => f.id === fileId);
    if (!targetFile || targetFile.isFolder) return;

    const langConfig = getLanguageConfig(newLang);
    const newExtension = getDefaultExtension(newLang);

    // Update file name extension if it has one
    let newName = targetFile.name;
    const dotIndex = targetFile.name.lastIndexOf('.');
    if (dotIndex !== -1) {
      newName = targetFile.name.substring(0, dotIndex) + newExtension;
    } else {
      newName = targetFile.name + newExtension;
    }

    const shouldInjectStarter = replaceContent || !targetFile.content.trim();
    const finalContent = shouldInjectStarter ? langConfig.starterCode : targetFile.content;

    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        const updatedFiles = p.files.map(f => {
          if (f.id === fileId) {
            return {
              ...f,
              name: newName,
              path: `/${newName}`,
              language: newLang,
              content: finalContent,
              isDirty: true
            };
          }
          return f;
        });
        return { ...p, files: updatedFiles, updatedAt: Date.now() };
      }
      return p;
    }));

    setHasUnsavedChanges(true);
    addToast(`Language updated to ${langConfig.name}`, 'info');
  };

  const createFile = (name: string, parentId: string | null = null, isFolder = false, initialLanguage?: SupportedLanguage): FileItem | null => {
    const trimmed = name.trim();
    if (!trimmed) return null;

    const exists = currentProject.files.some(f => f.parentId === parentId && f.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      addToast(`A ${isFolder ? 'folder' : 'file'} named "${trimmed}" already exists here`, 'warning');
      return null;
    }

    const language = initialLanguage || (isFolder ? ('javascript' as SupportedLanguage) : getLanguageFromFilename(trimmed));
    const langConfig = getLanguageConfig(language);
    
    const newFile: FileItem = {
      id: generateId(),
      name: trimmed,
      path: `/${trimmed}`,
      content: isFolder ? '' : langConfig.starterCode,
      language,
      isFolder,
      parentId,
      isOpen: isFolder ? true : undefined,
      isDirty: false
    };

    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        const nextFiles = [...p.files, newFile];
        const nextOpen = !isFolder ? [...p.openFileIds, newFile.id] : p.openFileIds;
        const nextActive = !isFolder ? newFile.id : p.activeFileId;
        return { ...p, files: nextFiles, openFileIds: nextOpen, activeFileId: nextActive, updatedAt: Date.now() };
      }
      return p;
    }));

    addToast(`Created ${isFolder ? 'folder' : 'file'} "${trimmed}"`, 'success');
    return newFile;
  };

  const renameFile = (fileId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;

    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        const nextFiles = p.files.map(f => {
          if (f.id === fileId) {
            const nextLang = f.isFolder ? f.language : getLanguageFromFilename(trimmed);
            return { ...f, name: trimmed, language: nextLang };
          }
          return f;
        });
        return { ...p, files: nextFiles, updatedAt: Date.now() };
      }
      return p;
    }));
    addToast('Renamed successfully', 'success');
  };

  const deleteFile = (fileId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === currentProjectId) {
        const idsToDelete = new Set<string>([fileId]);
        let changed = true;
        while (changed) {
          changed = false;
          p.files.forEach(f => {
            if (f.parentId && idsToDelete.has(f.parentId) && !idsToDelete.has(f.id)) {
              idsToDelete.add(f.id);
              changed = true;
            }
          });
        }

        const remaining = p.files.filter(f => !idsToDelete.has(f.id));
        const remainingOpen = p.openFileIds.filter(id => !idsToDelete.has(id));
        let nextActive = p.activeFileId;
        if (idsToDelete.has(p.activeFileId)) {
          nextActive = remainingOpen.length > 0 ? remainingOpen[0] : (remaining.find(f => !f.isFolder)?.id || '');
        }

        return { ...p, files: remaining, openFileIds: remainingOpen, activeFileId: nextActive, updatedAt: Date.now() };
      }
      return p;
    }));
    addToast('File deleted', 'info');
  };

  const updateSettings = (partial: Partial<EditorSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
    addToast('Settings updated', 'info');
  };

  const toggleThemeMode = () => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const togglePreview = () => setPreviewOpen(prev => !prev);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Search across files
  const searchResults = useMemo((): SearchMatch[] => {
    if (!searchTerm.trim() || !currentProject) return [];
    const term = searchTerm.toLowerCase();
    const results: SearchMatch[] = [];

    currentProject.files.forEach(file => {
      if (file.isFolder || !file.content) return;
      const lines = file.content.split('\n');
      const matches: { line: number; text: string; index: number }[] = [];

      lines.forEach((lineText, idx) => {
        const pos = lineText.toLowerCase().indexOf(term);
        if (pos !== -1) {
          matches.push({
            line: idx + 1,
            text: lineText.trim(),
            index: pos
          });
        }
      });

      if (matches.length > 0) {
        results.push({ file, matches });
      }
    });

    return results;
  }, [searchTerm, currentProject]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentProject();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k' || (e.shiftKey && e.key.toLowerCase() === 'p'))) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentProject, settings, activeFile, stdin]);

  return (
    <ProjectContext.Provider
      value={{
        navView,
        setNavView,
        projects,
        currentProject,
        selectProject,
        createProject,
        renameProject,
        deleteProject,
        duplicateProject,
        saveCurrentProject,
        exportZip,
        importZipFile,
        downloadCurrentFile,
        activeFile,
        openFiles,
        openFile,
        closeFile,
        updateFileContent,
        createFile,
        renameFile,
        deleteFile,
        setFileLanguage,
        hasUnsavedChanges,
        executionHtml,
        runCode,
        stopCode,
        isRunning,
        executionStatus,
        stdin,
        setStdin,
        logs,
        clearLogs,
        refreshPreview,
        previewTab,
        setPreviewTab,
        settings,
        updateSettings,
        themeMode,
        toggleThemeMode,
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar,
        activeSidebarTab,
        setActiveSidebarTab,
        previewOpen,
        setPreviewOpen,
        togglePreview,
        isFullscreen,
        toggleFullscreen,
        searchTerm,
        setSearchTerm,
        searchResults,
        toasts,
        addToast,
        removeToast,
        showShortcutsModal,
        setShowShortcutsModal,
        showNewProjectModal,
        setShowNewProjectModal
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
