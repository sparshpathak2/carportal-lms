import prisma from "../lib/prisma.js";
import { createUserService, deleteUserService } from "../services/user.service.js";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
// import bcrypt from "bcryptjs";

// import { prisma } from "../lib/prisma.js"

export const createUser = async (req, res) => {
    try {
        const { password, ...rest } = req.body;

        const user = await createUserService({
            ...rest,
            password,
        });

        return res.status(201).json({ success: true, data: user });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

// ✅ Get all users (with roles and dealer)
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                role: true,
                dealer: {       // the dealer the user belongs to
                    include: {
                        packs: true
                    }
                },
                ownerOf: {      // dealers this user owns
                    include: {
                        dealer: {
                            include: {
                                packs: true
                            }
                        }
                    }
                }
            },
        });

        return res.status(200).json({
            success: true,
            data: users,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Get a single user by ID
export const getUserById = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                dealer: true,
                ownerOf: {
                    include: {
                        dealer: {
                            include: {
                                packs: {
                                    where: {
                                        packType: "LEADS",   // ⭐ ONLY LEADS PACKS
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error("getUserById error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Get users by dealerId
export const getUsersByDealerId = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "dealerId is required" });
    }

    try {
        const users = await prisma.user.findMany({
            where: { dealerId: id },
            include: {
                role: true,
                dealer: true,
            },
        });

        return res.status(200).json({ success: true, data: users });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Update user by ID
export const updateUserById = async (req, res) => {
    const { id } = req.params;
    const {
        email,
        password,
        name,
        phone,
        alternatePhone,
        location,
        city,
        role,               // role name
        liveDailyTarget,
        liveWeeklyTarget,
        liveMonthlyTarget
    } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { id },
            include: { role: true, dealer: true }
        });

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 1. Hash password only if provided
        let hashedPassword = existingUser.password;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // 2. Resolve role (role name → roleId)
        let roleId = existingUser.roleId;
        if (role) {
            const roleRecord = await prisma.role.findUnique({
                where: { name: role }
            });

            if (!roleRecord) {
                return res.status(400).json({ success: false, message: "Invalid role" });
            }
            roleId = roleRecord.id;
        }

        // 3. Update user (dealerId cannot change)
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                email: email ?? existingUser.email,
                name: name ?? existingUser.name,
                phone: phone ?? existingUser.phone,
                alternatePhone: alternatePhone ?? existingUser.alternatePhone,
                location: location ?? existingUser.location,
                city: city ?? existingUser.city,
                password: hashedPassword,
                roleId,

                // targets (optional)
                liveDailyTarget: liveDailyTarget ?? existingUser.liveDailyTarget,
                liveWeeklyTarget: liveWeeklyTarget ?? existingUser.liveWeeklyTarget,
                liveMonthlyTarget: liveMonthlyTarget ?? existingUser.liveMonthlyTarget,

                // DO NOT update dealerId
            },
            include: {
                role: true,
                dealer: true,
            },
        });

        return res.status(200).json({ success: true, data: updatedUser });

    } catch (err) {
        console.error("Update user error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// ✅ Delete user by ID
export const deleteUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const deletedUser = await deleteUserService(userId);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
            data: deletedUser,
        });

    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

// ➕ Add a dealer to user's ownerOf list
export const addDealerOwner = async (req, res) => {
    const { id } = req.params;
    const { dealerId } = req.body;

    try {
        // Check user
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Check dealer
        const dealer = await prisma.dealer.findUnique({ where: { id: dealerId } });
        if (!dealer) return res.status(404).json({ message: "Dealer not found" });

        // Prevent duplicates
        const existing = await prisma.dealerOwner.findFirst({
            where: { userId: id, dealerId }
        });
        if (existing) {
            return res.status(400).json({ message: "Already assigned to this dealer" });
        }

        // Add
        await prisma.dealerOwner.create({
            data: { userId: id, dealerId }
        });

        return res.json({ success: true, message: "Dealer assigned successfully" });
    } catch (err) {
        console.error("Add dealer error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ➖ Remove a dealer from owner's list
export const removeDealerOwner = async (req, res) => {
    const { id } = req.params;
    const { dealerId } = req.body;

    try {
        const relation = await prisma.dealerOwner.findFirst({
            where: { userId: id, dealerId }
        });

        if (!relation) {
            return res.status(400).json({ message: "User is not an owner of this dealer" });
        }

        await prisma.dealerOwner.delete({ where: { id: relation.id } });

        return res.json({ success: true, message: "Dealer removed successfully" });
    } catch (err) {
        console.error("Remove dealer error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
