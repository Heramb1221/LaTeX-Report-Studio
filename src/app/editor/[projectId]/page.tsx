import type { Metadata } from 'next';
import { EditorShell } from '@/components/editor/EditorShell';

// In Next.js 15, route params are a Promise and must be awaited.
interface EditorPageProps {
  params: Promise<{ projectId: string }>;
}

// The page title is set generically here. The EditorTopbar shows the real
// project name once the client loads, which is faster than fetching server-side.
export const metadata: Metadata = {
  title: 'Editor',
};

export default async function EditorPage({ params }: EditorPageProps) {
  const { projectId } = await params;
  return <EditorShell projectId={projectId} />;
}
