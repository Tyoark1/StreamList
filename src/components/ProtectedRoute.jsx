import { Navigate, Outlet, useOutletContext } from 'react-router-dom';

export default function ProtectedRoute() {
  const { isAuthenticated, ...rest } = useOutletContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ isAuthenticated, ...rest }} />;
}