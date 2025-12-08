import prisma from "../lib/prisma.js";
import { nanoid } from "nanoid";

// Roles allowed to see/manage all leads
const canAccessAll = (role) =>
    ["SUPER_ADMIN", "ADMIN", "CALLING"].includes(role);

// ✅ Helper: format activity
const formatActivity = (activity) => ({
    id: activity.id,
    leadId: activity.leadId,
    performedById: activity.performedById,
    performedByName: activity.performedByName,
    type: activity.type,
    description: activity.description,
    oldStatus: activity.oldStatus,
    newStatus: activity.newStatus,
    oldReason: activity.oldReason,
    newReason: activity.newReason,
    oldAssignee: activity.oldAssignee,
    newAssignee: activity.newAssignee,
    dueDate: activity.dueDate,
    completed: activity.completed,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
});

// ========================
// Create a new activity
// ========================
export const createActivity = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;

        const { leadId, performedBy, type, description, dueDate, completed } =
            req.body;

        if (!leadId || !type) {
            return res
                .status(400)
                .json({ success: false, message: "leadId and type are required" });
        }

        // Check if lead exists & user has access
        const lead = await prisma.lead.findFirst({
            where: canAccessAll(roleName)
                ? { id: leadId }
                : { id: leadId, dealerId: userDealerId },
            include: { status: true, lostReason: true },
        });

        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found or not accessible" });
        }

        const activity = await prisma.activity.create({
            data: {
                // id: nanoid(10),
                leadId,
                performedBy: performedBy || req.user.id,
                type,
                description,
                dueDate,
                completed: completed || false,
                // snapshot fields (if applicable)
                oldStatus: lead.status?.name || null,
                newStatus: lead.status?.name || null,
                oldReason: lead.lostReason?.name || null,
                newReason: lead.lostReason?.name || null,
                oldAssignee: lead.assignedToName || null,
                newAssignee: lead.assignedToName || null,
            },
        });

        res.status(201).json({ success: true, data: formatActivity(activity) });
    } catch (err) {
        console.error("Create activity error:", err);
        res.status(500).json({ success: false, message: "Failed to create activity" });
    }
};

// ========================
// Get all activities for a lead
// ========================
export const getActivitiesByLeadId = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const leadId = req.params.id;

        // Check if lead exists & user has access
        const lead = await prisma.lead.findFirst({
            where: canAccessAll(roleName)
                ? { id: leadId }
                : { id: leadId, dealerId: userDealerId },
        });

        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found or not accessible" });
        }

        const activities = await prisma.activity.findMany({
            where: { leadId },
            orderBy: { createdAt: "desc" },
        });

        res.json({ success: true, data: activities.map(formatActivity) });
    } catch (err) {
        console.error("Get activities error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch activities" });
    }
};

// ========================
// Get single activity by ID
// ========================
export const getActivityById = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const { id } = req.params;

        const activity = await prisma.activity.findUnique({
            where: { id },
            include: { lead: true },
        });

        if (!activity) {
            return res
                .status(404)
                .json({ success: false, message: "Activity not found" });
        }

        // Access check
        if (!canAccessAll(roleName) && activity.lead.dealerId !== userDealerId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        res.json({ success: true, data: formatActivity(activity) });
    } catch (err) {
        console.error("Get activity by ID error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch activity" });
    }
};

// ========================
// Update activity by ID
// ========================
export const updateActivity = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const { id } = req.params;
        const data = req.body;

        const activity = await prisma.activity.findUnique({
            where: { id },
            include: { lead: true },
        });

        if (!activity) {
            return res
                .status(404)
                .json({ success: false, message: "Activity not found" });
        }

        // Access check
        if (!canAccessAll(roleName) && activity.lead.dealerId !== userDealerId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const updatedActivity = await prisma.activity.update({
            where: { id },
            data,
        });

        res.json({ success: true, data: formatActivity(updatedActivity) });
    } catch (err) {
        console.error("Update activity error:", err);
        res.status(500).json({ success: false, message: "Failed to update activity" });
    }
};

// ========================
// Delete activity by ID
// ========================
export const deleteActivity = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const { id } = req.params;

        const activity = await prisma.activity.findUnique({
            where: { id },
            include: { lead: true },
        });

        if (!activity) {
            return res
                .status(404)
                .json({ success: false, message: "Activity not found" });
        }

        // Access check
        if (!canAccessAll(roleName) && activity.lead.dealerId !== userDealerId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        await prisma.activity.delete({ where: { id } });

        res.json({ success: true, message: "Activity deleted successfully" });
    } catch (err) {
        console.error("Delete activity error:", err);
        res.status(500).json({ success: false, message: "Failed to delete activity" });
    }
};