import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";
import { attachUser } from "./middlewares/attachUser.middleware.js";

import notificationRoutes from "./routes/notification.routes.js";

const app = express();
const httpServer = createServer(app);

// ✅ Socket.IO setup
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    },
});

const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    })
);

// app.use(attachUser)

// ✅ Routes
app.use("/notifications", notificationRoutes(io));

// ✅ Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "notification-service" });
});

// ✅ Socket.io connection handling
io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Example: join a room for a specific user (for private notifications)
    socket.on("join", (userId) => {
        const roomName = `user:${userId}`;
        socket.join(roomName);
        console.log(`👤 User ${userId} joined room ${roomName}`);
    });

    // Example: handle manual test emits from client
    socket.on("test-notification", (data) => {
        console.log("📨 Received test notification:", data);
        io.to(data.userId).emit("new-notification", data);
    });

    socket.on("disconnect", () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

// ✅ Start server
httpServer.listen(PORT, () => {
    console.log(`✅ Notification-Service running on port ${PORT}`);
});
