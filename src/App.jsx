// import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
// import Login from "./pages/Login.jsx";
// import Dashboard from "./pages/Dashboard.jsx";
// import LeadTable from "./pages/LeadTable.jsx";
// import LeadSummary from "./pages/fetchSummary.jsx";
// import MailTable from "./pages/MailTable.jsx";
// import MailCaptureForm from "./pages/MailCaptureForm.jsx";
// import AdminPanel from "./pages/AdminPanel.jsx";
// import Cookies from "js-cookie";
// import { useEffect, useState } from "react";
// import { Toaster } from "react-hot-toast";
// import ProtectedLayout from "./store/ProtectedLayout.jsx";

// function ProtectedRoute({ children }) {
//   const token = Cookies.get("token");
//   return token ? children : <Navigate to="/" replace />;
// }
// // sheshnath
// export default function App() {
//   const [token, setToken] = useState(null);
//   const [checking, setChecking] = useState(true);

//   useEffect(() => {
//     const t = Cookies.get("token");
//     setToken(t || null);

//     // WAIT until cookie is checked → prevents sidebar flash
//     setTimeout(() => setChecking(false), 50);
//   }, []);

//   if (checking) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-gray-100">
//         {/* No flash — clean transition */}
//       </div>
//     );
//   }
//   return (
//     <>
//       <BrowserRouter>
//         <Routes>
//           {/* LOGIN PAGE — NO SIDEBAR, NO SCROLL */}
//           <Route
//             path="/"
//             element={
//               <div className="min-h-screen overflow-hidden">
//                 <Login />
//               </div>
//             }
//           />

//           {/* PROTECTED PAGES WITH SIDEBAR */}
//           <Route
//             path="*"
//             element={
//               <ProtectedLayout>
//                 <Routes>
//                   <Route path="/dashboard" element={<Dashboard />} />
//                   <Route path="/leads" element={<LeadTable />} />
//                   <Route path="/summary" element={<LeadSummary />} />
//                   <Route path="/mails" element={<MailTable />} />
//                   <Route path="/compose" element={<MailCaptureForm />} />
//                   <Route path="/admin" element={<AdminPanel />} />
//                 </Routes>
//               </ProtectedLayout>
//             }
//           />
//         </Routes>
//       </BrowserRouter>

//       <Toaster position="top-right" />
//     </>
//   );
// }

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LeadTable from "./pages/LeadTable.jsx";
import LeadSummary from "./pages/fetchSummary.jsx";
import MailTable from "./pages/MailTable.jsx";
import MailSummary from "./pages/Mailsummary.jsx"
// import MailCaptureForm from "./pages/MailCaptureForm.jsx";
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
    setTimeout(() => setChecking(false), 50);
  }, []);

  if (checking) {
    return <div className="h-screen flex items-center justify-center bg-gray-100" />;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
<<<<<<< HEAD

          {/* CRM LOGIN (PUBLIC) */}
=======
          {/* LOGIN */}
>>>>>>> 1067af153db8b8b566fd192c9a2e3aba0308253c
          <Route
            path="/"
            element={
              <div className="min-h-screen overflow-hidden">
                <Login />
              </div>
            }
          />

<<<<<<< HEAD
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

=======
          {/* PROTECTED PAGES WITH SIDEBAR */}
          <Route
            path="*"
            element={
              <ProtectedLayout>
                <Routes>
                  <Route path="/dashboard"    element={<Dashboard />} />
                  <Route path="/leads"        element={<LeadTable />} />
                  <Route path="/summary"      element={<LeadSummary />} />
                  <Route path="/mails"        element={<MailTable />} />
                  <Route path="/mail-summary" element={<MailSummary />} />
                  {/* Mail Summary → fetchSummary.jsx ka "Mail Summary" tab use karo */}
                  <Route path="/admin"        element={<AdminPanel />} />
                </Routes>
              </ProtectedLayout>
            }
          />
>>>>>>> 1067af153db8b8b566fd192c9a2e3aba0308253c
        </Routes>
      </BrowserRouter>


      <Toaster position="top-right" />
    </>
  );
}