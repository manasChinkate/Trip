import { type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/features/auth/context/AuthContext";
import { usePlanModals } from "@/features/plan/context/PlanModalContext";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, token, isLoadingUser, logout, requireAuth } = useAuth();
  const { openCreateModal, openJoinModal } = usePlanModals();

  if (isLoadingUser && token) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
          <Lock className="size-8 text-primary" />
          <p className="text-sm font-medium">Loading TripPlanner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300 selection:bg-primary/20">
      <Toaster position="top-center" />

      {/* Navbar */}
      <Navbar
        user={user}
        onCreatePlanClick={() => requireAuth(openCreateModal)}
        onJoinPlanClick={() => requireAuth(() => openJoinModal(""))}
        onLogout={logout}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 size-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
        TripPlanner • Feature-Based Architecture & TanStack Query
      </footer>
    </div>
  );
}
