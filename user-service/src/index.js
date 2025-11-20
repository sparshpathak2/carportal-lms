import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import dealerRoutes from "./routes/dealer.routes.js";
import packRoutes from "./routes/pack.routes.js";
import { attachUser } from "./middlewares/attachuser.middleware.js";

const app = express();
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
app.use("/dealers", dealerRoutes);
app.use("/packs", packRoutes);

// Health check (for gateway, monitoring, etc.)
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "user-service" });
});

// Start service
app.listen(PORT, () => {
    console.log(`✅ User-Service running on port ${PORT}`);
});
