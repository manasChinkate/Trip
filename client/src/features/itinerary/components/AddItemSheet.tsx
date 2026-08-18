import { useState, useEffect } from "react";
import { Clock, MapPin, DollarSign, Bookmark, Compass, Sparkles } from "lucide-react";
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
import type {
  ItineraryItem,
  ItineraryCategory,
  Booking,
} from "../services/itineraryApi";

interface AddItemSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ItineraryItem>) => Promise<void>;
  initialItem?: ItineraryItem | null;
  bookings?: Booking[];
}

const CATEGORIES: { label: string; value: ItineraryCategory; emoji: string }[] = [
  { label: "Activity", value: "ACTIVITY", emoji: "🎯" },
  { label: "Sightseeing", value: "SIGHTSEEING", emoji: "🏛️" },
  { label: "Restaurant", value: "RESTAURANT", emoji: "🍽️" },
  { label: "Hotel Check-in", value: "HOTEL", emoji: "🏨" },
  { label: "Flight", value: "FLIGHT", emoji: "✈️" },
  { label: "Train", value: "TRAIN", emoji: "🚆" },
  { label: "Bus / Transit", value: "BUS", emoji: "🚌" },
  { label: "Note", value: "NOTE", emoji: "📝" },
];

export function AddItemSheet({
  isOpen,
  onClose,
  onSave,
  initialItem,
  bookings = [],
}: AddItemSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItineraryCategory>("ACTIVITY");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [bookingId, setBookingId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title || "");
      setDescription(initialItem.description || "");
      setCategory(initialItem.category || "ACTIVITY");
      setStartTime(
        initialItem.startTime
          ? new Date(initialItem.startTime).toISOString().slice(0, 16)
          : ""
      );
      setEndTime(
        initialItem.endTime
          ? new Date(initialItem.endTime).toISOString().slice(0, 16)
          : ""
      );
      setLocation(initialItem.location || "");
      setEstimatedCost(
        initialItem.estimatedCost !== null && initialItem.estimatedCost !== undefined
          ? String(initialItem.estimatedCost)
          : ""
      );
      setCurrency(initialItem.currency || "INR");
      setBookingId(initialItem.bookingId ? String(initialItem.bookingId) : "");
    } else {
      setTitle("");
      setDescription("");
      setCategory("ACTIVITY");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setEstimatedCost("");
      setCurrency("INR");
      setBookingId("");
    }
  }, [initialItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        startTime: startTime ? new Date(startTime).toISOString() : undefined,
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
        location: location.trim() || undefined,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
        currency,
        bookingId: bookingId ? parseInt(bookingId, 10) : undefined,
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
        <SheetHeader className="p-6 border-b border-border/40 bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <Compass className="size-4" />
            <span>Daily Schedule</span>
          </div>
          <SheetTitle className="text-xl font-bold tracking-tight">
            {initialItem ? "Edit Activity" : "Add Activity to Itinerary"}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Schedule an event, dining, hotel check-in, or transit item for this trip day.
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Form Body */}
        <form id="item-sheet-form" onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title Input */}
          <div className="space-y-1.5">
            <Label htmlFor="sheet-title" className="text-xs font-semibold">
              Activity Title *
            </Label>
            <Input
              id="sheet-title"
              placeholder="e.g. Visit Louvre Museum or Dinner at Le Bistro"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 text-sm font-medium rounded-xl"
              required
            />
          </div>

          {/* Category Selector Grid */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Sparkles className="size-3.5 text-primary" /> Category
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-medium transition-all ${
                    category === cat.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30"
                      : "border-border/50 hover:bg-muted/60 text-muted-foreground"
                  }`}
                >
                  <span className="text-lg mb-1">{cat.emoji}</span>
                  <span className="truncate max-w-full text-[11px] font-semibold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Times Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sheet-startTime" className="text-xs font-semibold flex items-center gap-1">
                <Clock className="size-3.5 text-primary" /> Start Time
              </Label>
              <Input
                id="sheet-startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sheet-endTime" className="text-xs font-semibold flex items-center gap-1">
                <Clock className="size-3.5 text-primary" /> End Time
              </Label>
              <Input
                id="sheet-endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="sheet-location" className="text-xs font-semibold flex items-center gap-1">
              <MapPin className="size-3.5 text-primary" /> Location / Address
            </Label>
            <Input
              id="sheet-location"
              placeholder="e.g. Rue de Rivoli, 75001 Paris, France"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-9 text-xs rounded-xl"
            />
          </div>

          {/* Cost & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="sheet-cost" className="text-xs font-semibold flex items-center gap-1">
                <DollarSign className="size-3.5 text-primary" /> Est. Cost
              </Label>
              <Input
                id="sheet-cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sheet-currency" className="text-xs font-semibold">
                Currency
              </Label>
              <Select value={currency} onValueChange={(val) => setCurrency(val)}>
                <SelectTrigger className="w-full h-9 rounded-xl text-xs">
                  <SelectValue placeholder="INR" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Linked Booking */}
          {bookings.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="sheet-bookingLink" className="text-xs font-semibold flex items-center gap-1">
                <Bookmark className="size-3.5 text-primary" /> Link Booking (Optional)
              </Label>
              <Select value={bookingId || "none"} onValueChange={(val) => setBookingId(val === "none" ? "" : val)}>
                <SelectTrigger className="w-full h-9 rounded-xl text-xs">
                  <SelectValue placeholder="No Linked Booking" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- No Linked Booking --</SelectItem>
                  {bookings.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.type}: {b.title} {b.confirmationNumber ? `(${b.confirmationNumber})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="sheet-description" className="text-xs font-semibold">
              Description / Notes
            </Label>
            <Textarea
              id="sheet-description"
              placeholder="e.g. Pre-booked tickets online. Meet guide at North Gate."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            form="item-sheet-form"
            disabled={isSubmitting || !title.trim()}
            className="rounded-xl flex-1 text-xs font-semibold h-10 shadow-md shadow-primary/20"
          >
            {isSubmitting ? "Saving..." : initialItem ? "Update Activity" : "Save Activity"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
