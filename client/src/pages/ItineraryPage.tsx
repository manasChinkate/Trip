import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Compass,
  ArrowLeft,
  Building2,
  FileText,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/features/auth/context/AuthContext";
import { itineraryApi } from "@/features/itinerary/services/itineraryApi";
import type {
  ItineraryDay,
  ItineraryItem,
  Booking,
  Attachment,
} from "@/features/itinerary/services/itineraryApi";
import { DayNavigation } from "@/features/itinerary/components/DayNavigation";
import { DayTimeline } from "@/features/itinerary/components/DayTimeline";
import { BookingsSection } from "@/features/itinerary/components/BookingsSection";
import { DocumentsVault } from "@/features/itinerary/components/DocumentsVault";
import { AddItemSheet } from "@/features/itinerary/components/AddItemSheet";
import { AddBookingSheet } from "@/features/itinerary/components/AddBookingSheet";
import { UploadDocumentSheet } from "@/features/itinerary/components/UploadDocumentSheet";

type ActiveTab = "TIMELINE" | "BOOKINGS" | "DOCUMENTS";

export function ItineraryPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>("TIMELINE");
  const [plan, setPlan] = useState<any | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [activeDayId, setActiveDayId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);

  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);

  const parsedPlanId = planId ? parseInt(planId, 10) : NaN;

  // Load itinerary data
  const loadData = async () => {
    if (!token || isNaN(parsedPlanId)) return;
    try {
      setIsLoading(true);
      const data = await itineraryApi.getItinerary(token, parsedPlanId);
      setPlan(data.plan);
      setDays(data.days || []);
      setBookings(data.plan?.bookings || []);

      // Set first day as active if not set
      if (data.days && data.days.length > 0 && !activeDayId) {
        setActiveDayId(data.days[0].id);
      }

      // Fetch attachments
      const fetchedAttachments = await itineraryApi.getAttachments(token, parsedPlanId);
      setAttachments(fetchedAttachments);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load plan itinerary");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, parsedPlanId]);

  if (isNaN(parsedPlanId)) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-bold">Invalid Plan ID</p>
        <Button onClick={() => navigate("/plans")} className="mt-4">
          Back to Plans
        </Button>
      </div>
    );
  }

  const activeDay = days.find((d) => d.id === activeDayId) || (days.length > 0 ? days[0] : null);

  // Sync Days
  const handleSyncDays = async () => {
    if (!token) return;
    try {
      const res = await itineraryApi.syncDays(token, parsedPlanId);
      toast.success("Itinerary days synced!");
      setDays(res.days);
      if (res.days.length > 0 && !activeDayId) {
        setActiveDayId(res.days[0].id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sync days");
    }
  };

  // Activity Handlers
  const handleSaveActivity = async (payload: Partial<ItineraryItem>) => {
    if (!token || !activeDayId) return;
    try {
      if (editingItem) {
        await itineraryApi.updateItem(token, editingItem.id, payload);
        toast.success("Activity updated!");
      } else {
        await itineraryApi.addItem(token, parsedPlanId, activeDayId, payload);
        toast.success("Activity added to day itinerary!");
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save activity");
    }
  };

  const handleDeleteActivity = async (itemId: number) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this activity?")) return;
    try {
      await itineraryApi.deleteItem(token, itemId);
      toast.success("Activity deleted!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete activity");
    }
  };

  const handleUpdateDayNotes = async (title: string, notes: string) => {
    if (!token || !activeDayId) return;
    try {
      await itineraryApi.updateDay(token, parsedPlanId, activeDayId, { title, notes });
      toast.success("Day details updated!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update day notes");
    }
  };

  // Booking Handlers
  const handleSaveBooking = async (payload: Partial<Booking>) => {
    if (!token) return;
    try {
      if (editingBooking) {
        await itineraryApi.updateBooking(token, editingBooking.id, payload);
        toast.success("Booking updated!");
      } else {
        await itineraryApi.createBooking(token, parsedPlanId, payload);
        toast.success("New booking added!");
      }
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save booking");
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this booking?")) return;
    try {
      await itineraryApi.deleteBooking(token, bookingId);
      toast.success("Booking deleted!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete booking");
    }
  };

  // Attachment Handlers
  const handleUploadDocument = async (formData: FormData) => {
    if (!token) return;
    try {
      await itineraryApi.uploadAttachment(token, parsedPlanId, formData);
      toast.success("Document uploaded successfully!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload document");
    }
  };

  const handleDeleteAttachment = async (attachmentId: number) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      await itineraryApi.deleteAttachment(token, attachmentId);
      toast.success("Document deleted!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete document");
    }
  };

  const startDateFormatted = plan?.startDate
    ? new Date(plan.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;
  const endDateFormatted = plan?.endDate
    ? new Date(plan.endDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto px-3 sm:px-4 pb-20 pt-2">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <Link
          to="/plans"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Trip Plans
        </Link>

        {plan?.planCode && (
          <Badge variant="outline" className="font-mono text-xs px-2.5 py-1 bg-muted/50 border-border/60">
            Code: {plan.planCode}
          </Badge>
        )}
      </div>

      {/* Plan Header Card */}
      <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="size-6 text-primary shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {plan?.name || "Trip Itinerary"}
              </h1>
            </div>

            {(startDateFormatted || endDateFormatted) && (
              <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-1.5 pt-0.5">
                <Calendar className="size-4 text-primary" />
                {startDateFormatted} {endDateFormatted ? ` - ${endDateFormatted}` : ""}
                {days.length > 0 && ` (${days.length} Days)`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleSyncDays} variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs font-semibold">
              <RefreshCw className="size-3.5" /> Sync Days
            </Button>
          </div>
        </div>

        {/* Navigation Tabs (Timeline / Bookings / Documents) */}
        <div className="flex items-center gap-2 border-t border-border/40 pt-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("TIMELINE")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "TIMELINE"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Calendar className="size-4" /> Day Schedule ({days.length})
          </button>

          <button
            onClick={() => setActiveTab("BOOKINGS")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "BOOKINGS"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Building2 className="size-4" /> Bookings ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab("DOCUMENTS")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "DOCUMENTS"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <FileText className="size-4" /> Vault ({attachments.length})
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground text-sm font-semibold">
          Loading trip itinerary...
        </div>
      ) : (
        <>
          {activeTab === "TIMELINE" && (
            <div className="space-y-6">
              {/* Days Tab Strip */}
              <DayNavigation
                days={days}
                activeDayId={activeDayId}
                onSelectDay={(dayId) => setActiveDayId(dayId)}
              />

              {/* Day Schedule Timeline */}
              <DayTimeline
                day={activeDay}
                allBookings={bookings}
                onAddItem={() => {
                  setEditingItem(null);
                  setIsAddItemOpen(true);
                }}
                onEditItem={(item) => {
                  setEditingItem(item);
                  setIsAddItemOpen(true);
                }}
                onDeleteItem={handleDeleteActivity}
                onUpdateDayNotes={handleUpdateDayNotes}
                onEditBooking={(booking) => {
                  setEditingBooking(booking);
                  setIsAddBookingOpen(true);
                }}
              />
            </div>
          )}

          {activeTab === "BOOKINGS" && (
            <BookingsSection
              bookings={bookings}
              onAddBooking={() => {
                setEditingBooking(null);
                setIsAddBookingOpen(true);
              }}
              onEditBooking={(booking) => {
                setEditingBooking(booking);
                setIsAddBookingOpen(true);
              }}
              onDeleteBooking={handleDeleteBooking}
              onUploadDocumentForBooking={() => setIsUploadDocOpen(true)}
            />
          )}

          {activeTab === "DOCUMENTS" && (
            <DocumentsVault
              attachments={attachments}
              onUploadClick={() => setIsUploadDocOpen(true)}
              onDeleteAttachment={handleDeleteAttachment}
            />
          )}
        </>
      )}

      {/* Side Sheets */}
      <AddItemSheet
        isOpen={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        onSave={handleSaveActivity}
        initialItem={editingItem}
        bookings={bookings}
      />

      <AddBookingSheet
        isOpen={isAddBookingOpen}
        onClose={() => setIsAddBookingOpen(false)}
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
    </div>
  );
}
