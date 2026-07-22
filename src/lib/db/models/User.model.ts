import mongoose, { Schema, Model, Document } from 'mongoose';

// REPLACES src/lib/db/models/User.model.ts from Phase 2.
// Only addition: geminiKeyLast4 — stores the last 4 characters of the user's
// Gemini API key in plaintext purely for display ("•••• ab12" in Settings).
// This is not sensitive on its own (a 4-char fragment can't be used to
// reconstruct the key) and avoids decrypting the full key just to render a UI label.

export interface IUserDocument extends Document {
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationExpiry?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
  geminiApiKeyEncrypted?: string;
  geminiKeyLast4?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: { type: String },
    verificationExpiry: { type: Date },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },

    // AES-256-GCM encrypted Gemini API key (format: iv:tag:ciphertext)
    geminiApiKeyEncrypted: { type: String },

    // Last 4 chars of the raw key, plaintext, for UI display only
    geminiKeyLast4: { type: String },
  },
  {
    timestamps: true,
  }
);

export const User: Model<IUserDocument> =
  (mongoose.models.User as Model<IUserDocument>) ??
  mongoose.model<IUserDocument>('User', UserSchema);
