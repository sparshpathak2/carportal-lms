import { nanoid } from "nanoid";
import prisma from "../lib/prisma.js";

// ✅ Get all dealers (with their users)
export const getAllDealers = async (req, res) => {
    try {
        const dealers = await prisma.dealer.findMany({
            include: {
                users: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        return res.status(200).json({ success: true, data: dealers });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Get single dealer by ID
export const getDealerById = async (req, res) => {
    const { id } = req.params;
    try {
        const dealer = await prisma.dealer.findUnique({
            where: { id },
            include: {
                users: {
                    include: {
                        role: true,
                    },
                },
            },
        });
        if (!dealer) return res.status(404).json({ success: false, message: "Dealer not found" });
        return res.status(200).json({ success: true, data: dealer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Create new dealer
export const createDealer = async (req, res) => {
    const { name, gstNumber, address } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, message: "Name is required" });
    }

    try {
        const dealer = await prisma.dealer.create({
            data: {
                id: nanoid(10),
                name,
                gstNumber,
                address,
            },
        });
        return res.status(201).json({ success: true, data: dealer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Update dealer by ID
export const updateDealerById = async (req, res) => {
    const { id } = req.params;
    const { name, gstNumber, address } = req.body;

    try {
        const existingDealer = await prisma.dealer.findUnique({ where: { id } });
        if (!existingDealer) return res.status(404).json({ success: false, message: "Dealer not found" });

        const updatedDealer = await prisma.dealer.update({
            where: { id },
            data: {
                name: name || existingDealer.name,
                gstNumber: gstNumber ?? existingDealer.gstNumber,
                address: address ?? existingDealer.address,
            },
        });

        return res.status(200).json({ success: true, data: updatedDealer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Delete dealer by ID
export const deleteDealerById = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedDealer = await prisma.dealer.delete({
            where: { id },
        });
        return res.status(200).json({ success: true, data: deletedDealer, message: "Dealer deleted" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Get all users for a specific dealer
export const getUsersByDealerId = async (req, res) => {
    const { id } = req.params;

    try {
        const users = await prisma.user.findMany({
            where: { dealerId: id },
            include: { role: true, dealer: true },
        });
        return res.status(200).json({ success: true, data: users });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
