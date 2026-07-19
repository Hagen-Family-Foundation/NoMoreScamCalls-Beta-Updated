import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!isAuthenticated) {
    return <Navigate to="/portal/login" replace state={{ from: location }} />;
  }
  return children;
}

export function RequireAgreement({ children }) {
  const { hasAcceptedAgreement, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!hasAcceptedAgreement) {
    return <Navigate to="/portal/agreement" replace />;
  }
  return children;
}

export function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!isAdmin) {
    return <Navigate to="/portal/dashboard" replace />;
  }
  return children;
}
