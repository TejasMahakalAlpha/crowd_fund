import express from "express";
import { loginAdmin, registerAdmin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", loginAdmin);
// Only use this once manually to create admin
router.post("/register", registerAdmin);

export default router;
