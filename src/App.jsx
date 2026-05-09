import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";

import AppRouter from "@/app/AppRouter.jsx";

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
      <AppRouter />
      <Toaster position="top-right" />
    </>
  );
}
