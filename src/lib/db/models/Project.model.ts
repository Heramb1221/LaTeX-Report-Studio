import mongoose, { Schema, Model, Document, Types } from 'mongoose';
import type { ProjectTemplate } from '@/types';
import { DIAGRAM_TYPES } from '@/lib/diagram/constants';

// REPLACES src/lib/db/models/Project.model.ts from Phase 3.
// Only change: DiagramSchema and IDiagramDoc gain an optional `diagramType` field.

// ─── Sub-document interfaces ──────────────────────────────────────────────────

export interface IChapterDoc {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface IReferenceDoc {
  id: string;
  citeKey: string;
  entryType: 'article' | 'book' | 'inproceedings' | 'misc' | 'online';
  fields: Record<string, string>;
  bibtex: string;
}

export interface IImageDoc {
  id: string;
  originalName: string;
  r2Key: string;
  publicUrl: string;
  latexCommand: string;
}

export interface IDiagramDoc {
  id: string;
  name: string;
  diagramType?: string;
  drawioXml: string;
  pngR2Key?: string;
  pngUrl?: string;
  latexCommand?: string;
}

export interface IProjectDocument extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  template: ProjectTemplate;
  chapters: IChapterDoc[];
  references: IReferenceDoc[];
  images: IImageDoc[];
  diagrams: IDiagramDoc[];
  mainTexOverride?: string;
  lastCompiledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const ChapterSchema = new Schema<IChapterDoc>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const ReferenceSchema = new Schema<IReferenceDoc>(
  {
    id: { type: String, required: true },
    citeKey: { type: String, required: true },
    entryType: {
      type: String,
      enum: ['article', 'book', 'inproceedings', 'misc', 'online'],
      required: true,
    },
    fields: { type: Schema.Types.Mixed, default: {} },
    bibtex: { type: String, required: true },
  },
  { _id: false }
);

const ImageSchema = new Schema<IImageDoc>(
  {
    id: { type: String, required: true },
    originalName: { type: String, required: true },
    r2Key: { type: String, required: true },
    publicUrl: { type: String, required: true },
    latexCommand: { type: String, required: true },
  },
  { _id: false }
);

const DiagramSchema = new Schema<IDiagramDoc>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    diagramType: { type: String, enum: DIAGRAM_TYPES },
    drawioXml: { type: String, required: true },
    pngR2Key: String,
    pngUrl: String,
    latexCommand: String,
  },
  { _id: false }
);

// ─── Project schema ───────────────────────────────────────────────────────────

const ProjectSchema = new Schema<IProjectDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [120, 'Project name must be 120 characters or fewer'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description must be 300 characters or fewer'],
    },
    template: {
      type: String,
      enum: ['ieee_report', 'mini_project', 'seminar', 'fyp'],
      required: true,
    },
    chapters: { type: [ChapterSchema], default: [] },
    references: { type: [ReferenceSchema], default: [] },
    images: { type: [ImageSchema], default: [] },
    diagrams: { type: [DiagramSchema], default: [] },
    mainTexOverride: String,
    lastCompiledAt: Date,
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ userId: 1, updatedAt: -1 });

export const Project: Model<IProjectDocument> =
  (mongoose.models.Project as Model<IProjectDocument>) ??
  mongoose.model<IProjectDocument>('Project', ProjectSchema);
