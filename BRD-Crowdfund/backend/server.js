// backend/server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import volunteerRoutes from './routes/volunteerRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import causeRoutes from './routes/causeRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();

// ⛔ Stop if JWT_SECRET not set
if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in .env");
  process.exit(1);
}

// 🟢 Connect to MongoDB
connectDB();

// 🛠️ Setup Express
const app = express();

// 🧭 Required for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🟢 Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

// ✅ Serve Static Uploads (very important!)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log("✅ Static uploads served from:", path.join(__dirname, 'uploads'));

// ✅ API Routes
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/causes', causeRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contacts', contactRoutes);

// 🧪 Test Route
app.get("/", (req, res) => {
  res.send("✅ Crowdfund API is running...");
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
