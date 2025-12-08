import prisma from "../lib/prisma.js";
// import { nanoid } from "nanoid";

export const createPack = async (req, res) => {
    const { dealerId, name, targetLeads, packCost, cycleStartDate } = req.body;

    if (!dealerId || !name || !targetLeads || !packCost || !cycleStartDate) {
        return res.status(400).json({
            success: false,
            message: "dealerId, name, targetLeads, packCost, cycleStartDate are required",
        });
    }

    try {
        // validate dealer exists
        const dealer = await prisma.dealer.findUnique({ where: { id: dealerId } });
        if (!dealer) {
            return res.status(404).json({ success: false, message: "Dealer not found" });
        }

        const pack = await prisma.pack.create({
            data: {
                dealerId,
                name,
                targetLeads: Number(targetLeads),
                packCost: Number(packCost),
                cycleStartDate: new Date(cycleStartDate),
            },
        });

        return res.status(201).json({ success: true, data: pack });
    } catch (error) {
        console.error("Create Pack Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getAllPacks = async (req, res) => {
    try {
        const packs = await prisma.pack.findMany({
            include: {
                dealer: true,
            },
        });

        return res.status(200).json({ success: true, data: packs });
    } catch (error) {
        console.error("Get All Packs Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getPackById = async (req, res) => {
    const { id } = req.params;

    try {
        const pack = await prisma.pack.findUnique({
            where: { id },
            include: { dealer: true },
        });

        if (!pack) {
            return res.status(404).json({ success: false, message: "Pack not found" });
        }

        return res.status(200).json({ success: true, data: pack });
    } catch (error) {
        console.error("Get Pack by ID Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// ⭐ Get all packs for a specific dealer
export const getPackByDealerId = async (req, res) => {
    try {
        const { dealerId } = req.params;

        const packs = await prisma.pack.findMany({
            where: { dealerId },
            orderBy: { createdAt: "desc" }
        });

        if (!packs || packs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No packs found for this dealer"
            });
        }

        return res.status(200).json({
            success: true,
            data: packs
        });
    } catch (error) {
        console.error("❌ getPackByDealerId error:", error);
        return res.status(500).json({
            success: false,
            message: "Error fetching packs for dealer"
        });
    }
};



export const updatePack = async (req, res) => {
    const { id } = req.params;
    const { name, targetLeads, packCost, cycleStartDate, dealerId } = req.body;

    try {
        const existing = await prisma.pack.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: "Pack not found" });
        }

        // Optional validation for dealerId change
        if (dealerId) {
            const dealer = await prisma.dealer.findUnique({ where: { id: dealerId } });
            if (!dealer) {
                return res.status(404).json({ success: false, message: "Dealer not found" });
            }
        }

        const updatedPack = await prisma.pack.update({
            where: { id },
            data: {
                name: name ?? existing.name,
                targetLeads: targetLeads !== undefined ? Number(targetLeads) : existing.targetLeads,
                packCost: packCost !== undefined ? Number(packCost) : existing.packCost,
                cycleStartDate: cycleStartDate ? new Date(cycleStartDate) : existing.cycleStartDate,
                dealerId: dealerId ?? existing.dealerId,
            },
        });

        return res.status(200).json({ success: true, data: updatedPack });
    } catch (error) {
        console.error("Update Pack Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deletePack = async (req, res) => {
    const { id } = req.params;

    try {
        const existing = await prisma.pack.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: "Pack not found" });
        }

        await prisma.pack.delete({ where: { id } });

        return res.status(200).json({ success: true, message: "Pack deleted successfully" });
    } catch (error) {
        console.error("Delete Pack Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
