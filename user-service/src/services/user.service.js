import prisma from "../lib/prisma.js";
import { nanoid } from "nanoid";
import bcrypt from "bcrypt";
import { refreshTargetsForDealer } from "./target.service.js";

export const createUserService = async (data) => {
    const { dealerId, role, password, ...userData } = data;

    // 1. Lookup role by name
    const roleRecord = await prisma.role.findUnique({
        where: { name: role }
    });

    if (!roleRecord) throw new Error("Invalid role");

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create the user using *relation connect*
    const newUser = await prisma.user.create({
        data: {
            id: nanoid(10),
            ...userData,
            password: hashedPassword,

            role: {
                connect: { id: roleRecord.id }
            },

            ...(dealerId && {
                dealer: { connect: { id: dealerId } }
            }),
        },
        include: {
            role: true,
            dealer: true,
        },
    });

    // 4. If user belongs to a dealer & is a DEALER role → assign targets
    if (dealerId && roleRecord.roleType === "DEALER") {
        const dealer = await prisma.dealer.findUnique({
            where: { id: dealerId },
            include: { packs: true }
        });

        const leadsPack = dealer?.packs.find(p => p.packType === "LEADS");

        if (leadsPack) {
            await refreshTargetsForDealer(dealerId, leadsPack);
        }
    }

    return newUser;
};

export const deleteUserService = async (userId) => {
    // 1. Fetch user before deleting
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            role: true,
            dealer: {
                include: { packs: true }
            }
        }
    });

    if (!user) throw new Error("User not found");

    const dealerId = user.dealer?.id;
    const roleType = user.role.roleType;

    // 2. Delete the user
    const deleted = await prisma.user.delete({
        where: { id: userId }
    });

    // 3. If user belongs to a dealer and is DEALER role → recalc
    if (dealerId && roleType === "DEALER") {

        // find leads pack
        const leadsPack = user.dealer.packs.find(
            p => p.packType === "LEADS"
        );

        // If dealer still has a LEADS pack → recalc exactly like creation
        if (leadsPack) {
            await refreshTargetsForDealer(dealerId, leadsPack);
        }
    }

    return deleted;
};
