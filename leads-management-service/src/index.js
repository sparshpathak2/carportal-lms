import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import leadRoutes from "./routes/lead.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import filterRoutes from "./routes/filter.routes.js";
import leadActivityRoutes from "./routes/leadActivity.routes.js";
import leadStatusRoutes from "./routes/leadStatus.routes.js";
import leadSourcesRoutes from "./routes/leadSources.routes.js";
import leadLostReason from "./routes/leadLostReason.routes.js";
import leadCommentRoutes from "./routes/leadComment.routes.js";
import integrationRoutes from "./routes/integrations.routes.js";
import { attachUser } from "./middlewares/attachUser.middleware.js";

const app = express();

/* 🔥 ADD THIS LINE HERE */
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3003;

// ✅ Capture raw body for signature verification (required for Facebook webhooks)
app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf.toString();
        },
    })
);

// ✅ Cookie & CORS setup
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        credentials: true,
    })
);

// ✅ Basic logger for debugging (helps confirm webhook hits)
app.use((req, res, next) => {
    console.log(`➡️ ${req.method} ${req.originalUrl}`);
    next();
});

// ✅ Skip user attach for Facebook webhook
app.use((req, res, next) => {
    if (req.path.startsWith("/integrations/fb/webhook")) {
        // No auth check for FB
        return next();
    }
    attachUser(req, res, next);
});

// ✅ Mount all routes
app.use("/leads", leadRoutes);
app.use("/customers", customerRoutes);
app.use("/filters", filterRoutes);
app.use("/activities", leadActivityRoutes);
app.use("/statuses", leadStatusRoutes);
app.use("/sources", leadSourcesRoutes);
app.use("/leadLostReasons", leadLostReason);
app.use("/comments", leadCommentRoutes);
app.use("/integrations", integrationRoutes);

// ✅ Health check route
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "leads-service" });
});

// ✅ Start server
app.listen(PORT, '127.0.0.1', () => {
    console.log(`✅ Leads Service running on http://127.0.0.1:${PORT}`);
    console.log(`🌍 Public webhook endpoint: /integrations/fb/webhook`);
});
