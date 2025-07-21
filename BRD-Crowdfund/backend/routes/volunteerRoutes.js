// ✅ volunteerRoutes.js
import express from "express";
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import {
  getAllVolunteers,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer
} from "../controllers/volunteerController.js";

const router = express.Router();

router.get("/", verifyAdmin, getAllVolunteers);
router.post("/", createVolunteer);
router.put("/:id", verifyAdmin, updateVolunteer);
router.delete("/:id", verifyAdmin, deleteVolunteer);

export default router;