import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Code2, Zap, Shield, History, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { login, loginStatus, identity, isLoggingIn } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/editor' });
    }
  }, [identity, navigate]);

  const features = [
    { icon: Terminal, label: 'Java Code Editor', desc: 'Write Java code with syntax-styled editor' },
    { icon: Zap, label: 'Scanner Input Support', desc: 'Provide stdin input for Scanner-based programs' },
    { icon: History, label: 'Code History', desc: 'Access all your previous submissions' },
    { icon: Shield, label: 'Secure Auth', desc: 'Powered by Internet Identity' },
  ];

  return (
    <div className="min-h-screen bg-editor-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-editor-accent flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-mono font-bold text-xl text-foreground tracking-tight">
              PREMJI <span className="text-editor-accent">COMPILER</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Branding */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-editor-accent/10 border border-editor-accent/20 text-editor-accent text-sm font-mono">
                <Zap className="w-3.5 h-3.5" />
                Online Java Compiler
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Write, Run &amp;{' '}
                <span className="text-editor-accent">Track</span>{' '}
                Your Java Code
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                A professional online Java editor with persistent code history and Scanner input support.
                Log in to save your work and access it anytime.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border hover:border-editor-accent/40 transition-colors"
                >
                  <div className="w-8 h-8 rounded bg-editor-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-editor-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{label}</p>
                    <p className="text-muted-foreground text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Login Card */}
          <div className="flex justify-center lg:justify-end animate-fade-in">
            <div className="w-full max-w-sm">
              <div className="bg-card border border-border rounded-xl p-8 shadow-editor">
                {/* Code preview decoration */}
                <div className="mb-6 rounded-lg bg-editor-bg border border-border overflow-hidden">
                  <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-editor-gutter">
                    <div className="w-2.5 h-2.5 rounded-full bg-editor-red/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-editor-orange/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-editor-green/70" />
                    <span className="ml-2 text-xs text-muted-foreground font-mono">Main.java</span>
                  </div>
                  <pre className="p-4 text-xs font-mono leading-relaxed overflow-hidden">
                    <span className="text-editor-accent">import</span>
                    <span className="text-foreground"> java.util.Scanner;</span>
                    {'\n'}
                    <span className="text-editor-accent">public class</span>
                    <span className="text-foreground"> Main </span>
                    <span className="text-muted-foreground">{'{'}</span>
                    {'\n'}
                    <span className="text-muted-foreground">{'  '}</span>
                    <span className="text-editor-accent">public static void</span>
                    <span className="text-foreground"> main</span>
                    <span className="text-muted-foreground">{'(String[] args) {'}</span>
                    {'\n'}
                    <span className="text-muted-foreground">{'    '}</span>
                    <span className="text-foreground">Scanner sc = </span>
                    <span className="text-editor-accent">new</span>
                    <span className="text-foreground"> Scanner(System.in);</span>
                    {'\n'}
                    <span className="text-muted-foreground">{'    '}</span>
                    <span className="text-foreground">System.out.println(sc.nextLine());</span>
                    {'\n'}
                    <span className="text-muted-foreground">{'  }'}</span>
                    {'\n'}
                    <span className="text-muted-foreground">{'}'}</span>
                  </pre>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground font-mono">
                      PREMJI <span className="text-editor-accent">COMPILER</span>
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      Sign in to start coding
                    </p>
                  </div>

                  <Button
                    onClick={() => login()}
                    disabled={isLoggingIn}
                    className="w-full bg-editor-accent hover:bg-editor-accent/90 text-white font-semibold"
                    size="lg"
                  >
                    {isLoggingIn ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 12 0 12 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Logging in...
                      </span>
                    ) : (
                      'Login to Start Coding'
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Secure authentication via Internet Identity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
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
