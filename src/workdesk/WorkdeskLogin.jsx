import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { successToast, errorToast } from "@/utils/customToast";
import { useNavigate } from "react-router-dom";


import Logo from "../assets/CRM.jpg"; // reuse same logo
import { workdeskLoginApi } from "@/api/workdeskAuth.api";

export default function WorkdeskLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔒 Disable body scroll (same UX as CRM login)
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

const handleWorkdeskLogin = async (e) => {
  e.preventDefault();
  if (loading) return;

  try {
    setLoading(true);

    await workdeskLoginApi({ email, password });

    successToast("Workdesk login successful");
    navigate("/workdesk/dashboard");

  } catch (err) {
    errorToast("Invalid Workdesk credentials");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">

      {/* LEFT PANEL */}
      <div className="hidden md:flex flex-col items-center justify-center bg-white overflow-hidden">
        <img
          src={Logo}
          alt="Workdesk Logo"
          className="w-[360px] object-contain select-none drop-shadow-lg"
        />
      </div>

      {/* RIGHT PANEL */}
      <div className="flex items-center justify-center bg-gray-50 overflow-hidden">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-[380px] border border-gray-100">
          <h2
            className="
              text-2xl font-bold text-center mb-6 tracking-tight
              bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500
              bg-clip-text text-transparent
            "
          >
            Workdesk Login
          </h2>

          <form onSubmit={handleWorkdeskLogin} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                placeholder="you@company.com"
                onChange={(e) => setEmail(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Password
              </label>
              <Input
                type="password"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90 text-white"
            >
              {loading ? "Signing in..." : "Login to Workdesk"}
            </Button>
          </form>

          {/* Back to CRM */}
          <div className="mt-6 text-center">
            <button
              onClick={() => (window.location.href = "/")}
              className="w-full h-12 mt-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90 text-white"
            >
              Back to CRM Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
