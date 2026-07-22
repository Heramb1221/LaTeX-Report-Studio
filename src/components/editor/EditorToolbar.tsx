'use client';

import { useEditorStore } from '@/store/editorStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table2,
  ImagePlus,
  GitFork,
  BookMarked,
  Sparkles,
} from 'lucide-react';

type ToolAction =
  | 'table-builder'
  | 'image-manager'
  | 'new-diagram'
  | 'citation'
  | 'ai-humanize';

interface ToolItem {
  icon: React.ElementType;
  label: string;
  shortLabel: string;
  action: ToolAction;
}

const TOOLS: ToolItem[] = [
  { icon: Table2,     label: 'Table Builder',    shortLabel: 'Table',    action: 'table-builder'  },
  { icon: ImagePlus,  label: 'Image Manager',    shortLabel: 'Image',    action: 'image-manager'  },
  { icon: GitFork,    label: 'Diagram Editor',   shortLabel: 'Diagram',  action: 'new-diagram'    },
  { icon: BookMarked, label: 'Citation Manager', shortLabel: 'Citation', action: 'citation'       },
  { icon: Sparkles,   label: 'AI Panel',         shortLabel: 'AI',       action: 'ai-humanize'    },
];

export function EditorToolbar() {
  const {
    focusMode,
    setIsAiDrawerOpen,
    setAiDrawerMode,
    setNewDiagramModalOpen,
    setCitationModalOpen,
    setTableBuilderOpen,
    setImageManagerOpen,
  } = useEditorStore();

  const handleClick = (action: ToolAction) => {
    switch (action) {
      case 'table-builder':   setTableBuilderOpen(true);           break;
      case 'image-manager':   setImageManagerOpen(true);           break;
      case 'new-diagram':     setNewDiagramModalOpen(true);        break;
      case 'citation':        setCitationModalOpen(true);          break;
      case 'ai-humanize':
        setAiDrawerMode('humanize');
        setIsAiDrawerOpen(true);
        break;
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <AnimatePresence>
        {!focusMode && (
          <motion.footer
            initial={{ y: 44, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 44, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-11 shrink-0 border-t bg-background/80 backdrop-blur-md flex items-center justify-center sm:justify-start px-3 gap-1 z-40"
          >
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Tooltip key={tool.label}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 px-3 text-xs rounded-sm"
                      onClick={() => handleClick(tool.action)}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden sm:inline font-medium">{tool.label}</span>
                      <span className="sm:hidden font-medium">{tool.shortLabel}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">{tool.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </motion.footer>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
