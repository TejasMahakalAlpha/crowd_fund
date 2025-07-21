// ✅ causeRoutes.js
import express from "express";
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import {
  getAllCauses,
  createCause,
  updateCause,
  deleteCause,
} from "../controllers/causeController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getAllCauses);
router.post("/", verifyAdmin, upload.single("image"), createCause);
router.put("/:id", verifyAdmin, updateCause);
router.delete("/:id", verifyAdmin, deleteCause);

export default router;