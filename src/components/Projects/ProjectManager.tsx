import React, { useState } from 'react';
import { 
  FolderPlus, 
  Upload, 
  Download, 
  Search, 
  Clock, 
  Copy, 
  Trash2, 
  FileCode, 
  ArrowRight, 
  FolderGit2,
  Tag,
  CheckCircle2,
  HardDrive
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const ProjectManager: React.FC = () => {
  const { 
    projects, 
    selectProject, 
    setNavView, 
    deleteProject, 
    duplicateProject, 
    importZipFile,
    setShowNewProjectModal 
  } = useProject();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const allTags = Array.from(new Set(projects.flatMap(p => p.tags || [])));

  const filteredProjects = projects.filter(p => {
    const matchesSearch = !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'all' || (p.tags && p.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const handleOpenProject = (id: string) => {
    selectProject(id);
    setNavView('editor');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importZipFile(file);
      e.target.value = '';
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-[#0b0e14] via-[#0d121c] to-[#07090e] text-slate-100 p-6 sm:p-10 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
          <div>
            <div className="flex items-center gap-2.5 text-2xl font-bold text-white mb-1">
              <FolderGit2 className="w-6 h-6 text-cyan-400" />
              <span>Project Workspaces</span>
            </div>
            <p className="text-sm text-slate-400">
              Manage, export, duplicate, and organize all your browser-persisted code sandboxes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Import ZIP */}
            <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Import ZIP</span>
              <input
                type="file"
                accept=".zip"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* New Project */}
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          {/* Search box */}
          <div className="w-full sm:w-80 flex items-center gap-2 px-3 py-2 bg-slate-900/80 rounded-xl border border-slate-800 text-xs focus-within:border-cyan-500 transition-colors">
            <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-slate-200 placeholder:text-slate-500 outline-none"
            />
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedTag === 'all'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  selectedTag === tag
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 hover:bg-slate-900/80 transition-all hover:shadow-xl hover:shadow-cyan-500/5 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors text-base truncate">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateProject(project.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                      title="Duplicate project"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {projects.length > 1 && (
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-5 line-clamp-2 leading-relaxed">
                  {project.description || 'Custom CodeForge development project.'}
                </p>

                {/* File summary badges */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tags?.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/50"
                    >
                      {t}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 bg-slate-800/40 border border-slate-800">
                    {project.files.filter(f => !f.isFolder).length} files
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>

                <button
                  onClick={() => handleOpenProject(project.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/25 font-semibold transition-all group-hover:translate-x-0.5"
                >
                  <span>Open in Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
