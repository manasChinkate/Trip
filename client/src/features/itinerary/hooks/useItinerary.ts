import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { itineraryApi } from "../services/itineraryApi";
import type {
  ItineraryItem,
  Booking,
} from "../services/itineraryApi";

export const itineraryKeys = {
  all: ["itinerary"] as const,
  detail: (planId: number) => ["itinerary", planId] as const,
  attachments: (planId: number) => ["attachments", planId] as const,
};

export function useItineraryData(planId: number, token: string | null) {
  return useQuery({
    queryKey: itineraryKeys.detail(planId),
    queryFn: async () => {
      if (!token) throw new Error("Authentication token required");
      return itineraryApi.getItinerary(token, planId);
    },
    enabled: !!token && !isNaN(planId) && planId > 0,
  });
}

export function useAttachmentsData(planId: number, token: string | null) {
  return useQuery({
    queryKey: itineraryKeys.attachments(planId),
    queryFn: async () => {
      if (!token) throw new Error("Authentication token required");
      return itineraryApi.getAttachments(token, planId);
    },
    enabled: !!token && !isNaN(planId) && planId > 0,
  });
}

export function useSyncDaysMutation(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (planId: number) => {
      if (!token) throw new Error("Authentication token required");
      return itineraryApi.syncDays(token, planId);
    },
    onSuccess: (_, planId) => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.detail(planId) });
    },
  });
}

export function useSaveActivityMutation(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      dayId,
      itemId,
      payload,
    }: {
      planId: number;
      dayId: number;
      itemId?: number;
      payload: Partial<ItineraryItem>;
    }) => {
      if (!token) throw new Error("Authentication token required");
      if (itemId) {
        return itineraryApi.updateItem(token, itemId, payload);
      }
      return itineraryApi.addItem(token, planId, dayId, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.detail(variables.planId) });
    },
  });
}

export function useDeleteActivityMutation(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId }: { planId: number; itemId: number }) => {
      if (!token) throw new Error("Authentication token required");
      return itineraryApi.deleteItem(token, itemId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.detail(variables.planId) });
    },
  });
}

export function useUpdateDayNotesMutation(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      dayId,
      payload,
    }: {
      planId: number;
      dayId: number;
      payload: { title?: string; notes?: string };
    }) => {
      if (!token) throw new Error("Authentication token required");
      return itineraryApi.updateDay(token, planId, dayId, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.detail(variables.planId) });
    },
  });
}

export function useSaveBookingMutation(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      planId,
      bookingId,
      payload,
    }: {
      planId: number;
      bookingId?: number;
      payload: Partial<Booking>;
    }) => {
      if (!token) throw new Error("Authentication token required");
      if (bookingId) {
        return itineraryApi.updateBooking(token, bookingId, payload);
      }
      return itineraryApi.createBooking(token, planId, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.detail(variables.planId) });
    },
  });
}

export function useDeleteBookingMutation(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId }: { planId: number; bookingId: number }) => {
      if (!token) throw new Error("Authentication token required");
      return itineraryApi.deleteBooking(token, bookingId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.detail(variables.planId) });
    },
  });
}

export function useUploadAttachmentMutation(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, formData }: { planId: number; formData: FormData }) => {
      if (!token) throw new Error("Authentication token required");
      return itineraryApi.uploadAttachment(token, planId, formData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.attachments(variables.planId) });
      queryClient.invalidateQueries({ queryKey: itineraryKeys.detail(variables.planId) });
    },
  });
}

export function useDeleteAttachmentMutation(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ attachmentId }: { planId: number; attachmentId: number }) => {
      if (!token) throw new Error("Authentication token required");
      return itineraryApi.deleteAttachment(token, attachmentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: itineraryKeys.attachments(variables.planId) });
    },
  });
}
