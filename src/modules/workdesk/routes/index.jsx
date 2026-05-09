import { Route } from "react-router-dom";

import WorkdeskLogin from "@/workdesk/WorkdeskLogin.jsx";
import WorkdeskProtectedRoute from "@/workdesk/WorkdeskProtectedRoute.jsx";

import WorkdeskShell from "../layouts/WorkdeskShell.jsx";
import InvoiceDeskPage from "../pages/InvoiceDeskPage.jsx";
import OperationsOverviewPage from "../pages/OperationsOverviewPage.jsx";
import WorkAllocationDeskPage from "../pages/WorkAllocationDeskPage.jsx";
import WorkdeskDirectoryPage from "../pages/WorkdeskDirectoryPage.jsx";
import WorkdeskSettingsPage from "../pages/WorkdeskSettingsPage.jsx";

export function getWorkdeskRoutes() {
  return (
    <>
      <Route path="/workdesk-login" element={<WorkdeskLogin />} />

      <Route element={<WorkdeskProtectedRoute />}>
        <Route path="/workdesk" element={<WorkdeskShell />}>
          <Route path="dashboard" element={<OperationsOverviewPage />} />
          <Route path="directory" element={<WorkdeskDirectoryPage />} />
          <Route path="invoices" element={<InvoiceDeskPage />} />
          <Route path="tasks" element={<WorkAllocationDeskPage />} />
          <Route path="settings" element={<WorkdeskSettingsPage />} />
        </Route>
      </Route>
    </>
  );
}
