import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

const adminAccessEnabled = false;

export function ProtectedRoute({ children }: PropsWithChildren) {
  if (!adminAccessEnabled) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
