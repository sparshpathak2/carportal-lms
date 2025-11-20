import { Router } from "express";
import { verifyWebhook, handleWebhook, getFbLeads } from "../controllers/integrations2.controller.js";

const router = Router();

// Webhook verification (GET)
router.get("/fb/webhook", verifyWebhook);

// Webhook payload handler (POST)
router.post("/fb/webhook", handleWebhook);

// Optional manual fetch of leads
router.get("/fb/leads", getFbLeads);

// 🩺 Health check (for testing connectivity)
router.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "Facebook Integrations service is up and running!",
        timestamp: new Date().toISOString(),
    });
});

export default router;
