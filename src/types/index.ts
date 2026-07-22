// REPLACES src/types/index.ts from Phase 8.
// Only addition: isbn and accessedDate on IReferenceFields, for book and
// online citation types respectively. Everything else is unchanged.

import type { DiagramType } from '@/lib/diagram/constants';
export type { DiagramType };

// ─── API Response wrapper ────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── Project enums ───────────────────────────────────────────────────────────

export type ProjectTemplate = 'ieee_report' | 'mini_project' | 'seminar' | 'fyp';

export const PROJECT_TEMPLATE_LABELS: Record<ProjectTemplate, string> = {
  ieee_report: 'IEEE Standard Report',
  mini_project: 'Mini Project Report',
  seminar: 'Seminar Report',
  fyp: 'Final Year Project',
};

// ─── Sub-document types ───────────────────────────────────────────────────────

export interface IChapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface IReferenceFields {
  title: string;
  author: string;
  year: string;
  journal?: string;
  booktitle?: string;
  volume?: string;
  pages?: string;
  publisher?: string;
  address?: string;
  isbn?: string;
  doi?: string;
  url?: string;
  note?: string;
  accessedDate?: string;
}

export interface IReference {
  id: string;
  citeKey: string;
  entryType: 'article' | 'book' | 'inproceedings' | 'misc' | 'online';
  fields: IReferenceFields;
  bibtex: string;
}

export interface IImage {
  id: string;
  originalName: string;
  r2Key: string;
  publicUrl: string;
  latexCommand: string;
}

export interface IDiagram {
  id: string;
  name: string;
  diagramType?: DiagramType;
  drawioXml: string;
  pngR2Key?: string;
  pngUrl?: string;
  latexCommand?: string;
}

// ─── Top-level document types ────────────────────────────────────────────────

export interface IProject {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  template: ProjectTemplate;
  chapters: IChapter[];
  references: IReference[];
  images: IImage[];
  diagrams: IDiagram[];
  mainTexOverride?: string;
  lastCompiledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  _id: string;
  email: string;
  isEmailVerified: boolean;
  hasGeminiKey: boolean;
  createdAt: string;
}

// ─── Auth types ──────────────────────────────────────────────────────────────

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthContext {
  userId: string;
  email: string;
}

// ─── Form input types ────────────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  template: ProjectTemplate;
}

export interface CitationInput {
  entryType: IReference['entryType'];
  fields: IReferenceFields;
}

// ─── Compile result ──────────────────────────────────────────────────────────

export interface CompileResult {
  pdfBase64?: string;
  error?: string;
  log?: string;
}
