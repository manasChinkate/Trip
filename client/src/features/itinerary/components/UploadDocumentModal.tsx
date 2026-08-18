import { useState } from "react";
import { X, UploadCloud, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { DocumentType, Booking, ItineraryItem } from "../services/itineraryApi";

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => Promise<void>;
  bookings?: Booking[];
  itineraryItems?: ItineraryItem[];
}

const DOCUMENT_TYPES: { label: string; value: DocumentType; icon: string }[] = [
  { label: "Ticket / Boarding Pass", value: "TICKET", icon: "🎟️" },
  { label: "Hotel Voucher", value: "HOTEL_VOUCHER", icon: "🏨" },
  { label: "Passport / Visa", value: "PASSPORT_VISA", icon: "🛂" },
  { label: "Receipt / Invoice", value: "RECEIPT", icon: "🧾" },
  { label: "Other Document", value: "OTHER", icon: "📄" },
];

export function UploadDocumentModal({
  isOpen,
  onClose,
  onUpload,
  bookings = [],
  itineraryItems = [],
}: UploadDocumentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentType>("TICKET");
  const [bookingId, setBookingId] = useState("");
  const [itineraryItemId, setItineraryItemId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      if (bookingId) formData.append("bookingId", bookingId);
      if (itineraryItemId) formData.append("itineraryItemId", itineraryItemId);

      await onUpload(formData);
      setFile(null);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border/60 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-muted/30">
          <h3 className="text-lg font-bold">Upload Travel Document</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Document Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {DOCUMENT_TYPES.map((doc) => (
                <button
                  key={doc.value}
                  type="button"
                  onClick={() => setCategory(doc.value)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    category === doc.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/50 hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <span className="text-base">{doc.icon}</span>
                  <span className="truncate">{doc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File Input Box */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">File Upload (PDF, JPG, PNG)</Label>
            <div className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-xl p-6 text-center cursor-pointer transition-colors relative bg-muted/20">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm">
                  <CheckCircle className="size-5 text-emerald-500" />
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <UploadCloud className="size-8 text-primary" />
                  <p className="text-xs font-medium">
                    <span className="text-primary font-bold">Click to browse</span> or drag and drop file
                  </p>
                  <p className="text-[11px]">PDFs, Vouchers, Tickets or Receipts (Up to 20MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Optional Links */}
          {bookings.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="attachBooking" className="text-xs font-semibold">
                Link to Booking (Optional)
              </Label>
              <select
                id="attachBooking"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none"
              >
                <option value="">-- Unlinked Document --</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.type}: {b.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !file}>
              {isSubmitting ? "Uploading..." : "Upload Document"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
