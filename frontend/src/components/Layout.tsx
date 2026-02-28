import { type ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Code2, Terminal, History, LogOut, User, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { data: userProfile } = useGetCallerUserProfile();

  const currentPath = routerState.location.pathname;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/login' });
  };

  const navLinks = [
    { path: '/editor', label: 'Editor', icon: Terminal },
    { path: '/history', label: 'History', icon: History },
  ];

  const displayName = userProfile?.name || identity?.getPrincipal().toString().slice(0, 8) + '...';

  return (
    <div className="min-h-screen bg-editor-bg flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-editor-bg/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => navigate({ to: '/editor' })}
          >
            <div className="w-7 h-7 rounded bg-editor-accent flex items-center justify-center">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-mono font-bold text-base text-foreground tracking-tight hidden sm:block">
              PREMJI <span className="text-editor-accent">COMPILER</span>
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            {/* Home Button */}
            <button
              onClick={() => navigate({ to: '/login' })}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary"
              title="Go to Home"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </button>

            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = currentPath === path;
              return (
                <button
                  key={path}
                  onClick={() => navigate({ to: path })}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-editor-accent/15 text-editor-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <div className="w-7 h-7 rounded-full bg-editor-accent/20 border border-editor-accent/30 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-editor-accent" />
                </div>
                <span className="hidden sm:inline text-sm font-mono max-w-[120px] truncate">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-card border-border">
              <div className="px-3 py-2">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-sm font-medium text-foreground truncate font-mono">
                  {displayName}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate({ to: '/login' })}
                className="cursor-pointer"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: '/editor' })}
                className="cursor-pointer"
              >
                <Terminal className="w-4 h-4 mr-2" />
                Editor
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate({ to: '/history' })}
                className="cursor-pointer"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} PREMJI COMPILER</span>
          <span>
            Built with{' '}
            <span className="text-editor-red">♥</span>
            {' '}using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'premji-compiler')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-editor-accent hover:underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
