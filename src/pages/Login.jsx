import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

import api from "@/api/axios";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { errorToast, successToast } from "@/utils/customToast";
import Logo from "../assets/CRM.jpg";
import { useAuth } from "../store/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      const { data } = await api.post("/api/auth/login", { email, password });
      login(data.token);
      successToast("Login successful!");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 700);
    } catch {
      errorToast("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="CRM Portal"
      title="Welcome back"
      description="Please enter your details to sign in."
      badge="CRM access experience"
      logo={Logo}
      modeLabel="CRM Login"
      supportLabel="Professional access to your CRM workspace."
    >
      <form onSubmit={handleLogin} className="space-y-5">
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
              className="h-12 rounded-2xl border-white/70 bg-[#fffdf8] pl-11 shadow-sm transition focus-visible:ring-2"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <div className="relative">
            <LockKeyhole
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl border-white/70 bg-[#fffdf8] pl-11 pr-12 shadow-sm transition focus-visible:ring-2"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-[#16202A] text-base font-semibold text-white shadow-[0_18px_45px_rgba(22,32,42,0.22)] transition hover:bg-[#1d2a35]"
        >
          {loading ? "Signing in..." : "Enter CRM"}
          {!loading ? <ArrowRight size={16} /> : null}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            window.location.href = "/workdesk-login";
          }}
          className="h-12 w-full rounded-2xl border-slate-200 bg-white/85 text-slate-700 transition hover:bg-white"
        >
          Switch to Workdesk Panel
        </Button>
      </form>
    </AuthShell>
  );
}
