'use client';

import { useState } from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { KeyRound, ExternalLink, CheckCircle2, Trash2 } from 'lucide-react';

export function ApiKeyForm() {
  const { hasKey, last4, isLoading, saveKey, isSaving, deleteKey, isDeleting } =
    useApiKey();

  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();

    if (!trimmed) {
      setError('API key is required');
      return;
    }
    if (trimmed.length < 20) {
      setError("That doesn't look like a valid Gemini API key");
      return;
    }

    try {
      await saveKey(trimmed);
      setInputValue('');
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>
    );
  }

  // ── Key configured, not editing ───────────────────────────────────────────
  if (hasKey && !isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Gemini API Key
          </CardTitle>
          <CardDescription>
            Used for the AI Humanizer and LaTeX Converter. Your key is encrypted
            and never shared.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2.5 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <span className="font-mono text-muted-foreground">
              •••• •••• •••• {last4}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">Active</span>
          </div>
        </CardContent>

        <CardFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Update key
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove your Gemini API key?</AlertDialogTitle>
                <AlertDialogDescription>
                  The AI Humanizer and LaTeX Converter will stop working until
                  you add a new key.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteKey()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remove key
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    );
  }

  // ── No key, or editing ────────────────────────────────────────────────────
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          Gemini API Key
        </CardTitle>
        <CardDescription>
          Required for the AI Humanizer and LaTeX Converter. Get a free key at{' '}
          <a
            href="https://aistudio.google.com/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-foreground underline underline-offset-2 hover:no-underline"
          >
            Google AI Studio
            <ExternalLink className="h-3 w-3" />
          </a>
          .
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSave}>
        <CardContent className="space-y-1.5">
          <Label htmlFor="gemini-key">API Key</Label>
          <Input
            id="gemini-key"
            type="password"
            placeholder="AIza…"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (error) setError('');
            }}
            disabled={isSaving}
            autoComplete="off"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <p className="text-xs text-muted-foreground">
            We verify the key with a test call before saving it. Your key is
            encrypted with AES-256 and stored securely.
          </p>
        </CardContent>

        <CardFooter className="gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Verifying…' : 'Save key'}
          </Button>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setInputValue('');
                setError('');
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
