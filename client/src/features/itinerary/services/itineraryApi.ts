import type { Plan } from "@/lib/api";

const BASE_URL = "http://localhost:3000/api";

export type ItineraryCategory =
  | "ACTIVITY"
  | "FLIGHT"
  | "TRAIN"
  | "BUS"
  | "HOTEL"
  | "RESTAURANT"
  | "SIGHTSEEING"
  | "NOTE";

export type BookingType =
  | "HOTEL"
  | "FLIGHT"
  | "TRAIN"
  | "BUS"
  | "CAB"
  | "EVENT_TICKET"
  | "OTHER";

export type BookingStatus = "PLANNED" | "CONFIRMED" | "CANCELLED";

export type DocumentType =
  | "TICKET"
  | "HOTEL_VOUCHER"
  | "PASSPORT_VISA"
  | "RECEIPT"
  | "OTHER";

export interface Attachment {
  id: number;
  planId: number;
  bookingId?: number | null;
  itineraryItemId?: number | null;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number | null;
  category: DocumentType;
  uploadedBy: number;
  createdAt: string;
  booking?: { id: number; title: string; type: string };
  itineraryItem?: { id: number; title: string };
}

export interface Booking {
  id: number;
  planId: number;
  type: BookingType;
  title: string;
  provider?: string | null;
  confirmationNumber?: string | null;
  startDateTime?: string | null;
  endDateTime?: string | null;
  totalCost?: number | null;
  currency?: string | null;
  address?: string | null;
  contactInfo?: string | null;
  notes?: string | null;
  status: BookingStatus;
  attachments?: Attachment[];
  itineraryItems?: { id: number; title: string; itineraryDayId: number }[];
  createdAt: string;
}

export interface ItineraryItem {
  id: number;
  itineraryDayId: number;
  title: string;
  description?: string | null;
  category: ItineraryCategory;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  googlePlaceId?: string | null;
  estimatedCost?: number | null;
  currency?: string | null;
  bookingId?: number | null;
  booking?: Booking | null;
  attachments?: Attachment[];
  createdAt: string;
}

export interface ItineraryDay {
  id: number;
  planId: number;
  dayNumber: number;
  date: string;
  title?: string | null;
  notes?: string | null;
  items?: ItineraryItem[];
  dayBookings?: Booking[];
}

export interface FullItineraryResponse {
  plan: Plan;
  days: ItineraryDay[];
}

export const itineraryApi = {
  // Fetch full plan itinerary & days
  async getItinerary(token: string, planId: number): Promise<FullItineraryResponse> {
    const res = await fetch(`${BASE_URL}/plans/${planId}/itinerary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch itinerary");
    return data;
  },

  // Sync / Auto-generate days
  async syncDays(token: string, planId: number): Promise<{ message: string; days: ItineraryDay[] }> {
    const res = await fetch(`${BASE_URL}/plans/${planId}/itinerary/sync`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to sync itinerary days");
    return data;
  },

  // Add Item to Day
  async addItem(token: string, planId: number, dayId: number, payload: Partial<ItineraryItem>): Promise<ItineraryItem> {
    const res = await fetch(`${BASE_URL}/plans/${planId}/itinerary/days/${dayId}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add itinerary item");
    return data;
  },

  // Update Item
  async updateItem(token: string, itemId: number, payload: Partial<ItineraryItem>): Promise<ItineraryItem> {
    const res = await fetch(`${BASE_URL}/itinerary-items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update item");
    return data;
  },

  // Delete Item
  async deleteItem(token: string, itemId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/itinerary-items/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete item");
  },

  // Update Day Title / Notes
  async updateDay(token: string, planId: number, dayId: number, payload: { title?: string; notes?: string }): Promise<ItineraryDay> {
    const res = await fetch(`${BASE_URL}/plans/${planId}/itinerary/days/${dayId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update day details");
    return data;
  },

  // Bookings API
  async getBookings(token: string, planId: number): Promise<Booking[]> {
    const res = await fetch(`${BASE_URL}/plans/${planId}/bookings`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch bookings");
    return data;
  },

  async createBooking(token: string, planId: number, payload: Partial<Booking>): Promise<Booking> {
    const res = await fetch(`${BASE_URL}/plans/${planId}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create booking");
    return data;
  },

  async updateBooking(token: string, bookingId: number, payload: Partial<Booking>): Promise<Booking> {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to update booking");
    return data;
  },

  async deleteBooking(token: string, bookingId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete booking");
  },

  // Attachments API
  async getAttachments(token: string, planId: number): Promise<Attachment[]> {
    const res = await fetch(`${BASE_URL}/plans/${planId}/attachments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch attachments");
    return data;
  },

  async uploadAttachment(token: string, planId: number, formData: FormData): Promise<Attachment> {
    const res = await fetch(`${BASE_URL}/plans/${planId}/attachments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to upload file");
    return data;
  },

  async deleteAttachment(token: string, attachmentId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/attachments/${attachmentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to delete attachment");
  },
};
