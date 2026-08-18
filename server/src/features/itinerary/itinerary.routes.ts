import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import {
  getPlanItinerary,
  syncItineraryDays,
  addItineraryItem,
  updateItineraryItem,
  deleteItineraryItem,
  updateItineraryDay,
} from "./itinerary.controller";

const router = Router();

router.use(authenticate);

// Plan level itinerary routes
router.get("/plans/:planId/itinerary", getPlanItinerary);
router.post("/plans/:planId/itinerary/sync", syncItineraryDays);
router.post("/plans/:planId/itinerary/days/:dayId/items", addItineraryItem);
router.put("/plans/:planId/itinerary/days/:dayId", updateItineraryDay);

// Item specific routes
router.put("/itinerary-items/:itemId", updateItineraryItem);
router.delete("/itinerary-items/:itemId", deleteItineraryItem);

export default router;
