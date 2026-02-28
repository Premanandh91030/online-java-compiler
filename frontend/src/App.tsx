import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import LoginPage from './pages/LoginPage';
import EditorPage from './pages/EditorPage';
import HistoryPage from './pages/HistoryPage';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Toaster } from '@/components/ui/sonner';

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster theme="dark" position="bottom-right" />
    </>
  );
}

function AuthenticatedLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && !identity) {
      navigate({ to: '/login' });
    }
  }, [identity, isInitializing, navigate]);

  // While initializing, show nothing to avoid flash
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-editor-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-editor-accent/30 border-t-editor-accent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm font-mono">Initializing...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — render nothing while redirect happens
  if (!identity) {
    return null;
  }

  return (
    <Layout>
      <ProfileSetupModal />
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({ component: RootComponent });

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/editor' });
  },
  component: () => null,
});

const editorRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/editor',
  component: EditorPage,
});

const historyRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/history',
  component: HistoryPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  authenticatedRoute.addChildren([editorRoute, historyRoute]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
