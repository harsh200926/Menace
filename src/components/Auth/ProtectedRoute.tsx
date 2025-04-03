import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  redirectPath = "/login" 
}: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // For development mode - bypass authentication check
  const isDevelopment = process.env.NODE_ENV === 'development';
  const bypassAuth = isDevelopment && localStorage.getItem('bypassAuth') === 'true';
  
  // Allow authentication bypass in development mode
  if (bypassAuth && isDevelopment) {
    console.warn('⚠️ Authentication bypassed in development mode');
    return <>{children}</>;
  }

  // Show nothing while loading authentication state
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to={redirectPath} state={{ from: location.pathname }} replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
} 