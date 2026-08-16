import { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { userProfileSchema } from "./userSchema";
import { sendOtpSchema, verifyOtpSchema } from "./otpSchema";
import { generateToken } from "../../lib/jwt";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";

/**
 * 1. Send OTP to Email or Mobile Phone
 */
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const validationResult = sendOtpSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.issues,
      });
    }

    const { identifier, type } = validationResult.data;

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Invalidate previous unused OTPs for this identifier
    await prisma.otp.updateMany({
      where: { identifier, isUsed: false },
      data: { isUsed: true },
    });

    // Save new OTP record
    await prisma.otp.create({
      data: {
        identifier,
        code,
        type,
        expiresAt,
      },
    });

    // Simulate OTP delivery in server logs
    console.log(`\n========================================`);
    console.log(`[OTP SERVICE] Simulated ${type} OTP`);
    console.log(`Identifier: ${identifier}`);
    console.log(`Code: ${code}`);
    console.log(`Expires At: ${expiresAt.toISOString()}`);
    console.log(`========================================\n`);

    return res.status(200).json({
      message: `OTP sent successfully to your ${type.toLowerCase()}`,
      data: {
        identifier,
        type,
        expiresAt,
        // In non-production env, include code for convenient API testing
        code: process.env.NODE_ENV === "production" ? undefined : code,
      },
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 2. Verify OTP for Email or Mobile Phone (Logs in or creates user, returns JWT)
 */
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const validationResult = verifyOtpSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.issues,
      });
    }

    const { identifier, code } = validationResult.data;

    // Find valid OTP record
    const otpRecord = await prisma.otp.findFirst({
      where: {
        identifier,
        code,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP code" });
    }

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    const isEmail = otpRecord.type === "EMAIL";

    // Find existing user by email or phone
    let user = await prisma.user.findFirst({
      where: isEmail ? { email: identifier } : { phone: identifier },
    });

    let isNewUser = false;

    if (!user) {
      // Create user automatically upon OTP verification
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          email: isEmail ? identifier : null,
          phone: !isEmail ? identifier : null,
          isEmailVerified: isEmail,
          isPhoneVerified: !isEmail,
        },
      });
    } else {
      // Update verification flag for existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: isEmail ? { isEmailVerified: true } : { isPhoneVerified: true },
      });
    }

    // Issue JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      phone: user.phone,
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "OTP verified successfully",
      isNewUser,
      token,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 3. Update User Profile (Protected)
 */
export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validationResult = userProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.issues,
      });
    }

    const { firstName, lastName, email, phone, dob, age, profilePic } = validationResult.data;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        firstName: firstName ?? undefined,
        lastName: lastName ?? undefined,
        email: email ?? undefined,
        phone: phone ?? undefined,
        dob: dob ? new Date(dob) : undefined,
        age: age !== undefined && !isNaN(Number(age)) ? Number(age) : undefined,
        profilePic: profilePic ?? undefined,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: "Profile updated successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 4. Get Current User Profile (Protected)
 */
export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
