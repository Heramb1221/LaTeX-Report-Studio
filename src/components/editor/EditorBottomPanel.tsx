'use client';

import { useEditorStore } from '@/store/editorStore';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { IProject } from '@/types';

import { AiTool } from './tools/AiTool';
import { CitationTool } from './tools/CitationTool';
import { DiagramTool } from './tools/DiagramTool';
import { ImageTool } from './tools/ImageTool';
import { TableTool } from './tools/TableTool';

interface EditorBottomPanelProps {
  project: IProject;
}

export function EditorBottomPanel({ project }: EditorBottomPanelProps) {
  const { activeBottomPanelTab, setActiveBottomPanelTab } = useEditorStore();

  if (!activeBottomPanelTab) return null;

  const handleClose = () => setActiveBottomPanelTab(null);

  const getToolTitle = () => {
    switch (activeBottomPanelTab) {
      case 'ai': return 'AI Assistant';
      case 'citations': return 'Citation Manager';
      case 'diagrams': return 'Diagram Editor';
      case 'images': return 'Image Manager';
      case 'tables': return 'Table Builder';
      default: return 'Tool';
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background border-t">
      {/* Tool Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0 bg-muted/20">
        <h3 className="text-sm font-semibold tracking-tight">{getToolTitle()}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-md hover:bg-muted"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tool Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeBottomPanelTab === 'ai' && <AiTool />}
        {activeBottomPanelTab === 'citations' && <CitationTool project={project} />}
        {activeBottomPanelTab === 'diagrams' && <DiagramTool project={project} />}
        {activeBottomPanelTab === 'images' && <ImageTool project={project} />}
        {activeBottomPanelTab === 'tables' && <TableTool />}
      </div>
    </div>
  );
}
