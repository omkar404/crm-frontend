import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LeadTable from "./pages/LeadTable.jsx";
import LeadSummary from "./pages/fetchSummary.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import ProtectedLayout from "./store/ProtectedLayout.jsx";
import WorkdeskLogin from "@/workdesk/WorkdeskLogin.jsx";
import OperationsOverview from "./workdesk/pages/OperationsOverview.jsx";
import WorkdeskLayout from "./workdesk/WorkdeskLayout.jsx";
import WorkdeskProtectedRoute from "./workdesk/WorkdeskProtectedRoute.jsx";
import WorkdeskDirectory from "./workdesk/pages/Client & CHA Directory/WorkdeskDirectory.jsx";
import InvoiceDesk from "./workdesk/pages/Invoice Issuance & Tracking/InvoiceDesk.jsx";
import WorkAllocationDesk from "./workdesk/pages/Work Allocation Desk/WorkAllocationDesk.jsx";


function ProtectedRoute({ children }) {
  const token = Cookies.get("token");
  return token ? children : <Navigate to="/" replace />;
}

export default function App() {
  const [token, setToken] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const t = Cookies.get("token");
    setToken(t || null);

    // WAIT until cookie is checked → prevents sidebar flash
    setTimeout(() => setChecking(false), 50);
  }, []);

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        {/* No flash — clean transition */}
      </div>
    );
  }
  return (
    <>
      <BrowserRouter>
        <Routes>

          {/* CRM LOGIN (PUBLIC) */}
          <Route
            path="/"
            element={
              <div className="min-h-screen overflow-hidden">
                <Login />
              </div>
            }
          />

          {/* CRM PROTECTED */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<LeadTable />} />
            <Route path="/summary" element={<LeadSummary />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Route>

          {/* WORKDESK LOGIN (PUBLIC) */}
          <Route path="/workdesk-login" element={<WorkdeskLogin />} />

          {/* WORKDESK PROTECTED */}
          <Route element={<WorkdeskProtectedRoute />}>
            {/* <Route path="/workdesk/dashboard" element={<WorkdeskDashboard />} /> */}

            <Route path="/workdesk" element={<WorkdeskLayout />}>
              <Route path="dashboard" element={<OperationsOverview />} />
              <Route path="directory" element={<WorkdeskDirectory />} />
              <Route path="invoices" element={ <InvoiceDesk/>} />
              <Route path="tasks" element={< WorkAllocationDesk />} />
            </Route>

          </Route>

        </Routes>
      </BrowserRouter>


      <Toaster position="top-right" />
    </>
  );
}
