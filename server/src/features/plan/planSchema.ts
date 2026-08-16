import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1, "Plan name is mandatory"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const joinPlanSchema = z.object({
  planCode: z.string().min(1, "Plan code is mandatory"),
});

export const updatePlanSchema = z.object({
  name: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const addMemberSchema = z.object({
  userId: z.number({ message: "User ID is required" }),
  role: z.string().optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type JoinPlanInput = z.infer<typeof joinPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type AddMemberInput = z.infer<typeof addMemberSchema>;
