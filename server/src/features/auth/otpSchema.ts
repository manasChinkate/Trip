import { z } from "zod";

export const sendOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier (email or phone) is mandatory"),
  type: z.enum(["EMAIL", "PHONE"], {
    message: "Type must be either EMAIL or PHONE",
  }),
}).superRefine((data, ctx) => {
  if (data.type === "EMAIL") {
    const isEmailValid = z.string().email().safeParse(data.identifier).success;
    if (!isEmailValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid email address format",
        path: ["identifier"],
      });
    }
  } else if (data.type === "PHONE") {
    const isPhoneValid = /^\+?[1-9]\d{9,14}$/.test(data.identifier.replace(/\s+/g, ""));
    if (!isPhoneValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid phone number format (must be 10-15 digits)",
        path: ["identifier"],
      });
    }
  }
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(1, "Identifier is mandatory"),
  code: z.string().length(6, "OTP code must be 6 digits"),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
