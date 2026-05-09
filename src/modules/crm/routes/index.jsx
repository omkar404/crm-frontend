import { Route } from "react-router-dom";

import Dashboard from "@/pages/Dashboard.jsx";
import LeadTable from "@/pages/LeadTable.jsx";
import LeadSummary from "@/pages/fetchSummary.jsx";
import Login from "@/pages/Login.jsx";
import MailSummary from "@/pages/Mailsummary.jsx";
import MailTable from "@/pages/MailTable.jsx";
import ProtectedLayout from "@/store/ProtectedLayout.jsx";

export function getCrmRoutes() {
  return (
    <>
      <Route
        path="/"
        element={
          <div className="min-h-screen overflow-hidden">
            <Login />
          </div>
        }
      />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<LeadTable />} />
        <Route path="/summary" element={<LeadSummary />} />
        <Route path="/mails" element={<MailTable />} />
        <Route path="/mail-summary" element={<MailSummary />} />
      </Route>
    </>
  );
}
