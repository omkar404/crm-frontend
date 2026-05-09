import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useWorkdeskAuthStore } from "@/store/workdeskAuth.store";

export default function WorkdeskProtectedRoute() {
  const { user, loading, fetchMe } = useWorkdeskAuthStore();

  useEffect(() => {
    if (loading && !user) {
      fetchMe();
    }
  }, [fetchMe, loading, user]);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/workdesk-login" replace />;
  }

  return <Outlet />;
}
