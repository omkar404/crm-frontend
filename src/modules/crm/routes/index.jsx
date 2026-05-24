import { lazy, Suspense } from "react";
import { Route } from "react-router-dom";

const Dashboard = lazy(() => import("@/pages/Dashboard.jsx"));
const LeadTable = lazy(() => import("@/pages/LeadTable.jsx"));
const LeadSummary = lazy(() => import("@/pages/fetchSummary.jsx"));
const Login = lazy(() => import("@/pages/Login.jsx"));
const MailSummary = lazy(() => import("@/pages/Mailsummary.jsx"));
const MailTable = lazy(() => import("@/pages/MailTable.jsx"));
import ProtectedLayout from "@/store/ProtectedLayout.jsx";

function RouteLoader() {
  return <div className="min-h-screen bg-gray-100" />;
}

export function getCrmRoutes() {
  return (
    <>
      <Route
        path="/"
        element={
          <Suspense fallback={<RouteLoader />}>
            <div className="min-h-screen overflow-hidden">
              <Login />
            </div>
          </Suspense>
        }
      />

      <Route element={<ProtectedLayout />}>
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<RouteLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/leads"
          element={
            <Suspense fallback={<RouteLoader />}>
              <LeadTable />
            </Suspense>
          }
        />
        <Route
          path="/summary"
          element={
            <Suspense fallback={<RouteLoader />}>
              <LeadSummary />
            </Suspense>
          }
        />
        <Route
          path="/mails"
          element={
            <Suspense fallback={<RouteLoader />}>
              <MailTable />
            </Suspense>
          }
        />
        <Route
          path="/mail-summary"
          element={
            <Suspense fallback={<RouteLoader />}>
              <MailSummary />
            </Suspense>
          }
        />
      </Route>
    </>
  );
}
