import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { UserProfile, JavaCodeSnippet } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch (err) {
        // If unauthorized (anonymous/guest), return null gracefully
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && !actorFetching && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Java Code Snippets ───────────────────────────────────────────────────────

export function useGetUserJavaCodeSnippets() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<JavaCodeSnippet[]>({
    queryKey: ['javaCodeSnippets'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getUserJavaCodeSnippets();
      } catch (err) {
        // Return empty array on auth errors rather than crashing
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
    staleTime: 1000 * 30,
  });
}

export function useSubmitJavaCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitJavaCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['javaCodeSnippets'] });
    },
  });
}

export function useDeleteUserJavaCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timestamp: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteUserJavaCode(timestamp);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['javaCodeSnippets'] });
    },
  });
}

export function useSearchJavaCodeSnippets(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<JavaCodeSnippet[]>({
    queryKey: ['javaCodeSnippets', 'search', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.searchJavaCodeSnippets(searchTerm);
      } catch (err) {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!identity && searchTerm.length > 0,
    retry: false,
  });
}
