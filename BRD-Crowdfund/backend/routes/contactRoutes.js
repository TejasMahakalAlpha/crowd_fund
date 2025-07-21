// ✅ contactRoutes.js
import express from "express";
import {
  createContact,
  getAllContacts,
  deleteContact,
} from "../controllers/contactController.js";
import { verifyAdmin } from '../middleware/verifyAdmin.js';

const router = express.Router();

router.post("/", createContact);
router.get("/", verifyAdmin, getAllContacts);
router.delete("/:id", verifyAdmin, deleteContact);

export default router;
