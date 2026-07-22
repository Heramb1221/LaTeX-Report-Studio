import type { Metadata } from 'next';
import Link from 'next/link';
import { LandingNav } from '@/components/landing/LandingNav';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  GitFork,
  Sparkles,
  BookMarked,
  Table2,
  Download,
  Github,
  ArrowRight,
  CheckCircle2,
  Play,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'LaTeX Report Studio — The Engineering Report Workspace',
  description:
    'Write, humanize, diagram, cite, and compile your engineering reports in one place. Open-source alternative to Overleaf + draw.io + AI humanizers.',
  openGraph: {
    title: 'LaTeX Report Studio',
    description: 'The unified engineering report workspace for students.',
    type: 'website',
  },
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const REPLACED_TOOLS = [
  { label: 'Overleaf', replaced: 'Monaco LaTeX Editor + PDF Preview' },
  { label: 'draw.io', replaced: 'Built-in Diagram Editor' },
  { label: 'AI Humanizer', replaced: 'Gemini Humanize Panel' },
  { label: 'Bibliography Manager', replaced: 'IEEE Citation Manager' },
  { label: 'PDF Converter', replaced: 'One-Click Compile' },
  { label: 'Manual Zip Export', replaced: 'Project Export (.zip)' },
];

const FEATURES = [
  {
    icon: FileText,
    title: 'Monaco LaTeX Editor',
    description:
      'VS Code-grade editing experience with LaTeX syntax highlighting, auto-close brackets, and 1.5-second auto-save. No Overleaf account needed.',
  },
  {
    icon: GitFork,
    title: 'Diagram Editor',
    description:
      'Full draw.io integration — all 9 diagram types (DFD, UML, ER, Sequence, State Machine, and more) embedded directly in your workspace.',
  },
  {
    icon: Sparkles,
    title: 'AI Humanizer',
    description:
      'Paste AI-generated text and get a rewritten version that preserves technical meaning. Uses your own free Gemini API key — zero AI cost to us.',
  },
  {
    icon: BookMarked,
    title: 'IEEE Citation Manager',
    description:
      'Fill in a form, get valid BibTeX instantly. Cite keys auto-generated. One-click copy of \\cite{} commands. Download references.bib anytime.',
  },
  {
    icon: Table2,
    title: 'Table Builder',
    description:
      'Build tables in a spreadsheet-like grid and get the LaTeX tabular code generated live. Insert at cursor with one click.',
  },
  {
    icon: Download,
    title: 'Project Export',
    description:
      'Download your entire project as a structured .zip — main.tex, references.bib, images/, and diagrams/ — ready for Overleaf or local compilation.',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Create a project',
    body: 'Pick a template — IEEE, Mini Project, Seminar, or FYP. Your LaTeX workspace is ready immediately with the correct structure and packages.',
  },
  {
    number: '02',
    title: 'Write your content',
    body: 'Type or paste content into each chapter. Use the AI Panel to humanize text, or the LaTeX Converter to turn plain paragraphs into formatted LaTeX.',
  },
  {
    number: '03',
    title: 'Add diagrams, images, tables, and citations',
    body: 'Open the built-in draw.io editor, upload images, build tables, and manage IEEE references — all without leaving the page.',
  },
  {
    number: '04',
    title: 'Compile and export',
    body: 'Click Compile to see a live PDF preview. Click Export to download the complete project.zip, ready to submit or open in Overleaf.',
  },
];

const TEMPLATES = [
  {
    id: 'ieee_report',
    label: 'IEEE Standard Report',
    chapters: ['Introduction', 'Related Work', 'Methodology', 'Results', 'Conclusion'],
    badge: 'Conference',
  },
  {
    id: 'mini_project',
    label: 'Mini Project Report',
    chapters: ['Introduction', 'Literature Survey', 'System Design', 'Implementation', 'Testing', '+ 2 more'],
    badge: '3rd Year',
  },
  {
    id: 'seminar',
    label: 'Seminar Report',
    chapters: ['Introduction', 'Background', 'Literature Review', 'Applications', 'Conclusion'],
    badge: 'Seminar',
  },
  {
    id: 'fyp',
    label: 'Final Year Project',
    chapters: ['Introduction', 'Literature Review', 'System Design', 'Implementation', 'Testing', '+ 3 more'],
    badge: '4th Year',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <LandingNav />

      <main className="overflow-hidden">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="relative pt-32 pb-20 px-4 sm:px-6 text-center">
          {/* Background gradient blob */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 overflow-hidden"
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
          </div>

          <div className="max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-5 text-xs">
              Open Source · MIT License · Free Forever
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              The Engineering{' '}
              <span className="text-primary">Report Workspace</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Write, humanize, diagram, cite, compile — all in one tab.
              Stop switching between Overleaf, draw.io, AI humanizers, and PDF converters.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="gap-2 text-base">
                <Link href="/register">
                  Start Writing Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2 text-base">
                <a
                  href="https://github.com/Heramb1221/latex-report-studio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Problem — tool replacement table ──────────────────────────── */}
        <section className="py-16 px-4 sm:px-6 bg-muted/20">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              One workspace. Six tools replaced.
            </h2>
            <p className="text-muted-foreground">
              Engineering students typically juggle six separate applications to
              write a single technical report. This replaces all of them.
            </p>
          </div>

          <div className="max-w-2xl mx-auto divide-y rounded-xl border bg-card overflow-hidden">
            {REPLACED_TOOLS.map((tool) => (
              <div
                key={tool.label}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm line-through text-muted-foreground/60">
                    {tool.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  <span className="font-medium">{tool.replaced}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features grid ─────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Everything in one editor
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Every feature you need to write, format, and submit a
                professional engineering report — without leaving the tab.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold">{feature.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                From blank page to PDF in four steps
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="flex gap-4 rounded-xl border bg-card p-5"
                >
                  <span className="text-3xl font-bold text-primary/20 shrink-0 leading-none mt-0.5">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="font-semibold mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Templates ─────────────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                Start with the right template
              </h2>
              <p className="text-muted-foreground">
                Four engineering report formats with correct chapter structure
                and LaTeX packages pre-configured.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold leading-snug">
                      {template.label}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {template.badge}
                    </Badge>
                  </div>
                  <ul className="space-y-1.5">
                    {template.chapters.map((ch) => (
                      <li
                        key={ch}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground"
                      >
                        <FileText className="h-3 w-3 shrink-0 opacity-50" />
                        {ch}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Open Source CTA ───────────────────────────────────────────── */}
        <section className="py-20 px-4 sm:px-6 bg-muted/20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-4 mb-6">
              <Github className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Fully open source
            </h2>
            <p className="text-muted-foreground mb-2 leading-relaxed">
              MIT licensed. No ads. No tracking. No paywalls. Self-host it for
              your department, contribute features, or fork it for your own
              institution.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Built by{' '}
              <a
                href="https://github.com/Heramb1221"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:no-underline"
              >
                Heramb
              </a>{' '}
              at RCPIT, Shirpur — as a real tool for real engineering students.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="gap-2">
                <Link href="/register">
                  <Play className="h-4 w-4 fill-current" />
                  Start Writing Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="gap-2">
                <a
                  href="https://github.com/Heramb1221/latex-report-studio"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" />
                  Star on GitHub
                </a>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <LandingFooter />
    </>
  );
}
