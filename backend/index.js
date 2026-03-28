// backend/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import "./config/db.js"; // connects to Postgres
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import storyRoutes from "./routes/storyRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminManagementRoutes from "./routes/adminManagementRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import savedRoutes from "./routes/savedRoutes.js";
import tourismPublicRoutes from "./routes/tourismPublicRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // helps with form-data text fields too

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Echoes of Nepal backend is running",
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/manage", adminManagementRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/saved", savedRoutes);
app.use("/api/tourism", tourismPublicRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
