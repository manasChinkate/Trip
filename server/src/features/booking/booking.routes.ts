import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import {
  getPlanBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} from "./booking.controller";

const router = Router();

router.use(authenticate);

router.get("/plans/:planId/bookings", getPlanBookings);
router.post("/plans/:planId/bookings", createBooking);
router.put("/bookings/:bookingId", updateBooking);
router.delete("/bookings/:bookingId", deleteBooking);

export default router;
