import React, { useState, useRef } from 'react';
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileCode, 
  FileText, 
  Plus, 
  FolderPlus, 
  Trash2, 
  Edit2, 
  ChevronRight, 
  ChevronDown, 
  Download, 
  MoreVertical,
  Check,
  X,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { FileItem, SupportedLanguage } from '../../types';
import { buildFileTree, TreeNode } from '../../utils/fileHelpers';

export const FileExplorer: React.FC = () => {
  const {
    currentProject,
    activeFile,
    openFile,
    createFile,
    renameFile,
    deleteFile,
    downloadCurrentFile
  } = useProject();

  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState<boolean>(false);
  const [newItemName, setNewItemName] = useState<string>('');
  const [creationParentId, setCreationParentId] = useState<string | null>(null);

  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: prev[folderId] === undefined ? false : !prev[folderId]
    }));
  };

  const handleStartCreate = (isFolder: boolean, parentId: string | null = null) => {
    setIsCreatingFolder(isFolder);
    setIsCreatingFile(!isFolder);
    setCreationParentId(parentId);
    setNewItemName('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleFinishCreate = () => {
    if (newItemName.trim()) {
      createFile(newItemName.trim(), creationParentId, isCreatingFolder);
    }
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
    setNewItemName('');
    setCreationParentId(null);
  };

  const handleStartRename = (file: FileItem) => {
    setEditingFileId(file.id);
    setEditName(file.name);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleFinishRename = () => {
    if (editingFileId && editName.trim()) {
      renameFile(editingFileId, editName.trim());
    }
    setEditingFileId(null);
    setEditName('');
  };

  // Helper to render language icon
  const getFileIcon = (file: FileItem) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'html':
      case 'htm':
        return <span className="text-orange-400 font-bold text-[11px] font-mono">H</span>;
      case 'css':
        return <span className="text-cyan-400 font-bold text-[11px] font-mono">#</span>;
      case 'js':
      case 'jsx':
        return <span className="text-amber-300 font-bold text-[11px] font-mono">JS</span>;
      case 'ts':
      case 'tsx':
        return <span className="text-blue-400 font-bold text-[11px] font-mono">TS</span>;
      case 'py':
        return <span className="text-emerald-400 font-bold text-[11px] font-mono">PY</span>;
      case 'json':
        return <span className="text-rose-400 font-bold text-[11px] font-mono">{}</span>;
      case 'md':
        return <span className="text-purple-400 font-bold text-[11px] font-mono">M↓</span>;
      case 'cpp':
        return <span className="text-cyan-300 font-bold text-[11px] font-mono">C++</span>;
      case 'c':
      case 'h':
        return <span className="text-blue-400 font-bold text-[11px] font-mono">C</span>;
      case 'java':
        return <span className="text-red-400 font-bold text-[11px] font-mono">☕</span>;
      case 'php':
        return <span className="text-indigo-400 font-bold text-[11px] font-mono">PHP</span>;
      case 'sql':
        return <span className="text-teal-400 font-bold text-[11px] font-mono">SQL</span>;
      case 'go':
        return <span className="text-cyan-400 font-bold text-[11px] font-mono">GO</span>;
      case 'rs':
      case 'rust':
        return <span className="text-orange-400 font-bold text-[11px] font-mono">RS</span>;
      default:
        return <FileCode className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const tree = buildFileTree(currentProject.files);

  const renderTreeNodes = (nodes: TreeNode[], depth = 0) => {
    return nodes.map(node => {
      const { item, children } = node;
      const isExpanded = expandedFolders[item.id] !== false; // default open
      const isActive = activeFile?.id === item.id;
      const isEditing = editingFileId === item.id;

      if (item.isFolder) {
        return (
          <div key={item.id} className="select-none">
            <div
              className="flex items-center justify-between group px-2 py-1 hover:bg-slate-800/60 rounded cursor-pointer transition-colors text-xs text-slate-300 hover:text-slate-100"
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
              onClick={() => toggleFolder(item.id)}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                )}
                {isExpanded ? (
                  <FolderOpen className="w-3.5 h-3.5 text-amber-400/90 flex-shrink-0" />
                ) : (
                  <Folder className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0" />
                )}
                {isEditing ? (
                  <input
                    ref={inputRef}
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={handleFinishRename}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleFinishRename();
                      if (e.key === 'Escape') setEditingFileId(null);
                    }}
                    onClick={e => e.stopPropagation()}
                    className="bg-slate-900 text-slate-100 text-xs px-1.5 py-0.5 rounded border border-cyan-500 outline-none w-full"
                  />
                ) : (
                  <span className="truncate font-medium text-slate-300">{item.name}</span>
                )}
              </div>

              {/* Actions on hover */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => handleStartCreate(false, item.id)}
                  title="New File Inside Folder"
                  className="p-1 hover:bg-slate-700/80 rounded text-slate-400 hover:text-white"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleStartRename(item)}
                  title="Rename Folder"
                  className="p-1 hover:bg-slate-700/80 rounded text-slate-400 hover:text-white"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteFile(item.id)}
                  title="Delete Folder"
                  className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Folder Children */}
            {isExpanded && (
              <div className="flex flex-col">
                {renderTreeNodes(children, depth + 1)}
              </div>
            )}
          </div>
        );
      }

      // Single File Node
      return (
        <div
          key={item.id}
          className={`flex items-center justify-between group px-2 py-1 rounded cursor-pointer transition-colors text-xs ${
            isActive
              ? 'bg-cyan-500/15 text-cyan-300 font-medium border-l-2 border-cyan-400 pl-[6px]'
              : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
          }`}
          style={{ paddingLeft: `${depth * 14 + 16}px` }}
          onClick={() => openFile(item.id)}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">
              {getFileIcon(item)}
            </span>
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={handleFinishRename}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleFinishRename();
                  if (e.key === 'Escape') setEditingFileId(null);
                }}
                onClick={e => e.stopPropagation()}
                className="bg-slate-900 text-slate-100 text-xs px-1.5 py-0.5 rounded border border-cyan-500 outline-none w-full"
              />
            ) : (
              <span className="truncate">{item.name}</span>
            )}
            {item.isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" title="Unsaved changes" />
            )}
          </div>

          {/* Action icons on hover */}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => handleStartRename(item)}
              title="Rename File"
              className="p-1 hover:bg-slate-700/80 rounded text-slate-400 hover:text-white"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => deleteFile(item.id)}
              title="Delete File"
              className="p-1 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900/90 dark:bg-[#0e131d] border-r border-slate-800/80 select-none text-slate-200">
      {/* Explorer Top Header */}
      <div className="h-9 px-3 border-b border-slate-800/70 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase text-slate-400">
        <span className="truncate">{currentProject.name}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleStartCreate(false, null)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition-colors"
            title="New File in Root"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleStartCreate(true, null)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-amber-400 transition-colors"
            title="New Folder in Root"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {/* Creation Input at Root */}
        {(isCreatingFile || isCreatingFolder) && creationParentId === null && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/60 rounded border border-cyan-500/50 my-1">
            {isCreatingFolder ? (
              <Folder className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <File className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder={isCreatingFolder ? 'folder-name' : 'filename.ext'}
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              onBlur={handleFinishCreate}
              onKeyDown={e => {
                if (e.key === 'Enter') handleFinishCreate();
                if (e.key === 'Escape') {
                  setIsCreatingFile(false);
                  setIsCreatingFolder(false);
                }
              }}
              className="bg-transparent text-slate-100 text-xs outline-none w-full placeholder:text-slate-500"
            />
          </div>
        )}

        {/* Tree Render */}
        {renderTreeNodes(tree)}

        {currentProject.files.length === 0 && (
          <div className="p-4 text-center text-xs text-slate-500">
            <p className="mb-2">No files yet.</p>
            <button
              onClick={() => handleStartCreate(false, null)}
              className="text-cyan-400 hover:underline"
            >
              + Create index.html
            </button>
          </div>
        )}
      </div>

      {/* Quick Boilerplate Reset helper */}
      <div className="p-2 border-t border-slate-800/70 bg-slate-950/40 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="truncate font-mono">{currentProject.files.length} items</span>
        <button
          onClick={() => {
            // ensure index.html, style.css, script.js exist
            const hasHtml = currentProject.files.some(f => f.name.toLowerCase() === 'index.html');
            const hasCss = currentProject.files.some(f => f.name.toLowerCase() === 'style.css');
            const hasJs = currentProject.files.some(f => f.name.toLowerCase() === 'script.js');
            if (!hasHtml) createFile('index.html');
            if (!hasCss) createFile('style.css');
            if (!hasJs) createFile('script.js');
          }}
          className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline text-[10px]"
          title="Verify or create default web structure: index.html, style.css, script.js"
        >
          + Add Web Boilerplate
        </button>
      </div>
    </div>
  );
};
