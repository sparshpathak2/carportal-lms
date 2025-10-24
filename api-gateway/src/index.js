import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import userAuthRoutes from "./routes/user.routes.js";
import leadsRoutes from "./routes/lead.routes.js";
import notificationsRoutes from "./routes/notification.routes.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS setup
// app.use(cors());
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

app.use(cookieParser());

// Apply auth middleware globally (before proxies)
app.use(authMiddleware);

// JSON body parsing (skip for multipart)
app.use((req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (contentType.startsWith("multipart/form-data")) {
        return next();
    }
    express.json({ limit: "10mb" })(req, res, next);
});

// Routes → single combined file
app.use("/api/user", userAuthRoutes);
app.use("/api/lead", leadsRoutes);
app.use("/api/notification", notificationsRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "API Gateway running ✅" });
});

app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on port ${PORT}`);
});
