"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// A simple loading component
const FullPageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ("ADMIN" | "VILLAGER")[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until loading is complete before doing anything
    if (isLoading) {
      return;
    }

    // If loading is done and there's no user, redirect to login
    if (!user) {
      router.push("/login");
      return;
    }

    // If the user is logged in but their role is not allowed, redirect them
    if (!allowedRoles.includes(user.role)) {
      const targetDashboard = user.role === 'ADMIN' ? '/admin-dashboard' : '/villager-dashboard';
      router.push(targetDashboard);
    }
  }, [user, isLoading, router, allowedRoles]);

  // If we are still loading, or if the user isn't the right role yet, show the loader.
  // The useEffect will handle the redirect.
  if (isLoading || !user || !allowedRoles.includes(user.role)) {
    return <FullPageLoader />;
  }

  // Only if all checks pass, render the actual page content.
  return <>{children}</>;
}