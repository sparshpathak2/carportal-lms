import prisma from "../lib/prisma.js";
import { nanoid } from "nanoid";

// Roles allowed to see/manage all leads/statuses
const canAccessAll = (role) =>
    ["SUPER_ADMIN", "ADMIN", "CALLING"].includes(role);

// ✅ Create a new lead status
export const createLeadStatus = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        console.log("roleName:", roleName)
        if (!canAccessAll(roleName)) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        const { name, order } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        // find max order
        const maxOrder = await prisma.leadStatus.aggregate({
            _max: { order: true },
        });

        const status = await prisma.leadStatus.create({
            data: {
                id: nanoid(10),
                name,
                order: order ?? (maxOrder._max.order !== null ? maxOrder._max.order + 1 : 1),
            },
        });

        res.status(201).json({
            success: true,
            message: "Lead status created successfully",
            data: status,
        });
    } catch (error) {
        console.error("Create LeadStatus error:", error);
        if (error.code === "P2002") {
            return res.status(400).json({ success: false, message: "Status name already exists" });
        }
        res.status(500).json({ success: false, message: "Failed to create lead status" });
    }
};

// ✅ Get all lead statuses
export const getLeadStatuses = async (req, res) => {
    try {
        const statuses = await prisma.leadStatus.findMany({
            orderBy: { order: "asc" },
            include: {
                lostReasons: true, // 👈 automatically fetch lost reasons
            },
        });

        res.json({ success: true, data: statuses });
    } catch (error) {
        console.error("Get LeadStatuses error:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch lead statuses" });
    }
};

// ✅ Get a single lead status by ID
export const getLeadStatusById = async (req, res) => {
    try {
        const { id } = req.params;

        const status = await prisma.leadStatus.findUnique({
            where: { id },
            include: {
                lostReasons: true,
            },
        });

        if (!status) {
            return res
                .status(404)
                .json({ success: false, message: "Lead status not found" });
        }

        res.json({ success: true, data: status });
    } catch (error) {
        console.error("Get LeadStatus by ID error:", error);
        res
            .status(500)
            .json({ success: false, message: "Failed to fetch lead status" });
    }
};

// ✅ Update a lead status
export const updateLeadStatus = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        if (!canAccessAll(roleName)) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        const { id } = req.params;
        const { name, order } = req.body;

        if (!name && order === undefined) {
            return res.status(400).json({ success: false, message: "Nothing to update" });
        }

        const status = await prisma.leadStatus.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(order !== undefined && { order }),
            },
        });

        res.json({ success: true, message: "Lead status updated successfully", data: status });
    } catch (error) {
        console.error("Update LeadStatus error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "Lead status not found" });
        }
        res.status(500).json({ success: false, message: "Failed to update lead status" });
    }
};

// ✅ Delete a lead status
export const deleteLeadStatus = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        if (!canAccessAll(roleName)) {
            return res.status(403).json({ success: false, message: "Forbidden" });
        }

        const { id } = req.params;

        await prisma.leadStatus.delete({
            where: { id },
        });

        res.json({ success: true, message: "Lead status deleted successfully" });
    } catch (error) {
        console.error("Delete LeadStatus error:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ success: false, message: "Lead status not found" });
        }
        res.status(500).json({ success: false, message: "Failed to delete lead status" });
    }
};
