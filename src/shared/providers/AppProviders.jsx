import { AuthProvider } from "@/store/AuthContext";

export default function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
