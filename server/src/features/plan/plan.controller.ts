import { Request, Response } from "express";
import { prisma } from "../../../lib/prisma";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import {
  createPlanSchema,
  joinPlanSchema,
  updatePlanSchema,
  addMemberSchema,
} from "./planSchema";

/**
 * Helper to generate a unique random 8-character plan code (e.g. TRIP8X2A)
 */
const generatePlanCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TRIP";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * 1. Create a new Trip Plan
 */
export const createPlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validationResult = createPlanSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.issues,
      });
    }

    const { name, startDate, endDate } = validationResult.data;
    const userId = req.user.userId;

    // Generate a unique plan code
    let planCode = generatePlanCode();
    let isCodeDuplicate = await prisma.plan.findUnique({ where: { planCode } });
    while (isCodeDuplicate) {
      planCode = generatePlanCode();
      isCodeDuplicate = await prisma.plan.findUnique({ where: { planCode } });
    }

    // Create plan and automatically add creator as ADMIN in PlanMembers
    const plan = await prisma.plan.create({
      data: {
        name,
        planCode,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdBy: userId,
        planMembers: {
          create: {
            userId,
            role: "ADMIN",
          },
        },
      },
      include: {
        planMembers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profilePic: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      message: "Trip plan created successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Create plan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 2. Get all Trip Plans for the authenticated user
 */
export const getUserPlans = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.userId;

    const plans = await prisma.plan.findMany({
      where: {
        planMembers: {
          some: {
            userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        planMembers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profilePic: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      data: plans,
    });
  } catch (error) {
    console.error("Get user plans error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Get All Trip Plans created by ALL users (Public / Explore)
 */
export const getAllPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        planMembers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profilePic: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      data: plans,
    });
  } catch (error) {
    console.error("Get all plans error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


/**
 * 3. Get Single Trip Plan Details by ID
 */
export const getPlanById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const planIdStr = String(req.params.id);
    const planId = parseInt(planIdStr, 10);
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        planMembers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                profilePic: true,
              },
            },
          },
        },
      },
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Check if user is a member of this plan
    const isMember = plan.planMembers.some((m) => m.userId === req.user?.userId);
    if (!isMember) {
      return res.status(403).json({ message: "Access denied. You are not a member of this plan." });
    }

    return res.status(200).json({
      data: plan,
    });
  } catch (error) {
    console.error("Get plan by ID error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 4. Join a Trip Plan using unique planCode
 */
export const joinPlanByCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validationResult = joinPlanSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.issues,
      });
    }

    const { planCode } = validationResult.data;
    const userId = req.user.userId;

    const plan = await prisma.plan.findUnique({
      where: { planCode: planCode.toUpperCase() },
      include: {
        planMembers: true,
      },
    });

    if (!plan) {
      return res.status(404).json({ message: "Invalid plan code" });
    }

    // Check if user is already a member
    const existingMember = plan.planMembers.find((m) => m.userId === userId);
    if (existingMember) {
      return res.status(400).json({ message: "You are already a member of this trip plan" });
    }

    // Add user to PlanMembers
    const newMember = await prisma.planMembers.create({
      data: {
        planId: plan.id,
        userId,
        role: "MEMBER",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profilePic: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Successfully joined the trip plan",
      data: {
        planId: plan.id,
        planName: plan.name,
        member: newMember,
      },
    });
  } catch (error) {
    console.error("Join plan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 5. Add a Member to a Plan by ID
 */
export const addMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const planIdStr = String(req.params.id);
    const planId = parseInt(planIdStr, 10);
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const validationResult = addMemberSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.issues,
      });
    }

    const { userId, role } = validationResult.data;

    // Verify target user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User to add not found" });
    }

    // Check if already a member
    const existingMember = await prisma.planMembers.findFirst({
      where: { planId, userId },
    });

    if (existingMember) {
      return res.status(400).json({ message: "User is already a member of this plan" });
    }

    const member = await prisma.planMembers.create({
      data: {
        planId,
        userId,
        role: role || "MEMBER",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profilePic: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Member added successfully",
      data: member,
    });
  } catch (error) {
    console.error("Add member error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 6. Remove a Member or Leave a Plan
 */
export const removeMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const planIdStr = String(req.params.id);
    const userIdStr = String(req.params.userId);
    const planId = parseInt(planIdStr, 10);
    const targetUserId = parseInt(userIdStr, 10);

    if (isNaN(planId) || isNaN(targetUserId)) {
      return res.status(400).json({ message: "Invalid plan ID or user ID" });
    }

    const memberRecord = await prisma.planMembers.findFirst({
      where: { planId, userId: targetUserId },
    });

    if (!memberRecord) {
      return res.status(404).json({ message: "Member record not found" });
    }

    await prisma.planMembers.delete({
      where: { id: memberRecord.id },
    });

    return res.status(200).json({
      message: "Member removed from trip plan successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 7. Update Trip Plan Details
 */
export const updatePlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const planIdStr = String(req.params.id);
    const planId = parseInt(planIdStr, 10);
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const validationResult = updatePlanSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: validationResult.error.issues,
      });
    }

    const { name, startDate, endDate } = validationResult.data;

    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: {
        name: name ?? undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        updatedBy: req.user.userId,
      },
    });

    return res.status(200).json({
      message: "Trip plan updated successfully",
      data: updatedPlan,
    });
  } catch (error) {
    console.error("Update plan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 8. Delete Trip Plan
 */
export const deletePlan = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const planIdStr = String(req.params.id);
    const planId = parseInt(planIdStr, 10);
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    // Delete members first to maintain integrity
    await prisma.planMembers.deleteMany({
      where: { planId },
    });

    // Delete plan
    await prisma.plan.delete({
      where: { id: planId },
    });

    return res.status(200).json({
      message: "Trip plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete plan error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
