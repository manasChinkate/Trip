import { useState, useEffect } from "react";
import { X, Building2, Plane, Train, Bus, Car, Ticket, FileText, Calendar, DollarSign, MapPin, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Booking, BookingType, BookingStatus } from "../services/itineraryApi";

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: Partial<Booking>) => Promise<void>;
  initialBooking?: Booking | null;
}

const BOOKING_TYPES: { label: string; value: BookingType; icon: any }[] = [
  { label: "Hotel Stay", value: "HOTEL", icon: Building2 },
  { label: "Flight", value: "FLIGHT", icon: Plane },
  { label: "Train", value: "TRAIN", icon: Train },
  { label: "Bus / Coach", value: "BUS", icon: Bus },
  { label: "Rental / Cab", value: "CAB", icon: Car },
  { label: "Ticket / Event", value: "EVENT_TICKET", icon: Ticket },
  { label: "Other", value: "OTHER", icon: FileText },
];

export function AddBookingModal({
  isOpen,
  onClose,
  onSave,
  initialBooking,
}: AddBookingModalProps) {
  const [type, setType] = useState<BookingType>("HOTEL");
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [address, setAddress] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<BookingStatus>("CONFIRMED");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialBooking) {
      setType(initialBooking.type || "HOTEL");
      setTitle(initialBooking.title || "");
      setProvider(initialBooking.provider || "");
      setConfirmationNumber(initialBooking.confirmationNumber || "");
      setStartDateTime(
        initialBooking.startDateTime
          ? new Date(initialBooking.startDateTime).toISOString().slice(0, 16)
          : ""
      );
      setEndDateTime(
        initialBooking.endDateTime
          ? new Date(initialBooking.endDateTime).toISOString().slice(0, 16)
          : ""
      );
      setTotalCost(
        initialBooking.totalCost !== null && initialBooking.totalCost !== undefined
          ? String(initialBooking.totalCost)
          : ""
      );
      setCurrency(initialBooking.currency || "USD");
      setAddress(initialBooking.address || "");
      setContactInfo(initialBooking.contactInfo || "");
      setNotes(initialBooking.notes || "");
      setStatus(initialBooking.status || "CONFIRMED");
    } else {
      setType("HOTEL");
      setTitle("");
      setProvider("");
      setConfirmationNumber("");
      setStartDateTime("");
      setEndDateTime("");
      setTotalCost("");
      setCurrency("USD");
      setAddress("");
      setContactInfo("");
      setNotes("");
      setStatus("CONFIRMED");
    }
  }, [initialBooking, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        type,
        title: title.trim(),
        provider: provider.trim() || undefined,
        confirmationNumber: confirmationNumber.trim() || undefined,
        startDateTime: startDateTime ? new Date(startDateTime).toISOString() : undefined,
        endDateTime: endDateTime ? new Date(endDateTime).toISOString() : undefined,
        totalCost: totalCost ? parseFloat(totalCost) : undefined,
        currency,
        address: address.trim() || undefined,
        contactInfo: contactInfo.trim() || undefined,
        notes: notes.trim() || undefined,
        status,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/60 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/30">
          <h3 className="text-lg font-bold">
            {initialBooking ? "Edit Booking Details" : "Add New Booking / Reservation"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Booking Type Grid */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Booking Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {BOOKING_TYPES.map((b) => {
                const IconComponent = b.icon;
                return (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setType(b.value)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      type === b.value
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border/50 hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    <IconComponent className="size-4 mb-1" />
                    <span className="truncate max-w-full">{b.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="bookingTitle" className="text-xs font-semibold">
              Reservation Title *
            </Label>
            <Input
              id="bookingTitle"
              placeholder={type === "HOTEL" ? "e.g. Hilton Paris Opera Hotel" : "e.g. Flight Air France AF-123"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Provider & Confirmation Code */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="provider" className="text-xs font-semibold">
                Provider / Booking Site
              </Label>
              <Input
                id="provider"
                placeholder="e.g. Booking.com / Delta"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmationCode" className="text-xs font-semibold flex items-center gap-1">
                <Hash className="size-3.5 text-primary" /> PNR / Confirmation #
              </Label>
              <Input
                id="confirmationCode"
                placeholder="e.g. CONF-88219"
                value={confirmationNumber}
                onChange={(e) => setConfirmationNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Check-in / Start Date & Check-out / End Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDateTime" className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="size-3.5 text-primary" /> {type === "HOTEL" ? "Check-in Date & Time" : "Departure Time"}
              </Label>
              <Input
                id="startDateTime"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDateTime" className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="size-3.5 text-primary" /> {type === "HOTEL" ? "Check-out Date & Time" : "Arrival Time"}
              </Label>
              <Input
                id="endDateTime"
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
              />
            </div>
          </div>

          {/* Total Cost & Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="totalCost" className="text-xs font-semibold flex items-center gap-1">
                <DollarSign className="size-3.5 text-primary" /> Total Cost
              </Label>
              <div className="flex items-center gap-1">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none"
                >
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                  <option value="INR">₹ INR</option>
                  <option value="JPY">¥ JPY</option>
                </select>
                <Input
                  id="totalCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs font-semibold">
                Booking Status
              </Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as BookingStatus)}
                className="w-full h-9 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none"
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="PLANNED">Planned</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Address / Contact */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold flex items-center gap-1">
              <MapPin className="size-3.5 text-primary" /> Address / Location Details
            </Label>
            <Input
              id="address"
              placeholder="e.g. 10 Rue de la Paix, 75002 Paris"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="bookingNotes" className="text-xs font-semibold">
              Additional Notes
            </Label>
            <Textarea
              id="bookingNotes"
              placeholder="e.g. Free breakfast included, late check-in requested."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Saving..." : initialBooking ? "Update Booking" : "Add Booking"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
