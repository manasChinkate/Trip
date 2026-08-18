import { useState, useEffect } from "react";
import {
  Building2,
  Plane,
  Train,
  Bus,
  Car,
  Ticket,
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  Hash,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import type { Booking, BookingType, BookingStatus } from "../services/itineraryApi";

interface AddBookingSheetProps {
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

export function AddBookingSheet({
  isOpen,
  onClose,
  onSave,
  initialBooking,
}: AddBookingSheetProps) {
  const [type, setType] = useState<BookingType>("HOTEL");
  const [title, setTitle] = useState("");
  const [provider, setProvider] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [address, setAddress] = useState("");
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
      setCurrency(initialBooking.currency || "INR");
      setAddress(initialBooking.address || "");
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
      setCurrency("INR");
      setAddress("");
      setStatus("CONFIRMED");
      setNotes("");
    }
  }, [initialBooking, isOpen]);

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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-l border-border/60 shadow-2xl">
        {/* Header */}
        <SheetHeader className="p-5 sm:p-6 border-b border-border/40 bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Building2 className="size-4" />
            <span>Reservations</span>
          </div>
          <SheetTitle className="text-lg sm:text-xl font-bold tracking-tight">
            {initialBooking ? "Edit Booking Details" : "Add Reservation"}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Save hotel stays, flight confirmation codes, or event ticket details for offline access.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Form Body */}
        <form id="booking-sheet-form" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Booking Category Selector Grid */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Sparkles className="size-3.5 text-primary" /> Booking Category
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {BOOKING_TYPES.map((b) => {
                const IconComponent = b.icon;
                return (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setType(b.value)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-medium transition-all ${
                      type === b.value
                        ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30"
                        : "border-border/50 hover:bg-muted/60 text-muted-foreground"
                    }`}
                  >
                    <IconComponent className="size-4 mb-1" />
                    <span className="truncate max-w-full text-[11px] font-semibold">{b.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="booking-sheet-title" className="text-xs font-semibold">
              Reservation Title *
            </Label>
            <Input
              id="booking-sheet-title"
              placeholder={type === "HOTEL" ? "e.g. Hilton Paris Opera Hotel" : "e.g. Air France Flight AF-123"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-sm font-medium rounded-xl"
              required
            />
          </div>

          {/* Provider & Confirmation Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="booking-sheet-provider" className="text-xs font-semibold">
                Provider / Booking Site
              </Label>
              <Input
                id="booking-sheet-provider"
                placeholder="e.g. Booking.com / Delta"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="booking-sheet-pnr" className="text-xs font-semibold flex items-center gap-1">
                <Hash className="size-3.5 text-primary" /> PNR / Confirmation #
              </Label>
              <Input
                id="booking-sheet-pnr"
                placeholder="e.g. CONF-88219"
                value={confirmationNumber}
                onChange={(e) => setConfirmationNumber(e.target.value)}
                className="h-9 text-xs font-mono font-semibold rounded-xl"
              />
            </div>
          </div>

          {/* Check-in / Start Date & Check-out / End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="booking-sheet-start" className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="size-3.5 text-primary" /> {type === "HOTEL" ? "Check-in Date & Time" : "Departure Time"}
              </Label>
              <Input
                id="booking-sheet-start"
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="booking-sheet-end" className="text-xs font-semibold flex items-center gap-1">
                <Calendar className="size-3.5 text-primary" /> {type === "HOTEL" ? "Check-out Date & Time" : "Arrival Time"}
              </Label>
              <Input
                id="booking-sheet-end"
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Total Cost & Status */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="booking-sheet-cost" className="text-xs font-semibold flex items-center gap-1">
                <DollarSign className="size-3.5 text-primary" /> Total Cost
              </Label>
              <div className="flex items-center gap-1">
                <Select value={currency} onValueChange={(val) => setCurrency(val)}>
                  <SelectTrigger className="w-24 h-9 rounded-xl text-xs">
                    <SelectValue placeholder="INR" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">₹ INR</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                    <SelectItem value="GBP">£ GBP</SelectItem>
                    <SelectItem value="JPY">¥ JPY</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="booking-sheet-cost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={totalCost}
                  onChange={(e) => setTotalCost(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="booking-sheet-status" className="text-xs font-semibold">
                Status
              </Label>
              <Select value={status} onValueChange={(val) => setStatus(val as BookingStatus)}>
                <SelectTrigger className="w-full h-9 rounded-xl text-xs">
                  <SelectValue placeholder="Confirmed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PLANNED">Planned</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address / Location */}
          <div className="space-y-1.5">
            <Label htmlFor="booking-sheet-address" className="text-xs font-semibold flex items-center gap-1">
              <MapPin className="size-3.5 text-primary" /> Address / Location
            </Label>
            <Input
              id="booking-sheet-address"
              placeholder="e.g. 10 Rue de la Paix, 75002 Paris"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-9 text-xs rounded-xl"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="booking-sheet-notes" className="text-xs font-semibold">
              Additional Notes
            </Label>
            <Textarea
              id="booking-sheet-notes"
              placeholder="e.g. Breakfast included. Late check-in confirmed."
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs rounded-xl"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <SheetFooter className="p-4 border-t border-border/40 bg-card/80 backdrop-blur-md flex flex-row items-center justify-end gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl flex-1 text-xs font-semibold h-10">
            Cancel
          </Button>
          <Button
            type="submit"
            form="booking-sheet-form"
            disabled={isSubmitting || !title.trim()}
            className="rounded-xl flex-1 text-xs font-semibold h-10 shadow-md shadow-primary/20"
          >
            {isSubmitting ? "Saving..." : initialBooking ? "Update Reservation" : "Save Reservation"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
