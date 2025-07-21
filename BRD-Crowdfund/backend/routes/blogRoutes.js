// ✅ blogRoutes.js
import express from "express";
import { verifyAdmin } from '../middleware/verifyAdmin.js';
import {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getAllBlogs);
router.post("/", verifyAdmin, upload.single("image"), createBlog);
router.put("/:id", verifyAdmin, upload.single("image"), updateBlog);
router.delete("/:id", verifyAdmin, deleteBlog);

export default router;