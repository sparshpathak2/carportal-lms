import prisma from "../lib/prisma.js";

export const saveUserFilter = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, filters } = req.body;

        if (!type || !filters) {
            return res.status(400).json({ success: false, message: "type and filters are required" });
        }

        const userFilter = await prisma.userFilter.upsert({
            where: {
                userId_type: { userId, type },
            },
            update: { filters },
            create: { userId, type, filters },
        });

        res.json({ success: true, data: userFilter });
    } catch (error) {
        console.error("Save user filter error:", error);
        res.status(500).json({ success: false, message: "Failed to save user filter" });
    }
};

export const getUserFilter = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type } = req.query;

        if (!type) {
            return res.status(400).json({ success: false, message: "type is required" });
        }

        const userFilter = await prisma.userFilter.findUnique({
            where: {
                userId_type: { userId, type },
            },
        });

        res.json({
            success: true,
            data: userFilter ? userFilter.filters : null,
        });
    } catch (error) {
        console.error("Get user filter error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch user filter" });
    }
};

