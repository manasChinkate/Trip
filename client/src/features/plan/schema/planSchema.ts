import { z } from "zod";

export const createPlanSchema = z.object({
  name: z.string().min(1, "Plan name is mandatory"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const joinPlanSchema = z.object({
  planCode: z
    .string()
    .min(1, "Plan code is mandatory")
    .transform((val) => val.toUpperCase().trim()),
});

export const updatePlanSchema = z.object({
  name: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreatePlanFormValues = z.infer<typeof createPlanSchema>;
export type JoinPlanFormValues = z.infer<typeof joinPlanSchema>;
export type UpdatePlanFormValues = z.infer<typeof updatePlanSchema>;
