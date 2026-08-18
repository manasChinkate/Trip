import { useState, useEffect } from "react";
import { X, Clock, MapPin, DollarSign, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  ItineraryItem,
  ItineraryCategory,
  Booking,
} from "../services/itineraryApi";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<ItineraryItem>) => Promise<void>;
  initialItem?: ItineraryItem | null;
  bookings?: Booking[];
}

const CATEGORIES: { label: string; value: ItineraryCategory; emoji: string }[] = [
  { label: "Activity", value: "ACTIVITY", emoji: "🎯" },
  { label: "Sightseeing", value: "SIGHTSEEING", emoji: "🏛️" },
  { label: "Restaurant / Food", value: "RESTAURANT", emoji: "🍽️" },
  { label: "Hotel Check-in", value: "HOTEL", emoji: "🏨" },
  { label: "Flight", value: "FLIGHT", emoji: "✈️" },
  { label: "Train", value: "TRAIN", emoji: "🚆" },
  { label: "Bus / Transit", value: "BUS", emoji: "🚌" },
  { label: "Note", value: "NOTE", emoji: "📝" },
];

export function AddItemModal({
  isOpen,
  onClose,
  onSave,
  initialItem,
  bookings = [],
}: AddItemModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ItineraryCategory>("ACTIVITY");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [currency, setCurrency] = useState("USD");
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
      setCurrency(initialItem.currency || "USD");
      setBookingId(initialItem.bookingId ? String(initialItem.bookingId) : "");
    } else {
      setTitle("");
      setDescription("");
      setCategory("ACTIVITY");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setEstimatedCost("");
      setCurrency("USD");
      setBookingId("");
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/60 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/30">
          <h3 className="text-lg font-bold">
            {initialItem ? "Edit Activity" : "Add Activity to Itinerary"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-semibold">
              Activity Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g. Visit Louvre Museum or Eiffel Tower Tour"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Category</Label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    category === cat.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/50 hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <span className="text-base mb-1">{cat.emoji}</span>
                  <span className="truncate max-w-full">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start & End Times */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-xs font-semibold flex items-center gap-1">
                <Clock className="size-3.5 text-primary" /> Start Time
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-xs font-semibold flex items-center gap-1">
                <Clock className="size-3.5 text-primary" /> End Time
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-xs font-semibold flex items-center gap-1">
              <MapPin className="size-3.5 text-primary" /> Location / Address
            </Label>
            <Input
              id="location"
              placeholder="e.g. Rue de Rivoli, 75001 Paris, France"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Cost & Currency */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="cost" className="text-xs font-semibold flex items-center gap-1">
                <DollarSign className="size-3.5 text-primary" /> Est. Cost
              </Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="currency" className="text-xs font-semibold">
                Currency
              </Label>
              <select
                id="currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>
          </div>

          {/* Link Booking (if any exist) */}
          {bookings.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="bookingLink" className="text-xs font-semibold flex items-center gap-1">
                <Bookmark className="size-3.5 text-primary" /> Link Booking (Optional)
              </Label>
              <select
                id="bookingLink"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">-- No Linked Booking --</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.type}: {b.title} {b.confirmationNumber ? `(${b.confirmationNumber})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description / Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Description / Details
            </Label>
            <Textarea
              id="description"
              placeholder="e.g. Pre-booked ticket online. Entry via Pyramid entrance."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Saving..." : initialItem ? "Update Activity" : "Add Activity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
