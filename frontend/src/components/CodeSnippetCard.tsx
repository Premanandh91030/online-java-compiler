import { useState } from 'react';
import type { JavaCodeSnippet } from '../backend';
import { ChevronDown, ChevronUp, Clock, Copy, Check, Trash2, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CodeSnippetCardProps {
  snippet: JavaCodeSnippet;
  index: number;
  onDelete: (timestamp: bigint) => void;
  isDeleting: boolean;
}

function formatTimestamp(timestamp: bigint): string {
  // ICP timestamps are in nanoseconds
  const ms = Number(timestamp / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getCodePreview(code: string, maxLength = 120): string {
  const firstLine = code.split('\n').find((l) => l.trim().length > 0) || '';
  if (firstLine.length > maxLength) return firstLine.slice(0, maxLength) + '...';
  return firstLine;
}

export default function CodeSnippetCard({ snippet, index, onDelete, isDeleting }: CodeSnippetCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Code copied!');
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this code snippet?')) {
      onDelete(snippet.timestamp);
    }
  };

  const lineCount = snippet.code.split('\n').length;

  return (
    <div
      className="rounded-lg border border-border bg-card hover:border-editor-accent/30 transition-all duration-200 overflow-hidden animate-fade-in"
    >
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded bg-editor-accent/10 border border-editor-accent/20 flex items-center justify-center flex-shrink-0">
            <Code2 className="w-3.5 h-3.5 text-editor-accent" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">
                #{String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-mono text-editor-accent">Main.java</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground font-mono">{lineCount} lines</span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {formatTimestamp(snippet.timestamp)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-editor-green" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-foreground"
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Code Preview (collapsed) */}
      {!expanded && (
        <div className="px-4 pb-3">
          <div className="rounded bg-editor-bg border border-border px-3 py-2">
            <code className="text-xs font-mono text-muted-foreground truncate block">
              {getCodePreview(snippet.code)}
            </code>
          </div>
        </div>
      )}

      {/* Full Code (expanded) */}
      {expanded && (
        <div className="border-t border-border">
          <div className="flex items-center justify-between px-4 py-2 bg-editor-gutter">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-editor-red/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-editor-orange/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-editor-green/70" />
            </div>
            <span className="text-xs font-mono text-muted-foreground">Main.java</span>
          </div>
          <div className="flex bg-editor-bg overflow-auto editor-scrollbar max-h-80">
            {/* Line numbers */}
            <div
              className="select-none text-right pr-3 pl-3 py-3 text-xs font-mono text-muted-foreground/40 border-r border-border bg-editor-gutter leading-5 flex-shrink-0"
              style={{ minWidth: '3rem' }}
              aria-hidden="true"
            >
              {snippet.code.split('\n').map((_, i) => (
                <div key={i} className="leading-5">{i + 1}</div>
              ))}
            </div>
            {/* Code */}
            <pre className="flex-1 p-3 text-xs font-mono text-editor-text leading-5 overflow-x-auto">
              {snippet.code}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
