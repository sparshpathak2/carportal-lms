import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";

import leadRoutes from "./routes/lead.routes.js";
import leadActivityRoutes from "./routes/leadActivity.routes.js";
import leadStatusRoutes from "./routes/leadStatus.routes.js";
import leadCommentRoutes from "./routes/leadComment.routes.js";
import { attachUser } from "./middlewares/attachuser.middleware.js";

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));

app.use(attachUser); // ✅ before routes
// Routes
app.use("/leads", leadRoutes);
app.use("/activities", leadActivityRoutes);
app.use("/statuses", leadStatusRoutes);
app.use("/comments", leadCommentRoutes);

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "leads-service" });
});

app.listen(PORT, () => {
    console.log(`✅ Leads Service running on port ${PORT}`);
});
