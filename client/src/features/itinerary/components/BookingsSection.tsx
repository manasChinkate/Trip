import { useState } from "react";
import {
  Building2,
  Plane,
  Train,
  Bus,
  Car,
  Ticket,
  FileText,
  Copy,
  Check,
  Plus,
  Edit3,
  Trash2,
  MapPin,
  Paperclip,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { Booking, BookingType } from "../services/itineraryApi";

interface BookingsSectionProps {
  bookings: Booking[];
  onAddBooking: () => void;
  onEditBooking: (booking: Booking) => void;
  onDeleteBooking: (bookingId: number) => void;
  onUploadDocumentForBooking?: (bookingId: number) => void;
}

const BOOKING_ICONS: Record<BookingType, any> = {
  HOTEL: Building2,
  FLIGHT: Plane,
  TRAIN: Train,
  BUS: Bus,
  CAB: Car,
  EVENT_TICKET: Ticket,
  OTHER: FileText,
};

export function BookingsSection({
  bookings,
  onAddBooking,
  onEditBooking,
  onDeleteBooking,
  onUploadDocumentForBooking,
}: BookingsSectionProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopyConfirmation = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success(`Confirmation code ${code} copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const totalCost = bookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header & Total Budget Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-5 rounded-3xl shadow-sm">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Bookings & Reservations</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Keep track of hotel vouchers, flight PNRs, train tickets, and event reservations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {bookings.length > 0 && (
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-2xl text-xs font-bold flex items-center gap-1.5">
              <span>Total Bookings:</span>
              <span>
                ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <Button onClick={onAddBooking} className="rounded-2xl gap-1.5 font-semibold shadow-sm">
            <Plus className="size-4" /> Add Reservation
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/60 rounded-3xl bg-card">
          <Building2 className="size-10 text-primary/60 mb-2" />
          <h4 className="text-base font-bold">No Bookings Recorded</h4>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
            Add hotel stays, flight details, or train bookings to access your confirmation numbers on the go.
          </p>
          <Button onClick={onAddBooking} variant="outline" size="sm" className="rounded-xl gap-1.5 font-semibold">
            <Plus className="size-4" /> Add First Booking
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((booking) => {
            const IconComp = BOOKING_ICONS[booking.type] || FileText;
            const startDate = booking.startDateTime
              ? new Date(booking.startDateTime).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;
            const endDate = booking.endDateTime
              ? new Date(booking.endDateTime).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            return (
              <Card
                key={booking.id}
                className="border border-border/60 shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden bg-card flex flex-col justify-between"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <IconComp className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                            {booking.type}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0 font-bold ${
                              booking.status === "CONFIRMED"
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : booking.status === "CANCELLED"
                                ? "bg-red-500/10 text-red-600 border-red-500/20"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            }`}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <h4 className="text-base font-bold tracking-tight text-foreground line-clamp-1">
                          {booking.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditBooking(booking)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit Booking"
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        onClick={() => onDeleteBooking(booking.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete Booking"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Confirmation Code Copy Box */}
                  {booking.confirmationNumber && (
                    <div className="flex items-center justify-between bg-muted/50 border border-border/50 rounded-2xl px-3.5 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">Confirmation / PNR:</span>
                        <span className="text-xs font-mono font-bold text-foreground">
                          {booking.confirmationNumber}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyConfirmation(booking.id, booking.confirmationNumber!)}
                        className="p-1 rounded-lg hover:bg-background text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-[11px] font-semibold"
                      >
                        {copiedId === booking.id ? (
                          <>
                            <Check className="size-3.5 text-emerald-500" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5 text-primary" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="space-y-2 text-xs text-muted-foreground">
                    {booking.provider && (
                      <p className="font-medium text-foreground/80">
                        Provider: <span className="font-semibold text-foreground">{booking.provider}</span>
                      </p>
                    )}

                    {(startDate || endDate) && (
                      <div className="flex flex-wrap items-center gap-3">
                        {startDate && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5 text-primary" /> {startDate}
                          </span>
                        )}
                        {endDate && (
                          <span className="flex items-center gap-1">
                            → {endDate}
                          </span>
                        )}
                      </div>
                    )}

                    {booking.address && (
                      <p className="flex items-center gap-1 text-foreground/80">
                        <MapPin className="size-3.5 text-primary shrink-0" />
                        <span className="truncate">{booking.address}</span>
                      </p>
                    )}

                    {booking.notes && (
                      <p className="text-[11px] bg-muted/30 p-2 rounded-xl border border-border/30 italic">
                        "{booking.notes}"
                      </p>
                    )}
                  </div>

                  {/* Card Footer Info */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                    {booking.totalCost !== null && booking.totalCost !== undefined ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{booking.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">No cost specified</span>
                    )}

                    {onUploadDocumentForBooking && (
                      <button
                        onClick={() => onUploadDocumentForBooking(booking.id)}
                        className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                      >
                        <Paperclip className="size-3.5" /> Attach Voucher
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
