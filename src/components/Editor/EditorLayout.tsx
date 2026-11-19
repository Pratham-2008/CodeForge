import React, { useState, useRef, useEffect } from 'react';
import { ActivityBar } from './ActivityBar';
import { FileExplorer } from '../Explorer/FileExplorer';
import { SearchPanel } from '../Search/SearchPanel';
import { CodeEditor } from './CodeEditor';
import { LivePreview } from '../Preview/LivePreview';
import { ConsolePanel } from '../Console/ConsolePanel';
import { useProject } from '../../context/ProjectContext';

export const EditorLayout: React.FC = () => {
  const {
    sidebarOpen,
    activeSidebarTab,
    previewOpen,
    previewTab
  } = useProject();

  // Horizontal split between Editor and Preview Panel (percentage 20% - 80%)
  const [editorWidthPercent, setEditorWidthPercent] = useState<number>(50);
  const [isDraggingH, setIsDraggingH] = useState<boolean>(false);

  // Vertical split in right panel between Live Preview and Console (percentage 20% - 80%)
  const [previewHeightPercent, setPreviewHeightPercent] = useState<number>(65);
  const [isDraggingV, setIsDraggingV] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Handle Horizontal Resize (Editor vs Preview)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingH || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPercent > 20 && newPercent < 80) {
        setEditorWidthPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingH(false);
    };

    if (isDraggingH) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingH]);

  // Handle Vertical Resize (Preview vs Console)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingV || !rightPanelRef.current) return;
      const rect = rightPanelRef.current.getBoundingClientRect();
      const newPercent = ((e.clientY - rect.top) / rect.height) * 100;
      if (newPercent > 20 && newPercent < 80) {
        setPreviewHeightPercent(newPercent);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingV(false);
    };

    if (isDraggingV) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingV]);

  return (
    <div className="flex-1 flex overflow-hidden relative" ref={containerRef}>
      {/* Activity Bar */}
      <ActivityBar />

      {/* Primary Sidebar (Explorer / Search) */}
      {sidebarOpen && (
        <aside className="w-64 flex-shrink-0 h-full overflow-hidden transition-all duration-200">
          {activeSidebarTab === 'explorer' && <FileExplorer />}
          {activeSidebarTab === 'search' && <SearchPanel />}
        </aside>
      )}

      {/* Main Workspace Area: Editor + Live Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        <div 
          className="h-full overflow-hidden flex flex-col"
          style={{ 
            width: previewOpen ? `${editorWidthPercent}%` : '100%',
            transition: isDraggingH ? 'none' : 'width 0.15s ease'
          }}
        >
          <CodeEditor />
        </div>

        {/* Horizontal Resizer Draggable Handle */}
        {previewOpen && (
          <div
            onMouseDown={() => setIsDraggingH(true)}
            className={`w-1.5 h-full bg-slate-900 hover:bg-cyan-500 cursor-col-resize select-none flex-shrink-0 transition-colors z-20 ${
              isDraggingH ? 'bg-cyan-500' : ''
            }`}
            title="Drag to resize Editor / Preview split"
          />
        )}

        {/* Live Preview & Console Right Pane */}
        {previewOpen && (
          <div 
            ref={rightPanelRef}
            className="h-full overflow-hidden flex flex-col flex-1"
          >
            {/* If tab is dedicated 'console', show console full height */}
            {previewTab === 'console' ? (
              <ConsolePanel />
            ) : (
              <>
                {/* Live Preview Area */}
                <div 
                  className="overflow-hidden"
                  style={{ 
                    height: `${previewHeightPercent}%`,
                    transition: isDraggingV ? 'none' : 'height 0.15s ease'
                  }}
                >
                  <LivePreview />
                </div>

                {/* Vertical Resizer Draggable Handle */}
                <div
                  onMouseDown={() => setIsDraggingV(true)}
                  className={`h-1.5 w-full bg-slate-900 hover:bg-cyan-500 cursor-row-resize select-none flex-shrink-0 transition-colors z-20 ${
                    isDraggingV ? 'bg-cyan-500' : ''
                  }`}
                  title="Drag to resize Live Preview / Console split"
                />

                {/* Bottom Console Panel */}
                <div className="flex-1 overflow-hidden min-h-[140px]">
                  <ConsolePanel />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
