import { useState } from "react";
import {
  FileText,
  UploadCloud,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Attachment, DocumentType } from "../services/itineraryApi";

interface DocumentsVaultProps {
  attachments: Attachment[];
  onUploadClick: () => void;
  onDeleteAttachment: (id: number) => void;
}

const CATEGORY_LABELS: Record<DocumentType, { label: string; icon: string }> = {
  TICKET: { label: "Tickets & Passes", icon: "🎟️" },
  HOTEL_VOUCHER: { label: "Hotel Vouchers", icon: "🏨" },
  PASSPORT_VISA: { label: "Passport & Visas", icon: "🛂" },
  RECEIPT: { label: "Receipts & Invoices", icon: "🧾" },
  OTHER: { label: "Other Documents", icon: "📄" },
};

export function DocumentsVault({
  attachments,
  onUploadClick,
  onDeleteAttachment,
}: DocumentsVaultProps) {
  const [filter, setFilter] = useState<string>("ALL");

  const filteredAttachments = attachments.filter((att) => {
    if (filter === "ALL") return true;
    return att.category === filter;
  });

  const getFullUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `http://localhost:3000${url}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-5 rounded-3xl shadow-sm">
        <div>
          <h3 className="text-xl font-bold tracking-tight">Document Vault & Attachments</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Store and organize all PDF tickets, hotel vouchers, passport scans, and travel receipts.
          </p>
        </div>

        <Button onClick={onUploadClick} className="rounded-2xl gap-1.5 font-semibold shadow-sm">
          <UploadCloud className="size-4" /> Upload Document
        </Button>
      </div>

      {/* Filter Chips */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              filter === "ALL"
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
            }`}
          >
            All Files ({attachments.length})
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, meta]) => {
            const count = attachments.filter((a) => a.category === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filter === key
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                <span className="opacity-70 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Attachments Grid */}
      {attachments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/60 rounded-3xl bg-card">
          <FileText className="size-10 text-primary/60 mb-2" />
          <h4 className="text-base font-bold">No Documents Uploaded</h4>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
            Upload PDF boarding passes, hotel booking receipts, or ID documents to access them anywhere during your trip.
          </p>
          <Button onClick={onUploadClick} variant="outline" size="sm" className="rounded-xl gap-1.5 font-semibold">
            <UploadCloud className="size-4" /> Upload First Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredAttachments.map((file) => {
            const catMeta = CATEGORY_LABELS[file.category] || CATEGORY_LABELS.OTHER;
            const fullUrl = getFullUrl(file.fileUrl);

            return (
              <Card
                key={file.id}
                className="border border-border/60 shadow-sm hover:shadow-md transition-all rounded-3xl overflow-hidden bg-card flex flex-col justify-between"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-10 rounded-2xl bg-muted flex items-center justify-center text-lg shrink-0">
                        {catMeta.icon}
                      </div>
                      <div className="min-w-0">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-extrabold uppercase">
                          {catMeta.label}
                        </Badge>
                        <h4 className="text-xs font-bold text-foreground truncate mt-0.5" title={file.fileName}>
                          {file.fileName}
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteAttachment(file.id)}
                      className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                      title="Delete File"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Linked booking or item */}
                  {(file.booking || file.itineraryItem) && (
                    <div className="text-[11px] bg-muted/40 p-2 rounded-xl border border-border/30 text-muted-foreground truncate">
                      {file.booking && <span>Attached to Booking: <strong>{file.booking.title}</strong></span>}
                      {file.itineraryItem && <span>Attached to Activity: <strong>{file.itineraryItem.title}</strong></span>}
                    </div>
                  )}

                  {/* Date & Download Link */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                    <span className="text-muted-foreground">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </span>

                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-lg"
                    >
                      <ExternalLink className="size-3" /> View / Download
                    </a>
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
