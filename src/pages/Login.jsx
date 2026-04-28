import axios from "axios";
import { useState, useEffect } from "react";
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

  // 🔒 Disable body scrolling completely
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

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
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
      {/* LEFT PANEL - FIXED */}
      <div className="hidden md:flex flex-col items-center justify-center bg-white overflow-hidden">
        <img
          src={Logo}
          alt="CRM Logo"
          className="w-[360px] object-contain select-none drop-shadow-lg"
        />
      </div>

      {/* RIGHT PANEL - NO SCROLL */}
      <div className="flex items-center justify-center bg-gray-50 overflow-hidden">
        <div className="bg-white p-10 rounded-2xl shadow-2xl w-[380px] border border-gray-100">
          <h2
            className="
            text-2xl font-bold text-center mb-6 tracking-tight
            bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 
            bg-clip-text text-transparent
          "
          >
            CRM Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                placeholder="you@example.com"
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
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 text-primary-foreground shadow hover:bg-primary/90 px-4 py-2 w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
            >
              Login
            </Button>
<<<<<<< HEAD
                      <Button
            type="button"
            onClick={() => window.location.href = "/workdesk-login"}
            className="w-full h-12 mt-4 bg-gradient-to-r from-indigo-600 to-blue-600"
          >
            Go to Workdesk Panel
          </Button>
=======
            <Button
              type="button"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 text-primary-foreground shadow hover:bg-primary/90 px-4 py-2 w-full h-12 mt-4 bg-gradient-to-r from-indigo-600 to-blue-600"
            >
             Go to Workdesk Panel 
            </Button>
>>>>>>> 1067af153db8b8b566fd192c9a2e3aba0308253c
          </form>

        </div>
      </div>
    </div>
  );
}
