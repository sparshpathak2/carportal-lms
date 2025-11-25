import prisma from "../lib/prisma.js";
import { nanoid } from "nanoid";

// ------------------------------------
// ✅ Get all lead lost reasons
// ------------------------------------
export const getLeadLostReasons = async (req, res) => {
    try {
        const reasons = await prisma.leadLostReason.findMany({
            include: { status: true },
            orderBy: { order: "asc" },
        });
        return res.status(200).json({ success: true, data: reasons });
    } catch (err) {
        console.error("GetLeadLostReasons Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ------------------------------------
// ✅ Get single lead lost reason by ID
// ------------------------------------
export const getLeadLostReasonById = async (req, res) => {
    const { id } = req.params;
    try {
        const reason = await prisma.leadLostReason.findUnique({
            where: { id },
            include: { status: true },
        });

        if (!reason) {
            return res.status(404).json({ success: false, message: "Lost reason not found" });
        }

        return res.status(200).json({ success: true, data: reason });
    } catch (err) {
        console.error("GetLeadLostReasonById Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ------------------------------------
// ✅ Create a new lead lost reason
// ------------------------------------
export const createLeadLostReason = async (req, res) => {
    try {
        const { name, statusId, order } = req.body;

        if (!name || !statusId) {
            return res.status(400).json({ success: false, message: "Name and statusId are required" });
        }

        // Optional: check if status exists
        const statusExists = await prisma.leadStatus.findUnique({ where: { id: statusId } });
        if (!statusExists) {
            return res.status(400).json({ success: false, message: "Invalid statusId" });
        }

        const newReason = await prisma.leadLostReason.create({
            data: {
                name,
                statusId,
                order: order ?? null,
            },
        });

        return res.status(201).json({
            success: true,
            message: "Lead lost reason created successfully",
            data: newReason,
        });
    } catch (err) {
        console.error("CreateLeadLostReason Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ------------------------------------
// ✅ Update lead lost reason by ID
// ------------------------------------
export const updateLeadLostReason = async (req, res) => {
    const { id } = req.params;
    const { name, statusId, order } = req.body;

    try {
        const reason = await prisma.leadLostReason.findUnique({ where: { id } });
        if (!reason) {
            return res.status(404).json({ success: false, message: "Lost reason not found" });
        }

        // Optional: validate statusId
        if (statusId) {
            const statusExists = await prisma.leadStatus.findUnique({ where: { id: statusId } });
            if (!statusExists) {
                return res.status(400).json({ success: false, message: "Invalid statusId" });
            }
        }

        const updatedReason = await prisma.leadLostReason.update({
            where: { id },
            data: {
                name: name ?? reason.name,
                statusId: statusId ?? reason.statusId,
                order: order ?? reason.order,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Lead lost reason updated successfully",
            data: updatedReason,
        });
    } catch (err) {
        console.error("UpdateLeadLostReason Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ------------------------------------
// ✅ Delete lead lost reason by ID
// ------------------------------------
export const deleteLeadLostReason = async (req, res) => {
    const { id } = req.params;

    try {
        const reason = await prisma.leadLostReason.findUnique({ where: { id } });
        if (!reason) {
            return res.status(404).json({ success: false, message: "Lost reason not found" });
        }

        await prisma.leadLostReason.delete({ where: { id } });

        return res.status(200).json({
            success: true,
            message: "Lead lost reason deleted successfully",
        });
    } catch (err) {
        console.error("DeleteLeadLostReason Error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
