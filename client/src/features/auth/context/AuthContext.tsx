import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { type User } from "@/lib/api";
import { useUserProfile } from "@/features/profile/hooks/useProfile";

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoadingUser: boolean;
  isNewUser: boolean;
  isAuthenticated: boolean;
  login: (newToken: string, authenticatedUser?: User, newUserFlag?: boolean) => void;
  logout: () => void;
  requireAuth: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const navigate = useNavigate();

  const { data: user = null, isLoading: isLoadingUser } = useUserProfile(token);

  const login = (newToken: string, _user?: User, newUserFlag = false) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsNewUser(newUserFlag);
    navigate("/plans");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsNewUser(false);
    toast.info("Logged out successfully");
    navigate("/plans");
  };

  const requireAuth = (action: () => void) => {
    if (!token || !user) {
      toast.info("Please sign in to create or join trip plans");
      navigate("/login");
      return;
    }
    action();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isLoadingUser,
        isNewUser,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
