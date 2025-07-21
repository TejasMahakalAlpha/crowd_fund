// backend/middleware/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";

// ✅ Utility: create folder if not exists
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let target = "uploads/general"; // fallback
    if (req.baseUrl.includes("events")) target = "uploads/events";
    if (req.baseUrl.includes("causes")) target = "uploads/causes";
    if (req.baseUrl.includes("blogs")) target = "uploads/blogs";

    ensureDirExists(target);
    cb(null, target);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

export default upload;
