import { useState } from "react";
import { UploadCloud, CheckCircle, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import type { DocumentType, Booking, ItineraryItem } from "../services/itineraryApi";

interface UploadDocumentSheetProps {
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

export function UploadDocumentSheet({
  isOpen,
  onClose,
  onUpload,
  bookings = [],
}: UploadDocumentSheetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentType>("TICKET");
  const [bookingId, setBookingId] = useState("");
  const [itineraryItemId, setItineraryItemId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-l border-border/60 shadow-2xl">
        {/* Header */}
        <SheetHeader className="p-5 sm:p-6 border-b border-border/40 bg-card/60 backdrop-blur-md">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <FileText className="size-4" />
            <span>Document Vault</span>
          </div>
          <SheetTitle className="text-lg sm:text-xl font-bold tracking-tight">
            Upload Travel Document
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Attach boarding passes, hotel vouchers, passport scans, or receipts.
          </SheetDescription>
        </SheetHeader>

        {/* Form Body */}
        <form id="doc-sheet-form" onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Category Selector Grid */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <Sparkles className="size-3.5 text-primary" /> Document Category
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {DOCUMENT_TYPES.map((doc) => (
                <button
                  key={doc.value}
                  type="button"
                  onClick={() => setCategory(doc.value)}
                  className={`flex items-center gap-2 p-3 rounded-2xl border text-xs font-medium transition-all ${
                    category === doc.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30"
                      : "border-border/50 hover:bg-muted/60 text-muted-foreground"
                  }`}
                >
                  <span className="text-base">{doc.icon}</span>
                  <span className="truncate text-[11px] font-semibold">{doc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* File Dropzone */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">File Attachment</Label>
            <div className="border-2 border-dashed border-border/80 hover:border-primary/60 rounded-2xl p-6 text-center cursor-pointer transition-colors relative bg-muted/20">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {file ? (
                <div className="flex flex-col items-center justify-center gap-1.5 text-primary font-semibold text-xs">
                  <CheckCircle className="size-8 text-emerald-500" />
                  <span className="truncate max-w-[240px] text-foreground font-bold">{file.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <UploadCloud className="size-8 text-primary" />
                  <p className="text-xs font-medium">
                    <span className="text-primary font-bold">Tap to choose file</span> or drag & drop
                  </p>
                  <p className="text-[11px]">PDFs, Vouchers, Tickets or Receipts (Up to 20MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Link to Booking */}
          {bookings.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="doc-sheet-booking" className="text-xs font-semibold">
                Link to Reservation (Optional)
              </Label>
              <Select value={bookingId || "none"} onValueChange={(val) => setBookingId(val === "none" ? "" : val)}>
                <SelectTrigger className="w-full h-9 rounded-xl text-xs">
                  <SelectValue placeholder="General Plan Document" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- General Plan Document --</SelectItem>
                  {bookings.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.type}: {b.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form>

        {/* Footer Actions */}
        <SheetFooter className="p-4 border-t border-border/40 bg-card/80 backdrop-blur-md flex flex-row items-center justify-end gap-3 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl flex-1 text-xs font-semibold h-10">
            Cancel
          </Button>
          <Button
            type="submit"
            form="doc-sheet-form"
            disabled={isSubmitting || !file}
            className="rounded-xl flex-1 text-xs font-semibold h-10 shadow-md shadow-primary/20"
          >
            {isSubmitting ? "Uploading..." : "Upload Document"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
