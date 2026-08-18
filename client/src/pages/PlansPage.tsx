import { PlanList } from "@/features/plan/components/PlanList";
import { useAllPlans } from "@/features/plan/hooks/usePlans";
import { useAuth } from "@/features/auth/context/AuthContext";
import { usePlanModals } from "@/features/plan/context/PlanModalContext";

export function PlansPage() {
  const { data: plans = [] } = useAllPlans();
  const { user, token, requireAuth } = useAuth();
  const { openCreateModal, openJoinModal, openEditModal, openMembersModal } = usePlanModals();

  const handleJoinDirectly = (code: string) => {
    requireAuth(() => openJoinModal(code));
  };

  return (
    <PlanList
      plans={plans}
      currentUser={user}
      token={token}
      onCreateClick={() => requireAuth(openCreateModal)}
      onJoinClick={() => requireAuth(() => openJoinModal(""))}
      onEditClick={(plan) => requireAuth(() => openEditModal(plan))}
      onViewMembersClick={(plan) => openMembersModal(plan)}
      onJoinDirectly={handleJoinDirectly}
    />
  );
}
