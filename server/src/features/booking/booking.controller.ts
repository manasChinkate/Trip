import { Response } from "express";
import { prisma } from "../../../lib/prisma";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";

const getParamString = (param: any): string => {
  return Array.isArray(param) ? param[0] : String(param || "");
};

/**
 * 1. Get all bookings for a plan
 */
export const getPlanBookings = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const planId = parseInt(getParamString(req.params.planId), 10);

    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const bookings = await prisma.booking.findMany({
      where: { planId },
      orderBy: { startDateTime: "asc" },
      include: {
        attachments: true,
        itineraryItems: {
          select: {
            id: true,
            title: true,
            itineraryDayId: true,
          },
        },
      },
    });

    return res.json(bookings);
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

/**
 * 2. Create a new Booking
 */
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const planId = parseInt(getParamString(req.params.planId), 10);
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const {
      type,
      title,
      provider,
      confirmationNumber,
      startDateTime,
      endDateTime,
      totalCost,
      currency,
      address,
      contactInfo,
      notes,
      status,
    } = req.body;

    if (!type || !title) {
      return res.status(400).json({ message: "Booking type and title are required" });
    }

    const booking = await prisma.booking.create({
      data: {
        planId,
        type,
        title,
        provider: provider || null,
        confirmationNumber: confirmationNumber || null,
        startDateTime: startDateTime ? new Date(startDateTime) : null,
        endDateTime: endDateTime ? new Date(endDateTime) : null,
        totalCost: totalCost ? parseFloat(totalCost) : null,
        currency: currency || "INR",
        address: address || null,
        contactInfo: contactInfo || null,
        notes: notes || null,
        status: status || "CONFIRMED",
      },
      include: {
        attachments: true,
        itineraryItems: true,
      },
    });

    return res.status(201).json(booking);
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return res.status(500).json({ message: "Failed to create booking" });
  }
};

/**
 * 3. Update an existing Booking
 */
export const updateBooking = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const bookingId = parseInt(getParamString(req.params.bookingId), 10);
    if (isNaN(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const {
      type,
      title,
      provider,
      confirmationNumber,
      startDateTime,
      endDateTime,
      totalCost,
      currency,
      address,
      contactInfo,
      notes,
      status,
    } = req.body;

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(provider !== undefined && { provider }),
        ...(confirmationNumber !== undefined && { confirmationNumber }),
        ...(startDateTime !== undefined && {
          startDateTime: startDateTime ? new Date(startDateTime) : null,
        }),
        ...(endDateTime !== undefined && {
          endDateTime: endDateTime ? new Date(endDateTime) : null,
        }),
        ...(totalCost !== undefined && {
          totalCost: totalCost !== null ? parseFloat(totalCost) : null,
        }),
        ...(currency !== undefined && { currency }),
        ...(address !== undefined && { address }),
        ...(contactInfo !== undefined && { contactInfo }),
        ...(notes !== undefined && { notes }),
        ...(status !== undefined && { status }),
      },
      include: {
        attachments: true,
        itineraryItems: true,
      },
    });

    return res.json(booking);
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return res.status(500).json({ message: "Failed to update booking" });
  }
};

/**
 * 4. Delete a Booking
 */
export const deleteBooking = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const bookingId = parseInt(getParamString(req.params.bookingId), 10);

    if (isNaN(bookingId)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    return res.json({ message: "Booking deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting booking:", error);
    return res.status(500).json({ message: "Failed to delete booking" });
  }
};
