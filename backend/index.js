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
import otpRoutes from "./routes/otpRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import enhancedAiRoutes from "./routes/enhancedAiRoutes.js";
import sosRoutes from "./routes/sosRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import http from "http";
import { Server } from "socket.io";
import { setIO } from "./socket.js";

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});
setIO(io);

io.on("connection", (socket) => {
  console.log("Client connected to socket:", socket.id);
  
  socket.on("join", (userId) => {
    socket.join(`user_${userId}`);
    console.log(`Socket ${socket.id} joined room user_${userId}`);
  });

  socket.on("join_admin", () => {
    socket.join("admin_room");
    console.log(`Socket ${socket.id} joined admin_room`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

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
app.use("/api/sos", sosRoutes);
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
app.use("/api/otp", otpRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai/v2", enhancedAiRoutes); // New enhanced AI endpoints
app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
