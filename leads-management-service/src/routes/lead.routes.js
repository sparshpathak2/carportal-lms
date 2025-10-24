import { Router } from "express";
import { createLead, getLeads, getLeadById, updateLead, bulkUploadLeads } from "../controllers/lead.controller.js";

const router = Router();

// Leads Routes
router.post("/", createLead);
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.put("/:id", updateLead);

// Bulk Uploads
router.post("/bulk-upload", bulkUploadLeads);

export default router;
