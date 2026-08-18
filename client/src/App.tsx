import { AuthProvider } from "@/features/auth/context/AuthContext";
import { PlanModalProvider } from "@/features/plan/context/PlanModalContext";
import { PlanModalContainer } from "@/features/plan/components/PlanModalContainer";
import { AppLayout } from "@/components/layout/AppLayout";
import { AppRoutes } from "@/routes/AppRoutes";

export function App() {
  return (
    <AuthProvider>
      <PlanModalProvider>
        <AppLayout>
          <AppRoutes />
          <PlanModalContainer />
        </AppLayout>
      </PlanModalProvider>
    </AuthProvider>
  );
}

export default App;
