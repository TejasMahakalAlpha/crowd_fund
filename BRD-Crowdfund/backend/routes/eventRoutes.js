// ✅ eventRoutes.js
import express from "express";
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getAllEvents);
router.post("/", verifyAdmin, upload.single("image"), createEvent);
router.put("/:id", verifyAdmin, updateEvent);
router.delete("/:id", verifyAdmin, deleteEvent);

export default router;