import { useState, useEffect } from "react";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { successToast, errorToast } from "@/utils/customToast";
import { useAuth } from "../store/AuthContext";
import Logo from "../assets/CRM.jpg";
import api from "@/api/axios";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/api/auth/login", {
        email,
        password,
      });

      login(data.token);
      successToast("Login successful!");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 700);
    } catch (err) {
      errorToast("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f6f4ef] px-4 py-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(201,111,59,0.10),transparent_26%)]" />
      <div className="absolute inset-0 crm-mesh opacity-35" />

      <div className="crm-card relative w-full max-w-[430px] overflow-hidden p-8 sm:p-10">
        <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-teal-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="relative">
          <div className="flex justify-center">
            <div className="rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-[0_18px_45px_rgba(22,32,42,0.12)]">
              <img
                src={Logo}
                alt="CRM brand"
                className="h-24 w-24 rounded-[20px] object-cover sm:h-28 sm:w-28"
              />
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Eximinq CRM</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Portal Login</h2>
            <p className="mt-2 text-sm text-slate-600">
              Sign in to continue to your CRM workspace.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-2xl border-white/70 bg-[#fffdf8] pl-11 shadow-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  type="password"
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-2xl border-white/70 bg-[#fffdf8] pl-11 shadow-sm"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-2xl bg-[#16202A] text-base font-semibold text-white shadow-[0_18px_45px_rgba(22,32,42,0.22)] hover:bg-[#1d2a35]"
            >
              {loading ? "Signing in..." : "Enter CRM"}
              {!loading && <ArrowRight size={16} />}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                window.location.href = "/workdesk-login";
              }}
              className="h-12 w-full rounded-2xl border-slate-200 bg-white/80 text-slate-700 hover:bg-white"
            >
              Switch to Workdesk Panel
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
