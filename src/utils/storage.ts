import JSZip from 'jszip';
import { Project, FileItem, EditorSettings } from '../types';
import { STARTER_PROJECTS } from '../data/starterProjects';
import { generateId, getLanguageFromFilename } from './fileHelpers';

const STORAGE_KEYS = {
  PROJECTS: 'codeforge_projects_v2',
  ACTIVE_PROJECT: 'codeforge_active_project_id',
  SETTINGS: 'codeforge_settings_v1',
  THEME_MODE: 'codeforge_theme_mode'
};

export const DEFAULT_SETTINGS: EditorSettings = {
  theme: 'vs-dark',
  fontSize: 14,
  tabSize: 2,
  wordWrap: 'on',
  minimap: true,
  lineNumbers: 'on',
  autoSave: true,
  autoSaveDelay: 1200,
  autoRun: true,
  formatOnSave: true,
  fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace"
};

export function getStoredProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading projects from storage', e);
  }
  // Fallback to starter projects
  setStoredProjects(STARTER_PROJECTS);
  return STARTER_PROJECTS;
}

export function setStoredProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.error('Error saving projects to storage', e);
  }
}

export function getActiveProjectId(projects: Project[]): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT);
    if (stored && projects.some(p => p.id === stored)) {
      return stored;
    }
  } catch (e) {
    // ignore
  }
  return projects[0]?.id || STARTER_PROJECTS[0].id;
}

export function setActiveProjectId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT, id);
  } catch (e) {
    // ignore
  }
}

export function getStoredSettings(): EditorSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error reading settings', e);
  }
  return DEFAULT_SETTINGS;
}

export function setStoredSettings(settings: EditorSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

export function getStoredThemeMode(): 'dark' | 'light' {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch (e) {
    // ignore
  }
  return 'dark';
}

export function setStoredThemeMode(mode: 'dark' | 'light'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  } catch (e) {
    // ignore
  }
}

// Export single file
export function downloadFile(file: FileItem): void {
  const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export entire project as ZIP
export async function exportProjectZip(project: Project): Promise<void> {
  const zip = new JSZip();

  // Helper to build relative path
  const buildPath = (item: FileItem, allFiles: FileItem[]): string => {
    let p = item.name;
    let curr = item;
    while (curr.parentId) {
      const parent = allFiles.find(f => f.id === curr.parentId);
      if (parent) {
        p = `${parent.name}/${p}`;
        curr = parent;
      } else {
        break;
      }
    }
    return p;
  };

  project.files.forEach(file => {
    if (!file.isFolder) {
      const relPath = buildPath(file, project.files);
      zip.file(relPath, file.content);
    }
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  link.download = `${safeName || 'codeforge-project'}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import ZIP archive into a new project
export async function importProjectZip(zipFile: File): Promise<Project> {
  const zip = await JSZip.loadAsync(zipFile);
  const newFiles: FileItem[] = [];
  const folderMap = new Map<string, string>(); // path -> folderId

  const fileEntries: { path: string; isDir: boolean; contentPromise?: Promise<string> }[] = [];

  zip.forEach((relPath, entry) => {
    if (entry.dir) {
      fileEntries.push({ path: relPath.replace(/\/$/, ''), isDir: true });
    } else {
      fileEntries.push({ path: relPath, isDir: false, contentPromise: entry.async('string') });
    }
  });

  // Sort so directories are processed first
  fileEntries.sort((a, b) => a.path.split('/').length - b.path.split('/').length);

  for (const entry of fileEntries) {
    const parts = entry.path.split('/');
    const name = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/');
    const parentId = parentPath ? folderMap.get(parentPath) || null : null;

    if (entry.isDir) {
      const folderId = generateId();
      folderMap.set(entry.path, folderId);
      newFiles.push({
        id: folderId,
        name,
        path: `/${entry.path}`,
        content: '',
        language: 'javascript',
        isFolder: true,
        parentId,
        isOpen: true
      });
    } else {
      const content = entry.contentPromise ? await entry.contentPromise : '';
      const fileId = generateId();
      newFiles.push({
        id: fileId,
        name,
        path: `/${entry.path}`,
        content,
        language: getLanguageFromFilename(name),
        isFolder: false,
        parentId
      });
    }
  }

  const projectName = zipFile.name.replace(/\.zip$/i, '') || 'Imported Project';
  const firstCodeFile = newFiles.find(f => !f.isFolder) || newFiles[0];

  const newProject: Project = {
    id: generateId(),
    name: projectName,
    description: `Imported from ${zipFile.name} on ${new Date().toLocaleDateString()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    files: newFiles.length > 0 ? newFiles : [
      {
        id: generateId(),
        name: 'index.html',
        path: '/index.html',
        content: '<!DOCTYPE html>\n<html>\n<body>\n  <h1>Imported Project</h1>\n</body>\n</html>',
        language: 'html',
        isFolder: false,
        parentId: null
      }
    ],
    activeFileId: firstCodeFile ? firstCodeFile.id : '',
    openFileIds: firstCodeFile ? [firstCodeFile.id] : [],
    tags: ['Imported', 'ZIP']
  };

  return newProject;
}
