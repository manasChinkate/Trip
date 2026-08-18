import { useState } from "react";
import {
  Clock,
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Bookmark,
  Paperclip,
  DollarSign,
  Calendar,
  Sparkles,
  Building2,
  Plane,
  Train,
  Bus,
  Car,
  Ticket,
  FileText,
  Copy,
  Check,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type {
  ItineraryDay,
  ItineraryItem,
  ItineraryCategory,
  Booking,
  BookingType,
} from "../services/itineraryApi";

interface DayTimelineProps {
  day: ItineraryDay | null;
  allBookings?: Booking[];
  onAddItem: () => void;
  onEditItem: (item: ItineraryItem) => void;
  onDeleteItem: (itemId: number) => void;
  onUpdateDayNotes: (title: string, notes: string) => void;
  onEditBooking?: (booking: Booking) => void;
}

const CATEGORY_META: Record<
  ItineraryCategory,
  { label: string; emoji: string; color: string }
> = {
  ACTIVITY: { label: "Activity", emoji: "🎯", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  SIGHTSEEING: { label: "Sightseeing", emoji: "🏛️", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  RESTAURANT: { label: "Food & Dining", emoji: "🍽️", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  HOTEL: { label: "Hotel Check-in", emoji: "🏨", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  FLIGHT: { label: "Flight", emoji: "✈️", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  TRAIN: { label: "Train", emoji: "🚆", color: "bg-teal-500/10 text-teal-600 border-teal-500/20" },
  BUS: { label: "Bus / Transit", emoji: "🚌", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  NOTE: { label: "Note", emoji: "📝", color: "bg-gray-500/10 text-gray-600 border-gray-500/20" },
};

const BOOKING_ICONS: Record<BookingType, any> = {
  HOTEL: Building2,
  FLIGHT: Plane,
  TRAIN: Train,
  BUS: Bus,
  CAB: Car,
  EVENT_TICKET: Ticket,
  OTHER: FileText,
};

export function DayTimeline({
  day,
  allBookings = [],
  onAddItem,
  onEditItem,
  onDeleteItem,
  onUpdateDayNotes,
  onEditBooking,
}: DayTimelineProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(day?.notes || "");
  const [title, setTitle] = useState(day?.title || "");
  const [copiedBookingId, setCopiedBookingId] = useState<number | null>(null);

  if (!day) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/60 rounded-3xl bg-muted/20">
        <Calendar className="size-12 text-muted-foreground/60 mb-3" />
        <h4 className="text-lg font-bold">No Itinerary Day Selected</h4>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          Select a day from the top tab navigation bar or generate trip itinerary days.
        </p>
      </div>
    );
  }

  const items = day.items || [];
  const formattedDayDate = day.date
    ? new Date(day.date).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const handleCopyConfirmation = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBookingId(id);
    toast.success(`Confirmation code ${code} copied!`);
    setTimeout(() => setCopiedBookingId(null), 2000);
  };

  const handleSaveNotes = () => {
    onUpdateDayNotes(title, notes);
    setIsEditingNotes(false);
  };

  // Delivered directly by Backend
  const matchedBookings = day.dayBookings || [];

  return (
    <div className="space-y-6">
      {/* Day Title & Notes Banner */}
      <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-bold px-2.5 py-0.5">
                Day {day.dayNumber}
              </Badge>
              <h3 className="text-xl font-bold tracking-tight">
                {day.title || `Day ${day.dayNumber}`}
              </h3>
            </div>
            {formattedDayDate && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                <Calendar className="size-3.5 text-primary" /> {formattedDayDate}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={onAddItem} size="sm" className="rounded-xl gap-1.5 shadow-sm font-semibold">
              <Plus className="size-4" /> Add Activity
            </Button>
          </div>
        </div>

        {/* Notes / Day Overview */}
        {day.notes && !isEditingNotes && (
          <div className="bg-muted/40 rounded-2xl p-3.5 text-xs text-muted-foreground flex items-start justify-between gap-2 border border-border/40">
            <p className="leading-relaxed whitespace-pre-line">{day.notes}</p>
            <button
              onClick={() => {
                setTitle(day.title || "");
                setNotes(day.notes || "");
                setIsEditingNotes(true);
              }}
              className="text-primary hover:underline text-[11px] font-semibold shrink-0"
            >
              Edit
            </button>
          </div>
        )}

        {!day.notes && !isEditingNotes && (
          <button
            onClick={() => {
              setTitle(day.title || "");
              setNotes("");
              setIsEditingNotes(true);
            }}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium hover:underline"
          >
            <Plus className="size-3.5 text-primary" /> Add notes for Day {day.dayNumber}
          </button>
        )}

        {isEditingNotes && (
          <div className="space-y-2 pt-2 border-t border-border/40">
            <Input
              type="text"
              placeholder="Day Title e.g. Arrival & Eiffel Tower"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs h-9 rounded-xl font-semibold"
            />
            <Textarea
              placeholder="Add summary or notes for this day..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="text-xs rounded-xl"
            />
            <div className="flex items-center gap-2 justify-end">
              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setIsEditingNotes(false)}>
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs" onClick={handleSaveNotes}>
                Save Notes
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* AUTOMATICALLY DISPLAYED BOOKINGS FOR THIS DAY */}
      {matchedBookings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="size-4 text-primary" />
              <h4 className="text-sm font-bold tracking-tight">
                Reservations & Bookings for Day {day.dayNumber} ({matchedBookings.length})
              </h4>
            </div>
            <span className="text-[11px] text-muted-foreground">Auto-linked from trip bookings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matchedBookings.map((b) => {
              const IconComp = BOOKING_ICONS[b.type] || Building2;
              const startTimeStr = b.startDateTime
                ? new Date(b.startDateTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
                : null;
              const endTimeStr = b.endDateTime
                ? new Date(b.endDateTime).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
                : null;

              return (
                <Card key={b.id} className="border border-primary/20 bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                          <IconComp className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold uppercase text-primary">
                              {b.type}
                            </span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-bold bg-background/80">
                              {b.status}
                            </Badge>
                          </div>
                          <h5 className="text-sm font-bold text-foreground truncate">{b.title}</h5>
                        </div>
                      </div>

                      {onEditBooking && (
                        <button
                          onClick={() => onEditBooking(b)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors shrink-0"
                          title="Edit Reservation"
                        >
                          <Edit3 className="size-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Copy PNR / Confirmation Code Bar */}
                    {b.confirmationNumber && (
                      <div className="flex items-center justify-between bg-background/80 border border-primary/20 rounded-xl px-3 py-1.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-muted-foreground">PNR / Code:</span>
                          <span className="font-mono font-bold text-foreground">{b.confirmationNumber}</span>
                        </div>
                        <button
                          onClick={() => handleCopyConfirmation(b.id, b.confirmationNumber!)}
                          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          {copiedBookingId === b.id ? (
                            <>
                              <Check className="size-3 text-emerald-500" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Time & Location */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-medium">
                      {(startTimeStr || endTimeStr) && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-primary" />
                          {startTimeStr} {endTimeStr ? `- ${endTimeStr}` : ""}
                        </span>
                      )}
                      {b.address && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="size-3 text-primary shrink-0" />
                          {b.address}
                        </span>
                      )}
                      {b.totalCost !== null && b.totalCost !== undefined && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{b.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline Section */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/60 rounded-3xl bg-card">
          <Sparkles className="size-10 text-primary/60 mb-2 animate-pulse" />
          <h4 className="text-base font-bold">No Activities Scheduled Yet</h4>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
            Start building your day schedule by adding sightseeing, hotel stays, or dining activities.
          </p>
          <Button onClick={onAddItem} variant="outline" size="sm" className="rounded-xl gap-1.5 font-semibold">
            <Plus className="size-4" /> Add First Activity
          </Button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/80">
          {items.map((item) => {
            const meta = CATEGORY_META[item.category] || CATEGORY_META.ACTIVITY;
            const startTimeFormatted = item.startTime
              ? new Date(item.startTime).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;
            const endTimeFormatted = item.endTime
              ? new Date(item.endTime).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Bullet Node */}
                <div className="absolute -left-6 sm:-left-8 top-3 size-5 rounded-full bg-background border-2 border-primary flex items-center justify-center text-[10px] shadow-sm">
                  <span className="size-2 rounded-full bg-primary" />
                </div>

                {/* Activity Card */}
                <Card className="border border-border/60 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden bg-card">
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 ${meta.color}`}>
                            <span>{meta.emoji}</span>
                            <span>{meta.label}</span>
                          </span>

                          {(startTimeFormatted || endTimeFormatted) && (
                            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded-lg">
                              <Clock className="size-3 text-primary" />
                              {startTimeFormatted}
                              {endTimeFormatted ? ` - ${endTimeFormatted}` : ""}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-bold tracking-tight text-foreground">
                          {item.title}
                        </h4>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onEditItem(item)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          title="Edit Activity"
                        >
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete Activity"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>
                    )}

                    {/* Location & Cost Details */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground pt-1">
                      {item.location && (
                        <span className="flex items-center gap-1 text-foreground/80">
                          <MapPin className="size-3.5 text-primary shrink-0" />
                          <span className="truncate max-w-[240px]">{item.location}</span>
                        </span>
                      )}

                      {item.estimatedCost !== null && item.estimatedCost !== undefined && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                          ₹{item.estimatedCost.toLocaleString('en-IN')}
                        </span>
                      )}

                      {item.booking && (
                        <span className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-md font-semibold">
                          <Bookmark className="size-3.5" />
                          Linked: {item.booking.title}
                        </span>
                      )}

                      {item.attachments && item.attachments.length > 0 && (
                        <span className="flex items-center gap-1 text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                          <Paperclip className="size-3.5 text-primary" />
                          {item.attachments.length} Document(s)
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
