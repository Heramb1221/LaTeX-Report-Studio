import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center border-t-2 border-b-2 border-dashed bg-transparent py-24 px-8 text-center"
    >
      {/* Icon */}
      <div className="rounded-full bg-primary/10 p-5 mb-6">
        <FileText className="h-10 w-10 text-primary" />
      </div>

      {/* Copy */}
      <h3 className="text-3xl font-serif tracking-tight font-semibold mb-3">No documents yet</h3>
      <p className="text-base text-muted-foreground max-w-sm mb-8 leading-relaxed">
        Create your first engineering report. Pick a template — IEEE, mini
        project, seminar, or FYP — and your LaTeX workspace is ready instantly.
      </p>

      {/* CTA */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button onClick={onCreateClick} className="font-semibold px-8 h-12 rounded-none border-b-2 border-transparent hover:border-primary/20">
          <Plus className="h-5 w-5 mr-2" />
          New Document
        </Button>
      </motion.div>
    </motion.div>
  );
}
