import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import proxy from "express-http-proxy";

import userAuthRoutes from "./routes/user.routes.js";
import leadsRoutes from "./routes/lead.routes.js";
import notificationsRoutes from "./routes/notification.routes.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

const app = express();
const PORT = process.env.PORT || 3001;

// 🌐 Base URLs
const LEADS_SERVICE =
    process.env.LEADS_MANAGEMENT_SERVICE_URL || "http://localhost:3003";

// ✅ CORS setup
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);

app.use(cookieParser());

// ✅ 1. Public route for Facebook Webhook (no auth)
app.use(
    "/api/integrations/fb/webhook",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/integrations/fb/webhook${req.url}`,
        proxyErrorHandler: (err, res, next) => {
            console.error("❌ FB Webhook Proxy Error:", err);
            res.status(500).json({ message: "Webhook proxy error", error: err.message });
        },
    })
);

// ✅ 2. Apply Auth middleware globally (after webhook)
app.use(authMiddleware);

// ✅ 3. Parse JSON (skip multipart)
app.use((req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (contentType.startsWith("multipart/form-data")) return next();
    express.json({ limit: "10mb" })(req, res, next);
});

// ✅ 4. Mount internal routes
app.use("/api/user", userAuthRoutes);
app.use("/api/lead", leadsRoutes);
app.use("/api/notification", notificationsRoutes);

// ✅ 5. Health check
app.get("/health", (req, res) => {
    res.json({ status: "API Gateway running ✅" });
});

// ✅ 6. Start server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 API Gateway running on http://127.0.0.1:${PORT}`);
    console.log(`🌍 Public webhook endpoint: /api/integrations/fb/webhook`);
});