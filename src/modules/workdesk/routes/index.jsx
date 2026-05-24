import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";

const WorkdeskLogin = lazy(() => import("@/workdesk/WorkdeskLogin.jsx"));
const WorkdeskProtectedRoute = lazy(() => import("@/workdesk/WorkdeskProtectedRoute.jsx"));
const WorkdeskShell = lazy(() => import("../layouts/WorkdeskShell.jsx"));
const ActiveWorkflowPage = lazy(() => import("../pages/ActiveWorkflowPage.jsx"));
const InvoiceDeskPage = lazy(() => import("../pages/InvoiceDeskPage.jsx"));
const OperationsOverviewPage = lazy(() => import("../pages/OperationsOverviewPage.jsx"));
const WorkAllocationDeskPage = lazy(() => import("../pages/WorkAllocationDeskPage.jsx"));
const WorkdeskDirectoryPage = lazy(() => import("../pages/WorkdeskDirectoryPage.jsx"));
const WorkdeskSettingsPage = lazy(() => import("../pages/WorkdeskSettingsPage.jsx"));

function RouteLoader() {
  return <div className="min-h-screen bg-gray-100" />;
}

export function getWorkdeskRoutes() {
  return (
    <>
      <Route
        path="/workdesk-login"
        element={
          <Suspense fallback={<RouteLoader />}>
            <WorkdeskLogin />
          </Suspense>
        }
      />

      <Route
        element={
          <Suspense fallback={<RouteLoader />}>
            <WorkdeskProtectedRoute />
          </Suspense>
        }
      >
        <Route
          path="/workdesk"
          element={
            <Suspense fallback={<RouteLoader />}>
              <WorkdeskShell />
            </Suspense>
          }
        >
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<RouteLoader />}>
                <OperationsOverviewPage />
              </Suspense>
            }
          />
          <Route
            path="directory"
            element={
              <Suspense fallback={<RouteLoader />}>
                <WorkdeskDirectoryPage />
              </Suspense>
            }
          />
          <Route
            path="invoices"
            element={
              <Suspense fallback={<RouteLoader />}>
                <InvoiceDeskPage />
              </Suspense>
            }
          />
          <Route
            path="tasks"
            element={
              <Suspense fallback={<RouteLoader />}>
                <WorkAllocationDeskPage />
              </Suspense>
            }
          />
          <Route
            path="active-workflow"
            element={
              <Suspense fallback={<RouteLoader />}>
                <ActiveWorkflowPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<RouteLoader />}>
                <WorkdeskSettingsPage />
              </Suspense>
            }
          />
        </Route>
      </Route>
    </>
  );
}
