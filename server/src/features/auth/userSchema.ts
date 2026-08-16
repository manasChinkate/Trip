import { z } from "zod";

export const userProfileSchema = z.object({
  firstName: z.string().min(1, "First name is mandatory").optional(),
  lastName: z.string().min(1, "Last name is mandatory").optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  dob: z.string().optional(),
  profilePic: z.string().optional(),
  age: z.union([z.number(), z.string().transform((val) => Number(val))]).optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
