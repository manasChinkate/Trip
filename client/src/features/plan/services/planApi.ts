import {
  api,
  type Plan,
  type CreatePlanRequest,
  type UpdatePlanRequest,
  type JoinPlanRequest,
} from "@/lib/api";

export const planApi = {
  getAllPlans: (): Promise<{ data: Plan[] }> => api.getAllPlans(),
  getUserPlans: (token: string): Promise<{ data: Plan[] }> => api.getUserPlans(token),
  getPlanById: (token: string, id: number): Promise<{ data: Plan }> => api.getPlanById(token, id),
  createPlan: (token: string, payload: CreatePlanRequest): Promise<{ message: string; data: Plan }> =>
    api.createPlan(token, payload),
  joinPlanByCode: (token: string, payload: JoinPlanRequest): Promise<{ message: string; data: any }> =>
    api.joinPlanByCode(token, payload),
  updatePlan: (
    token: string,
    id: number,
    payload: UpdatePlanRequest
  ): Promise<{ message: string; data: Plan }> => api.updatePlan(token, id, payload),
  deletePlan: (token: string, id: number): Promise<{ message: string }> => api.deletePlan(token, id),
  removeMember: (token: string, planId: number, userId: number): Promise<{ message: string }> =>
    api.removeMember(token, planId, userId),
};
