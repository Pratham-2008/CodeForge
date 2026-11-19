export type SupportedLanguage = 
  | 'html' 
  | 'css' 
  | 'javascript' 
  | 'typescript' 
  | 'python' 
  | 'c' 
  | 'cpp' 
  | 'java' 
  | 'php' 
  | 'sql' 
  | 'json' 
  | 'markdown' 
  | 'go' 
  | 'rust';

export interface FileItem {
  id: string;
  name: string;
  path: string;
  content: string;
  language: SupportedLanguage;
  isFolder: boolean;
  parentId: string | null;
  isOpen?: boolean;
  isDirty?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  files: FileItem[];
  activeFileId: string;
  openFileIds: string[];
  tags: string[];
}

export interface ConsoleLog {
  id: string;
  type: 'log' | 'info' | 'warn' | 'error' | 'system';
  args: any[];
  timestamp: number;
  count: number;
}

export interface EditorSettings {
  theme: 'vs-dark' | 'light' | 'hc-black' | 'github-dark' | 'monokai' | 'dracula' | 'nord';
  fontSize: number;
  tabSize: number;
  wordWrap: 'on' | 'off';
  minimap: boolean;
  lineNumbers: 'on' | 'off';
  autoSave: boolean;
  autoSaveDelay: number;
  autoRun: boolean;
  formatOnSave: boolean;
  fontFamily: string;
  judge0Endpoint?: string;
  judge0ApiKey?: string;
}

export type SidebarTab = 'explorer' | 'search' | 'projects' | 'settings' | 'shortcuts';
export type NavView = 'home' | 'editor' | 'projects' | 'docs' | 'settings' | 'login' | 'signup' | 'admin';
export type PreviewTab = 'preview' | 'console';

export * from './auth';

export interface ExecutionResult {
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  status?: string;
  time?: string;
  memory?: string;
  error?: string;
  isConfigured?: boolean;
}
