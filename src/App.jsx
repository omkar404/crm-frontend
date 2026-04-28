import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LeadTable from "./pages/LeadTable.jsx";
import LeadSummary from "./pages/fetchSummary.jsx";
import MailTable from "./pages/MailTable.jsx";
import MailSummary from "./pages/Mailsummary.jsx";
import ProtectedLayout from "./store/ProtectedLayout.jsx";
import WorkdeskLogin from "@/workdesk/WorkdeskLogin.jsx";
import WorkdeskLayout from "./workdesk/WorkdeskLayout.jsx";
import WorkdeskProtectedRoute from "./workdesk/WorkdeskProtectedRoute.jsx";
import OperationsOverview from "./workdesk/pages/OperationsOverview.jsx";
import WorkdeskDirectory from "./workdesk/pages/Client & CHA Directory/WorkdeskDirectory.jsx";
import InvoiceDesk from "./workdesk/pages/Invoice Issuance & Tracking/InvoiceDesk.jsx";
import WorkAllocationDesk from "./workdesk/pages/Work Allocation Desk/WorkAllocationDesk.jsx";

export default function App() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    Cookies.get("token");
    const timer = setTimeout(() => setChecking(false), 50);

    return () => clearTimeout(timer);
  }, []);

  if (checking) {
    return <div className="h-screen flex items-center justify-center bg-gray-100" />;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
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

          <Route path="/workdesk-login" element={<WorkdeskLogin />} />

          <Route element={<WorkdeskProtectedRoute />}>
            <Route path="/workdesk" element={<WorkdeskLayout />}>
              <Route path="dashboard" element={<OperationsOverview />} />
              <Route path="directory" element={<WorkdeskDirectory />} />
              <Route path="invoices" element={<InvoiceDesk />} />
              <Route path="tasks" element={<WorkAllocationDesk />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" />
    </>
  );
}
