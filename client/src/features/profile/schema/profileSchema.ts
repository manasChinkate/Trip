import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dob: z.string().optional(),
  age: z.coerce.number().optional(),
  profilePic: z.string().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
