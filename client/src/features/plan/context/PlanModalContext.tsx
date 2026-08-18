import { createContext, useContext, useState, type ReactNode } from "react";
import { type Plan } from "@/lib/api";

interface PlanModalContextType {
  isCreateModalOpen: boolean;
  isJoinModalOpen: boolean;
  editingPlan: Plan | null;
  viewingMembersPlan: Plan | null;
  prefilledJoinCode: string;

  openCreateModal: () => void;
  closeCreateModal: () => void;
  openJoinModal: (code?: string) => void;
  closeJoinModal: () => void;
  openEditModal: (plan: Plan) => void;
  closeEditModal: () => void;
  openMembersModal: (plan: Plan) => void;
  closeMembersModal: () => void;
}

const PlanModalContext = createContext<PlanModalContextType | undefined>(undefined);

export function PlanModalProvider({ children }: { children: ReactNode }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [viewingMembersPlan, setViewingMembersPlan] = useState<Plan | null>(null);
  const [prefilledJoinCode, setPrefilledJoinCode] = useState("");

  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  const openJoinModal = (code = "") => {
    setPrefilledJoinCode(code);
    setIsJoinModalOpen(true);
  };
  const closeJoinModal = () => {
    setIsJoinModalOpen(false);
    setPrefilledJoinCode("");
  };

  const openEditModal = (plan: Plan) => setEditingPlan(plan);
  const closeEditModal = () => setEditingPlan(null);

  const openMembersModal = (plan: Plan) => setViewingMembersPlan(plan);
  const closeMembersModal = () => setViewingMembersPlan(null);

  return (
    <PlanModalContext.Provider
      value={{
        isCreateModalOpen,
        isJoinModalOpen,
        editingPlan,
        viewingMembersPlan,
        prefilledJoinCode,
        openCreateModal,
        closeCreateModal,
        openJoinModal,
        closeJoinModal,
        openEditModal,
        closeEditModal,
        openMembersModal,
        closeMembersModal,
      }}
    >
      {children}
    </PlanModalContext.Provider>
  );
}

export function usePlanModals() {
  const context = useContext(PlanModalContext);
  if (!context) {
    throw new Error("usePlanModals must be used within a PlanModalProvider");
  }
  return context;
}
