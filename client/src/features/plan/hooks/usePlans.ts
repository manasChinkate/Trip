import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { planApi } from "../services/planApi";
import {
  type CreatePlanRequest,
  type UpdatePlanRequest,
  type JoinPlanRequest,
} from "@/lib/api";

export function useAllPlans() {
  return useQuery({
    queryKey: ["plans", "all"],
    queryFn: async () => {
      const res = await planApi.getAllPlans();
      return res.data;
    },
  });
}

export function useCreatePlan(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePlanRequest) => {
      if (!token) throw new Error("Authentication token required");
      return planApi.createPlan(token, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans", "all"] });
    },
  });
}

export function useJoinPlan(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: JoinPlanRequest) => {
      if (!token) throw new Error("Authentication token required");
      return planApi.joinPlanByCode(token, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans", "all"] });
    },
  });
}

export function useUpdatePlan(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePlanRequest }) => {
      if (!token) throw new Error("Authentication token required");
      return planApi.updatePlan(token, id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans", "all"] });
    },
  });
}

export function useDeletePlan(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: number) => {
      if (!token) throw new Error("Authentication token required");
      return planApi.deletePlan(token, planId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans", "all"] });
    },
  });
}

export function useRemoveMember(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, userId }: { planId: number; userId: number }) => {
      if (!token) throw new Error("Authentication token required");
      return planApi.removeMember(token, planId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans", "all"] });
    },
  });
}
