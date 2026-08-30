import { Link } from "react-router-dom";
import {
  Calendar,
  Compass,
  ArrowLeft,
  Building2,
  FileText,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type {
  ItineraryDay,
  ItineraryItem,
  Booking,
  Attachment,
} from "@/features/itinerary/services/itineraryApi";
import type { Plan } from "@/lib/api";
import { DayNavigation } from "@/features/itinerary/components/DayNavigation";
import { DayTimeline } from "@/features/itinerary/components/DayTimeline";
import { BookingsSection } from "@/features/itinerary/components/BookingsSection";
import { DocumentsVault } from "@/features/itinerary/components/DocumentsVault";

export type ActiveTab = "TIMELINE" | "BOOKINGS" | "DOCUMENTS";

export interface PlanDetailViewProps {
  plan: Plan | null;
  days: ItineraryDay[];
  bookings: Booking[];
  attachments: Attachment[];
  activeDayId: number | null;
  activeDay: ItineraryDay | null;
  activeTab: ActiveTab;
  isLoading: boolean;
  isSyncing: boolean;
  isInvalidPlanId: boolean;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectDay: (dayId: number) => void;
  onSyncDays: () => void;
  onOpenAddItem: (item?: ItineraryItem) => void;
  onDeleteItem: (itemId: number) => void;
  onUpdateDayNotes: (title: string, notes: string) => void;
  onOpenAddBooking: (booking?: Booking) => void;
  onDeleteBooking: (bookingId: number) => void;
  onOpenUploadDoc: () => void;
  onDeleteAttachment: (attachmentId: number) => void;
  onBackToPlans: () => void;
}

export function PlanDetailView({
  plan,
  days,
  bookings,
  attachments,
  activeDayId,
  activeDay,
  activeTab,
  isLoading,
  isSyncing,
  isInvalidPlanId,
  onSelectTab,
  onSelectDay,
  onSyncDays,
  onOpenAddItem,
  onDeleteItem,
  onUpdateDayNotes,
  onOpenAddBooking,
  onDeleteBooking,
  onOpenUploadDoc,
  onDeleteAttachment,
  onBackToPlans,
}: PlanDetailViewProps) {
  if (isInvalidPlanId) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto mt-12 bg-card border border-destructive/20 rounded-3xl shadow-sm">
        <p className="text-destructive font-bold text-lg">Invalid Plan ID</p>
        <p className="text-muted-foreground text-sm">
          The requested trip plan could not be found or has an invalid ID format.
        </p>
        <Button onClick={onBackToPlans} className="mt-2 rounded-xl">
          Back to Plans
        </Button>
      </div>
    );
  }

  const startDateFormatted = plan?.startDate
    ? new Date(plan.startDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const endDateFormatted = plan?.endDate
    ? new Date(plan.endDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto px-3 sm:px-4 pb-20 pt-2">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/plans"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Trip Plans
        </Link>

        {plan?.planCode && (
          <Badge
            variant="outline"
            className="font-mono text-xs px-2.5 py-1 bg-muted/50 border-border/60"
          >
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
                {startDateFormatted}
                {endDateFormatted ? ` - ${endDateFormatted}` : ""}
                {days.length > 0 && ` (${days.length} Days)`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={onSyncDays}
              disabled={isSyncing}
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5 text-xs font-semibold"
            >
              {isSyncing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Sync Days
            </Button>
          </div>
        </div>

        {/* Shadcn Tabs Navigation Header */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => onSelectTab(val as ActiveTab)}
          className="w-full pt-2"
        >
          <TabsList className="w-full sm:w-auto justify-start border-t border-border/40 pt-4 bg-transparent h-auto p-0 gap-2 overflow-x-auto scrollbar-none flex">
            <TabsTrigger
              value="TIMELINE"
              className="px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20"
            >
              <Calendar className="size-4 mr-1.5" /> Day Schedule ({days.length})
            </TabsTrigger>

            <TabsTrigger
              value="BOOKINGS"
              className="px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20"
            >
              <Building2 className="size-4 mr-1.5" /> Bookings ({bookings.length})
            </TabsTrigger>

            <TabsTrigger
              value="DOCUMENTS"
              className="px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/20"
            >
              <FileText className="size-4 mr-1.5" /> Vault ({attachments.length})
            </TabsTrigger>
          </TabsList>

          {/* Main Tab Contents */}
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground text-sm font-semibold gap-2">
              <Loader2 className="size-5 animate-spin text-primary" />
              Loading trip itinerary...
            </div>
          ) : (
            <>
              <TabsContent value="TIMELINE" className="space-y-6 pt-4">
                <DayNavigation
                  days={days}
                  activeDayId={activeDayId}
                  onSelectDay={onSelectDay}
                />

                <DayTimeline
                  day={activeDay}
                  allBookings={bookings}
                  onAddItem={() => onOpenAddItem()}
                  onEditItem={(item) => onOpenAddItem(item)}
                  onDeleteItem={onDeleteItem}
                  onUpdateDayNotes={onUpdateDayNotes}
                  onEditBooking={(booking) => onOpenAddBooking(booking)}
                />
              </TabsContent>

              <TabsContent value="BOOKINGS" className="pt-4">
                <BookingsSection
                  bookings={bookings}
                  onAddBooking={() => onOpenAddBooking()}
                  onEditBooking={(booking) => onOpenAddBooking(booking)}
                  onDeleteBooking={onDeleteBooking}
                  onUploadDocumentForBooking={onOpenUploadDoc}
                />
              </TabsContent>

              <TabsContent value="DOCUMENTS" className="pt-4">
                <DocumentsVault
                  attachments={attachments}
                  onUploadClick={onOpenUploadDoc}
                  onDeleteAttachment={onDeleteAttachment}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
