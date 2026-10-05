import { Navigate, Outlet, useLocation } from 'react-router';
import { PageLoader } from '../components/ui';
import { useAuth } from './AuthContext';

/** Routes that need a session; bounces to /login and remembers where to return. */
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Login and register; signed-in users go straight to the app. */
export function GuestOnly() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
