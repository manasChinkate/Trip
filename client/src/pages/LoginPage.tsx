import { AuthCard } from "@/features/auth/components/AuthCard";
import { useAuth } from "@/features/auth/context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();

  return <AuthCard onSuccess={login} />;
}
