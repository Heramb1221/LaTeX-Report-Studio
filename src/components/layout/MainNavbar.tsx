'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileText, LayoutDashboard, Settings, LogOut } from 'lucide-react';

export function MainNavbar() {
  const { user, logout, isLoggingOut } = useAuth();

  // Build initials from the first two characters of the email
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* ── Logo ────────────────────────────────────────────────────── */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity shrink-0"
          >
            <FileText className="h-5 w-5 text-primary" />
            <span className="hidden sm:inline text-sm">LaTeX Report Studio</span>
            <span className="sm:hidden text-sm">LRS</span>
          </Link>

          {/* ── Right side ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full ml-1"
                  aria-label="User menu"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal py-2">
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email ?? 'Loading…'}
                  </p>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoggingOut ? 'Logging out…' : 'Log out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </div>
    </header>
  );
}
