import { Response } from "express";
import fs from "fs";
import path from "path";
import { prisma } from "../../../lib/prisma";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";

const getParamString = (param: any): string => {
  return Array.isArray(param) ? param[0] : String(param || "");
};

/**
 * 1. Fetch attachments for a plan
 */
export const getPlanAttachments = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const planId = parseInt(getParamString(req.params.planId), 10);
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    const attachments = await prisma.attachment.findMany({
      where: { planId },
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          select: { id: true, title: true, type: true },
        },
        itineraryItem: {
          select: { id: true, title: true },
        },
      },
    });

    return res.json(attachments);
  } catch (error: any) {
    console.error("Error fetching attachments:", error);
    return res.status(500).json({ message: "Failed to fetch attachments" });
  }
};

/**
 * 2. Upload/Create an Attachment record
 */
export const uploadAttachment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const planId = parseInt(getParamString(req.params.planId), 10);
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid plan ID" });
    }

    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const file = req.file;
    const { category, bookingId, itineraryItemId, fileUrl: customFileUrl, fileName: customFileName } = req.body;

    let fileName = file ? file.originalname : customFileName;
    let fileUrl = file ? `/uploads/${file.filename}` : customFileUrl;
    let fileType = file ? file.mimetype : req.body.fileType || "application/octet-stream";
    let fileSize = file ? file.size : req.body.fileSize ? parseInt(req.body.fileSize, 10) : null;

    if (!fileUrl || !fileName) {
      return res.status(400).json({ message: "File or file URL is required" });
    }

    const attachment = await prisma.attachment.create({
      data: {
        planId,
        fileName,
        fileUrl,
        fileType,
        fileSize,
        category: category || "OTHER",
        uploadedBy: req.user.userId,
        bookingId: bookingId ? parseInt(bookingId, 10) : null,
        itineraryItemId: itineraryItemId ? parseInt(itineraryItemId, 10) : null,
      },
      include: {
        booking: { select: { id: true, title: true, type: true } },
        itineraryItem: { select: { id: true, title: true } },
      },
    });

    return res.status(201).json(attachment);
  } catch (error: any) {
    console.error("Error uploading attachment:", error);
    return res.status(500).json({ message: "Failed to upload attachment" });
  }
};

/**
 * 3. Delete an Attachment
 */
export const deleteAttachment = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const attachmentId = parseInt(getParamString(req.params.attachmentId), 10);

    if (isNaN(attachmentId)) {
      return res.status(400).json({ message: "Invalid attachment ID" });
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    // Try deleting physical file if local upload
    if (attachment.fileUrl.startsWith("/uploads/")) {
      const filename = attachment.fileUrl.replace("/uploads/", "");
      const filePath = path.join(process.cwd(), "uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return res.json({ message: "Attachment deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting attachment:", error);
    return res.status(500).json({ message: "Failed to delete attachment" });
  }
};
