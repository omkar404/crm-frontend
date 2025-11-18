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
          {/* LOGIN PAGE — NO SIDEBAR, NO SCROLL */}
          <Route
            path="/"
            element={
              <div className="min-h-screen overflow-hidden">
                <Login />
              </div>
            }
          />

          {/* PROTECTED PAGES WITH SIDEBAR */}
          <Route
            path="*"
            element={
              <ProtectedLayout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/leads" element={<LeadTable />} />
                  <Route path="/summary" element={<LeadSummary />} />
                  <Route path="/admin" element={<AdminPanel />} />
                </Routes>
              </ProtectedLayout>
            }
          />
        </Routes>
      </BrowserRouter>

      <Toaster position="top-right" />
    </>
  );
}
