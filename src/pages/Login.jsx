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
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
