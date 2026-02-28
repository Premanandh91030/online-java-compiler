import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Code2 } from 'lucide-react';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState('');

  const isAuthenticated = !!identity;
  const showModal = isAuthenticated && !isLoading && isFetched && userProfile === null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await saveProfile.mutateAsync({ name: trimmed });
  };

  return (
    <Dialog open={showModal}>
      <DialogContent
        className="bg-card border-border sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-editor-accent/15 border border-editor-accent/30 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-editor-accent" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg">Welcome to CodeForge!</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Set up your profile to get started
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium">
              Your Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-editor-accent"
                autoFocus
                maxLength={50}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This name will be displayed in your profile.
            </p>
          </div>

          <Button
            type="submit"
            disabled={!name.trim() || saveProfile.isPending}
            className="w-full bg-editor-accent hover:bg-editor-accent/90 text-white font-semibold"
          >
            {saveProfile.isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              'Get Started'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
