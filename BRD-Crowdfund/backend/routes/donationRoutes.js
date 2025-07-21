
// ✅ donationRoutes.js
import express from "express";
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import {
  getAllDonations,
  createDonation,
  updateDonation,
  deleteDonation,
} from "../controllers/donationController.js";

const router = express.Router();

router.get("/", verifyAdmin, getAllDonations);
router.post("/", createDonation);
router.put("/:id", verifyAdmin, updateDonation);
router.delete("/:id", verifyAdmin, deleteDonation);

export default router;
