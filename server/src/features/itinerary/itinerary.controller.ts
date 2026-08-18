import { Response } from "express";
import { prisma } from "../../../lib/prisma";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";

/**
 * 1. Helper to calculate day difference between two dates
 */
const getDaysBetweenDates = (start: Date, end: Date): number => {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};

const getParamString = (param: any): string => {
  return Array.isArray(param) ? param[0] : String(param || "");
};

/**
 * Helper to attach relevant bookings to each itinerary day
 */
const attachBookingsToDays = (days: any[], bookings: any[]) => {
  return days.map((day) => {
    const dayDate = day.date ? new Date(day.date) : null;
    const items = day.items || [];

    const matchedBookings = bookings.filter((booking) => {
      if (!dayDate) return false;

      // 1. Explicitly linked via itinerary item bookingId
      const isExplicitlyLinked = items.some((item: any) => item.bookingId === booking.id);
      if (isExplicitlyLinked) return true;

      // 2. Date range overlap
      const targetYMD = dayDate.toISOString().slice(0, 10);

      if (booking.startDateTime) {
        const bStartYMD = new Date(booking.startDateTime).toISOString().slice(0, 10);
        if (bStartYMD === targetYMD) return true;
      }
      if (booking.endDateTime) {
        const bEndYMD = new Date(booking.endDateTime).toISOString().slice(0, 10);
        if (bEndYMD === targetYMD) return true;
      }

      if (booking.startDateTime && booking.endDateTime) {
        const bStart = new Date(booking.startDateTime).getTime();
        const bEnd = new Date(booking.endDateTime).getTime();
        const dayStart = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 0, 0, 0).getTime();
        const dayEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), 23, 59, 59).getTime();

        if (bStart <= dayEnd && bEnd >= dayStart) return true;
      }

      return false;
    });

    return {
      ...day,
      dayBookings: matchedBookings,
    };
  });
};

/**
 * 2. Get full itinerary for a plan (Auto-generates itinerary days if none exist)
 */
export const getPlanItinerary = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const planId = parseInt(getParamString(req.params.planId), 10);

    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        itineraryDays: {
          orderBy: { dayNumber: "asc" },
          include: {
            items: {
              orderBy: { startTime: "asc" },
              include: {
                booking: true,
                attachments: true,
              },
            },
          },
        },
        bookings: {
          include: {
            attachments: true,
          },
        },
      },
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Auto-generate days if plan has dates and no days exist yet
    if (plan.itineraryDays.length === 0 && plan.startDate && plan.endDate) {
      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);
      const totalDays = getDaysBetweenDates(startDate, endDate);

      const daysToCreate = [];
      for (let i = 0; i < totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        daysToCreate.push({
          planId: plan.id,
          dayNumber: i + 1,
          date: currentDate,
          title: `Day ${i + 1}`,
        });
      }

      await prisma.itineraryDay.createMany({
        data: daysToCreate,
        skipDuplicates: true,
      });

      // Refetch with created days
      const updatedPlan = await prisma.plan.findUnique({
        where: { id: planId },
        include: {
          itineraryDays: {
            orderBy: { dayNumber: "asc" },
            include: {
              items: {
                orderBy: { startTime: "asc" },
                include: {
                  booking: true,
                  attachments: true,
                },
              },
            },
          },
          bookings: {
            include: {
              attachments: true,
            },
          },
        },
      });

      const daysWithBookings = attachBookingsToDays(
        updatedPlan?.itineraryDays || [],
        updatedPlan?.bookings || []
      );

      return res.json({
        plan: updatedPlan,
        days: daysWithBookings,
      });
    }

    const daysWithBookings = attachBookingsToDays(
      plan.itineraryDays,
      plan.bookings
    );

    return res.json({
      plan,
      days: daysWithBookings,
    });
  } catch (error: any) {
    console.error("Error fetching itinerary:", error);
    return res
      .status(500)
      .json({ message: error.message || "Failed to fetch itinerary" });
  }
};

/**
 * 3. Sync or Generate Days manually
 */
export const syncItineraryDays = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const planId = parseInt(getParamString(req.params.planId), 10);
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    if (!plan.startDate || !plan.endDate) {
      return res
        .status(400)
        .json({ message: "Plan must have start date and end date to generate days" });
    }

    const startDate = new Date(plan.startDate);
    const endDate = new Date(plan.endDate);
    const totalDays = getDaysBetweenDates(startDate, endDate);

    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      await prisma.itineraryDay.upsert({
        where: {
          planId_dayNumber: {
            planId,
            dayNumber: i + 1,
          },
        },
        update: {
          date: currentDate,
        },
        create: {
          planId,
          dayNumber: i + 1,
          date: currentDate,
          title: `Day ${i + 1}`,
        },
      });
    }

    const updatedDays = await prisma.itineraryDay.findMany({
      where: { planId },
      orderBy: { dayNumber: "asc" },
      include: {
        items: {
          include: {
            booking: true,
            attachments: true,
          },
        },
      },
    });

    const bookings = await prisma.booking.findMany({
      where: { planId },
      include: { attachments: true },
    });

    const daysWithBookings = attachBookingsToDays(updatedDays, bookings);

    return res.json({ message: "Itinerary days synchronized", days: daysWithBookings });
  } catch (error: any) {
    console.error("Error syncing itinerary days:", error);
    return res.status(500).json({ message: "Failed to sync itinerary days" });
  }
};

/**
 * 4. Add Activity/Item to an Itinerary Day
 */
export const addItineraryItem = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const dayId = parseInt(getParamString(req.params.dayId), 10);
    if (isNaN(dayId)) {
      return res.status(400).json({ message: "Invalid day ID" });
    }

    const {
      title,
      description,
      category,
      startTime,
      endTime,
      location,
      googlePlaceId,
      estimatedCost,
      currency,
      bookingId,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const item = await prisma.itineraryItem.create({
      data: {
        itineraryDayId: dayId,
        title,
        description: description || null,
        category: category || "ACTIVITY",
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        location: location || null,
        googlePlaceId: googlePlaceId || null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        currency: currency || "INR",
        bookingId: bookingId ? parseInt(bookingId, 10) : null,
      },
      include: {
        booking: true,
        attachments: true,
      },
    });

    return res.status(201).json(item);
  } catch (error: any) {
    console.error("Error adding itinerary item:", error);
    return res.status(500).json({ message: "Failed to add itinerary item" });
  }
};

/**
 * 5. Update an Itinerary Item
 */
export const updateItineraryItem = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const itemId = parseInt(getParamString(req.params.itemId), 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const {
      title,
      description,
      category,
      startTime,
      endTime,
      location,
      googlePlaceId,
      estimatedCost,
      currency,
      bookingId,
    } = req.body;

    const item = await prisma.itineraryItem.update({
      where: { id: itemId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(startTime !== undefined && { startTime: startTime ? new Date(startTime) : null }),
        ...(endTime !== undefined && { endTime: endTime ? new Date(endTime) : null }),
        ...(location !== undefined && { location }),
        ...(googlePlaceId !== undefined && { googlePlaceId }),
        ...(estimatedCost !== undefined && {
          estimatedCost: estimatedCost !== null ? parseFloat(estimatedCost) : null,
        }),
        ...(currency !== undefined && { currency }),
        ...(bookingId !== undefined && {
          bookingId: bookingId ? parseInt(bookingId, 10) : null,
        }),
      },
      include: {
        booking: true,
        attachments: true,
      },
    });

    return res.json(item);
  } catch (error: any) {
    console.error("Error updating itinerary item:", error);
    return res.status(500).json({ message: "Failed to update itinerary item" });
  }
};

/**
 * 6. Delete an Itinerary Item
 */
export const deleteItineraryItem = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const itemId = parseInt(getParamString(req.params.itemId), 10);
    if (isNaN(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    await prisma.itineraryItem.delete({
      where: { id: itemId },
    });

    return res.json({ message: "Itinerary item deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting itinerary item:", error);
    return res.status(500).json({ message: "Failed to delete itinerary item" });
  }
};

/**
 * 7. Update Itinerary Day Details (Title / Notes)
 */
export const updateItineraryDay = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const dayId = parseInt(getParamString(req.params.dayId), 10);

    if (isNaN(dayId)) {
      return res.status(400).json({ message: "Invalid day ID" });
    }

    const { title, notes } = req.body;

    const day = await prisma.itineraryDay.update({
      where: { id: dayId },
      data: {
        ...(title !== undefined && { title }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        items: {
          include: {
            booking: true,
            attachments: true,
          },
        },
      },
    });

    return res.json(day);
  } catch (error: any) {
    console.error("Error updating itinerary day:", error);
    return res.status(500).json({ message: "Failed to update day details" });
  }
};
