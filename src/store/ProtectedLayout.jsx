import { Link, Navigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function ProtectedLayout({ children }) {
  const token = Cookies.get("token");
  if (!token) return <Navigate to="/" replace />;

  return (
    <div className="flex h-screen overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
        <h1 className="text-xl font-bold">CRM Panel</h1>

        <nav className="space-y-2">
          <Link to="/dashboard" className="block hover:text-blue-400">Dashboard</Link>
          <Link to="/leads" className="block hover:text-blue-400">Lead Table</Link>
          <Link to="/summary" className="block hover:text-blue-400">Lead Summary</Link>
          <Link to="/admin" className="block hover:text-blue-400">Admin Panel</Link>
        </nav>

        <button
          onClick={() => {
            Cookies.remove("token");
            window.location.href = "/";
          }}
          className="mt-4 block hover:text-red-400"
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto p-6 bg-gray-100">
        {children}
      </main>

    </div>
  );
}
