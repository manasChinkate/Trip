import { Router } from "express";
import {
  createPlan,
  getUserPlans,
  getAllPlans,
  getPlanById,
  joinPlanByCode,
  addMember,
  removeMember,
  updatePlan,
  deletePlan,
} from "./plan.controller";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router();

// Public endpoint: Fetch all plans created by all users
router.get("/all", getAllPlans);

// Protected endpoints with JWT authentication
router.use(authenticate);

router.post("/", createPlan);
router.get("/", getUserPlans);
router.post("/join", joinPlanByCode);
router.get("/:id", getPlanById);
router.put("/:id", updatePlan);
router.delete("/:id", deletePlan);

// Member management
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);

export default router;
