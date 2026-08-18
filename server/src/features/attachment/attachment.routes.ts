import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authenticate } from "../../middleware/authMiddleware";
import {
  getPlanAttachments,
  uploadAttachment,
  deleteAttachment,
} from "./attachment.controller";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

const router = Router();

router.use(authenticate);

router.get("/plans/:planId/attachments", getPlanAttachments);
router.post("/plans/:planId/attachments", upload.single("file"), uploadAttachment);
router.delete("/attachments/:attachmentId", deleteAttachment);

export default router;
