import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/context/AuthContext";
import type {
  ItineraryItem,
  Booking,
} from "@/features/itinerary/services/itineraryApi";
import {
  useItineraryData,
  useAttachmentsData,
  useSyncDaysMutation,
  useSaveActivityMutation,
  useDeleteActivityMutation,
  useUpdateDayNotesMutation,
  useSaveBookingMutation,
  useDeleteBookingMutation,
  useUploadAttachmentMutation,
  useDeleteAttachmentMutation,
} from "@/features/itinerary/hooks/useItinerary";
import { AddItemSheet } from "@/features/itinerary/components/AddItemSheet";
import { AddBookingSheet } from "@/features/itinerary/components/AddBookingSheet";
import { UploadDocumentSheet } from "@/features/itinerary/components/UploadDocumentSheet";
import { PlanDetailView, type ActiveTab } from "./PlanDetailView";

export function PlanDetail() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const parsedPlanId = planId ? parseInt(planId, 10) : NaN;
  const isInvalidPlanId = isNaN(parsedPlanId) || parsedPlanId <= 0;

  // Local UI State
  const [activeTab, setActiveTab] = useState<ActiveTab>("TIMELINE");
  const [activeDayId, setActiveDayId] = useState<number | null>(null);

  // Sheets / Modals state
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);

  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);

  // TanStack Queries & Mutations
  const itineraryQuery = useItineraryData(parsedPlanId, token);
  const attachmentsQuery = useAttachmentsData(parsedPlanId, token);

  const syncDaysMutation = useSyncDaysMutation(token);
  const saveActivityMutation = useSaveActivityMutation(token);
  const deleteActivityMutation = useDeleteActivityMutation(token);
  const updateDayNotesMutation = useUpdateDayNotesMutation(token);
  const saveBookingMutation = useSaveBookingMutation(token);
  const deleteBookingMutation = useDeleteBookingMutation(token);
  const uploadAttachmentMutation = useUploadAttachmentMutation(token);
  const deleteAttachmentMutation = useDeleteAttachmentMutation(token);

  // Data normalization
  const plan = itineraryQuery.data?.plan || null;
  const days = itineraryQuery.data?.days || [];
  const bookings = itineraryQuery.data?.plan?.bookings || [];
  const attachments = attachmentsQuery.data || [];

  // Automatically select first day if activeDayId not set
  useEffect(() => {
    if (days.length > 0 && (!activeDayId || !days.some((d) => d.id === activeDayId))) {
      setActiveDayId(days[0].id);
    }
  }, [days, activeDayId]);

  const activeDay = days.find((d) => d.id === activeDayId) || (days.length > 0 ? days[0] : null);

  // Event Handlers (Orchestration)
  const handleSyncDays = async () => {
    if (isInvalidPlanId) return;
    try {
      const res = await syncDaysMutation.mutateAsync(parsedPlanId);
      toast.success("Itinerary days synced!");
      if (res.days && res.days.length > 0 && !activeDayId) {
        setActiveDayId(res.days[0].id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to sync days";
      toast.error(msg);
    }
  };

  const handleOpenAddItem = (item?: ItineraryItem) => {
    setEditingItem(item || null);
    setIsAddItemOpen(true);
  };

  const handleSaveActivity = async (payload: Partial<ItineraryItem>) => {
    if (isInvalidPlanId || !activeDayId) return;
    try {
      await saveActivityMutation.mutateAsync({
        planId: parsedPlanId,
        dayId: activeDayId,
        itemId: editingItem?.id,
        payload,
      });
      toast.success(editingItem ? "Activity updated!" : "Activity added to day itinerary!");
      setIsAddItemOpen(false);
      setEditingItem(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save activity";
      toast.error(msg);
    }
  };

  const handleDeleteActivity = async (itemId: number) => {
    if (isInvalidPlanId) return;
    if (!confirm("Are you sure you want to delete this activity?")) return;
    try {
      await deleteActivityMutation.mutateAsync({ planId: parsedPlanId, itemId });
      toast.success("Activity deleted!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete activity";
      toast.error(msg);
    }
  };

  const handleUpdateDayNotes = async (title: string, notes: string) => {
    if (isInvalidPlanId || !activeDayId) return;
    try {
      await updateDayNotesMutation.mutateAsync({
        planId: parsedPlanId,
        dayId: activeDayId,
        payload: { title, notes },
      });
      toast.success("Day details updated!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update day notes";
      toast.error(msg);
    }
  };

  const handleOpenAddBooking = (booking?: Booking) => {
    setEditingBooking(booking || null);
    setIsAddBookingOpen(true);
  };

  const handleSaveBooking = async (payload: Partial<Booking>) => {
    if (isInvalidPlanId) return;
    try {
      await saveBookingMutation.mutateAsync({
        planId: parsedPlanId,
        bookingId: editingBooking?.id,
        payload,
      });
      toast.success(editingBooking ? "Booking updated!" : "New booking added!");
      setIsAddBookingOpen(false);
      setEditingBooking(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save booking";
      toast.error(msg);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (isInvalidPlanId) return;
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      await deleteBookingMutation.mutateAsync({ planId: parsedPlanId, bookingId });
      toast.success("Booking deleted!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete booking";
      toast.error(msg);
    }
  };

  const handleOpenUploadDoc = () => {
    setIsUploadDocOpen(true);
  };

  const handleUploadDocument = async (formData: FormData) => {
    if (isInvalidPlanId) return;
    try {
      await uploadAttachmentMutation.mutateAsync({ planId: parsedPlanId, formData });
      toast.success("Document uploaded successfully!");
      setIsUploadDocOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload document";
      toast.error(msg);
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (isInvalidPlanId) return;
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteAttachmentMutation.mutateAsync({ planId: parsedPlanId, attachmentId });
      toast.success("Document deleted!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete document";
      toast.error(msg);
    }
  };

  const isLoading = itineraryQuery.isLoading || attachmentsQuery.isLoading;

  return (
    <>
      <PlanDetailView
        plan={plan}
        days={days}
        bookings={bookings}
        attachments={attachments}
        activeDayId={activeDayId}
        activeDay={activeDay}
        activeTab={activeTab}
        isLoading={isLoading}
        isSyncing={syncDaysMutation.isPending}
        isInvalidPlanId={isInvalidPlanId}
        onSelectTab={setActiveTab}
        onSelectDay={setActiveDayId}
        onSyncDays={handleSyncDays}
        onOpenAddItem={handleOpenAddItem}
        onDeleteItem={handleDeleteActivity}
        onUpdateDayNotes={handleUpdateDayNotes}
        onOpenAddBooking={handleOpenAddBooking}
        onDeleteBooking={handleDeleteBooking}
        onOpenUploadDoc={handleOpenUploadDoc}
        onDeleteAttachment={handleDeleteAttachment}
        onBackToPlans={() => navigate("/plans")}
      />

      {/* Side Sheets managed by Orchestrator */}
      <AddItemSheet
        isOpen={isAddItemOpen}
        onClose={() => {
          setIsAddItemOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveActivity}
        initialItem={editingItem}
        bookings={bookings}
      />

      <AddBookingSheet
        isOpen={isAddBookingOpen}
        onClose={() => {
          setIsAddBookingOpen(false);
          setEditingBooking(null);
        }}
        onSave={handleSaveBooking}
        initialBooking={editingBooking}
      />

      <UploadDocumentSheet
        isOpen={isUploadDocOpen}
        onClose={() => setIsUploadDocOpen(false)}
        onUpload={handleUploadDocument}
        bookings={bookings}
        itineraryItems={activeDay?.items || []}
      />
    </>
  );
}
