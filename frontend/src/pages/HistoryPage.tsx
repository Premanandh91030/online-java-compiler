import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetUserJavaCodeSnippets, useDeleteUserJavaCode } from '../hooks/useQueries';
import CodeSnippetCard from '../components/CodeSnippetCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { History, Search, Terminal, Plus, RefreshCw } from 'lucide-react';

export default function HistoryPage() {
  const { data: snippets, isLoading, error, refetch, isFetching } = useGetUserJavaCodeSnippets();
  const deleteSnippet = useDeleteUserJavaCode();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const sortedSnippets = snippets
    ? [...snippets].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  const filteredSnippets = searchTerm.trim()
    ? sortedSnippets.filter((s) =>
        s.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sortedSnippets;

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-editor-accent/10 border border-editor-accent/20 flex items-center justify-center">
            <History className="w-5 h-5 text-editor-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Code History</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Loading...' : `${sortedSnippets.length} submission${sortedSnippets.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            size="sm"
            onClick={() => navigate({ to: '/editor' })}
            className="bg-editor-accent hover:bg-editor-accent/90 text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            New Code
          </Button>
        </div>
      </div>

      {/* Search */}
      {!isLoading && sortedSnippets.length > 0 && (
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search your code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-editor-accent font-mono text-sm"
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32 bg-secondary" />
                <Skeleton className="h-4 w-16 bg-secondary" />
              </div>
              <Skeleton className="h-16 w-full bg-secondary" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <Terminal className="w-6 h-6 text-destructive" />
          </div>
          <p className="text-foreground font-medium mb-1">Failed to load history</p>
          <p className="text-muted-foreground text-sm mb-4">
            {error instanceof Error ? error.message : 'An error occurred'}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : filteredSnippets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {searchTerm ? (
            <>
              <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">No results found</p>
              <p className="text-muted-foreground text-sm mb-4">
                No code snippets match "<span className="text-foreground font-mono">{searchTerm}</span>"
              </p>
              <Button variant="outline" size="sm" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-editor-accent/10 border border-editor-accent/20 flex items-center justify-center mb-5">
                <Terminal className="w-8 h-8 text-editor-accent" />
              </div>
              <p className="text-foreground font-semibold text-lg mb-2">No code submissions yet</p>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                Start coding in the editor! Your submitted code will appear here.
              </p>
              <Button
                onClick={() => navigate({ to: '/editor' })}
                className="bg-editor-accent hover:bg-editor-accent/90 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                Open Editor
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSnippets.map((snippet, index) => (
            <CodeSnippetCard
              key={`${snippet.timestamp}-${index}`}
              snippet={snippet}
              index={sortedSnippets.indexOf(snippet)}
              onDelete={(timestamp) => deleteSnippet.mutate(timestamp)}
              isDeleting={deleteSnippet.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
