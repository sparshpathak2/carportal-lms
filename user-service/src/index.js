import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
import dealerRoutes from "./routes/dealer.routes.js";
import dealerOwnerRoutes from "./routes/dealerOwner.routes.js";
import packRoutes from "./routes/pack.routes.js";
import { attachUser } from "./middlewares/attachUser.middleware.js";

const app = express();

/* 🔥 ADD THIS LINE HERE */
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3002;

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS – allow frontend requests with credentials
// app.use(cors());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000", // frontend
        credentials: true, // allow cookies
    })
);


app.use(attachUser); // ✅ before routes
// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/roles", roleRoutes);
app.use("/dealers", dealerRoutes);
app.use("/dealerOwners", dealerOwnerRoutes);
app.use("/packs", packRoutes);

// Health check (for gateway, monitoring, etc.)
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "user-service" });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 User Service is running on http://127.0.0.1:${PORT}`);
});