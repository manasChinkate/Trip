import { useAuth } from "@/features/auth/context/AuthContext";
import { usePlanModals } from "../context/PlanModalContext";
import { CreatePlanModal } from "./CreatePlanModal";
import { JoinPlanModal } from "./JoinPlanModal";
import { EditPlanModal } from "./EditPlanModal";
import { PlanMembersModal } from "./PlanMembersModal";

export function PlanModalContainer() {
  const { token, user } = useAuth();
  const {
    isCreateModalOpen,
    isJoinModalOpen,
    editingPlan,
    viewingMembersPlan,
    prefilledJoinCode,
    closeCreateModal,
    closeJoinModal,
    closeEditModal,
    closeMembersModal,
  } = usePlanModals();

  if (!token || !user) return null;

  return (
    <>
      <CreatePlanModal
        open={isCreateModalOpen}
        token={token}
        onOpenChange={(open) => !open && closeCreateModal()}
      />

      <JoinPlanModal
        open={isJoinModalOpen}
        token={token}
        prefilledCode={prefilledJoinCode}
        onOpenChange={(open) => !open && closeJoinModal()}
      />

      <EditPlanModal
        plan={editingPlan}
        open={Boolean(editingPlan)}
        token={token}
        onOpenChange={(open) => !open && closeEditModal()}
      />

      <PlanMembersModal
        plan={viewingMembersPlan}
        open={Boolean(viewingMembersPlan)}
        token={token}
        currentUser={user}
        onOpenChange={(open) => !open && closeMembersModal()}
      />
    </>
  );
}
