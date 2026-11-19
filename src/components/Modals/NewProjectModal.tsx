import React, { useState } from 'react';
import { X, FolderPlus, Sparkles, Code2, Globe, Cpu, BookOpen, Layers } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { STARTER_PROJECTS } from '../../data/starterProjects';

export const NewProjectModal: React.FC = () => {
  const { showNewProjectModal, setShowNewProjectModal, createProject, setNavView } = useProject();

  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('starter-web-glass');

  if (!showNewProjectModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = projectName.trim() || 'Untitled Project';
    createProject(finalName, projectDesc, selectedTemplateId);
    setShowNewProjectModal(false);
    setNavView('editor');
  };

  const templates = [
    {
      id: 'blank',
      name: 'Blank Web Project',
      desc: 'Clean index.html, style.css, and script.js starting slate.',
      icon: <Code2 className="w-5 h-5 text-cyan-400" />
    },
    ...STARTER_PROJECTS.map(p => ({
      id: p.id,
      name: p.name,
      desc: p.description,
      icon: p.id.includes('python') ? (
        <Cpu className="w-5 h-5 text-emerald-400" />
      ) : p.id.includes('canvas') ? (
        <Sparkles className="w-5 h-5 text-purple-400" />
      ) : p.id.includes('markdown') ? (
        <BookOpen className="w-5 h-5 text-blue-400" />
      ) : (
        <Globe className="w-5 h-5 text-cyan-400" />
      )
    }))
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden select-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <FolderPlus className="w-4 h-4 text-cyan-400" />
            <span>Create New Project</span>
          </div>
          <button
            onClick={() => setShowNewProjectModal(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Name</label>
            <input
              type="text"
              placeholder="e.g. My Awesome App"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description (Optional)</label>
            <input
              type="text"
              placeholder="Brief note about the project's purpose..."
              value={projectDesc}
              onChange={e => setProjectDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Choose a Starter Template</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {templates.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    selectedTemplateId === tpl.id
                      ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0">
                    {tpl.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">{tpl.name}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-normal">{tpl.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowNewProjectModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all"
            >
              Create & Open Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
