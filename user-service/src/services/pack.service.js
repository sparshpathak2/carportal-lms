import prisma from "../lib/prisma.js";
import { calculateDealerTargets, refreshTargetsForDealer, updateAllUsersLiveTargets, updateDealerLiveTargets } from "./target.service.js";

export const validateUniquePackType = async (dealerId, packType) => {
    const existing = await prisma.pack.findFirst({
        where: { dealerId, packType },
    });

    return !!existing;
};


export const createPackService = async (data) => {
    const { dealerId, packType } = data;

    // 1. Rule: Only 1 pack per type per dealer
    const alreadyExists = await validateUniquePackType(dealerId, packType);
    if (alreadyExists) {
        throw new Error(`A ${packType} pack already exists for this dealer`);
    }

    // 2. Create pack
    const pack = await prisma.pack.create({
        data: {
            name: data.name,
            targetLeads: data.targetLeads,
            packCost: data.packCost,
            cycleStartDate: new Date(data.cycleStartDate),
            packType: data.packType,
            dealerId: data.dealerId,
        },
    });

    // 3. If LEADS pack → refresh dealer targets
    if (packType === "LEADS") {

        // update dealer + dealer users
        const dealerTargets = await updateDealerLiveTargets(dealerId, pack);
        await updateAllUsersLiveTargets(dealerId, dealerTargets);

        // 4. Now increment INTERNAL owner's own total target
        const dealerOwner = await prisma.dealerOwner.findFirst({
            where: { dealerId },
            include: { user: true }
        });

        if (dealerOwner) {
            // ADD to existing target instead of overwriting
            await prisma.user.update({
                where: { id: dealerOwner.userId },
                data: {
                    liveDailyTarget: { increment: dealerTargets.daily },
                    liveWeeklyTarget: { increment: dealerTargets.weekly },
                    liveMonthlyTarget: { increment: dealerTargets.monthly }
                }
            });
        }
    }

    return pack;
};


export const updatePackService = async (packId, data) => {
    const existing = await prisma.pack.findUnique({
        where: { id: packId },
    });

    if (!existing) throw new Error("Pack not found");

    const newDealerId = data.dealerId ?? existing.dealerId;
    const newPackType = data.packType ?? existing.packType;

    // ❗ Check duplicate pack type if dealer or pack type changes
    if (data.packType || data.dealerId) {
        const duplicate = await prisma.pack.findFirst({
            where: {
                dealerId: newDealerId,
                packType: newPackType,
                NOT: { id: packId },
            },
        });

        if (duplicate) {
            throw new Error(`A ${newPackType} pack already exists for this dealer`);
        }
    }

    // ❗ Explicit update payload (safe)
    const updatePayload = {
        name: data.name ?? existing.name,
        targetLeads: data.targetLeads ?? existing.targetLeads,
        packCost: data.packCost ?? existing.packCost,
        packType: newPackType,
        dealerId: newDealerId,
        cycleStartDate: data.cycleStartDate
            ? new Date(data.cycleStartDate)
            : existing.cycleStartDate,
    };

    const updatedPack = await prisma.pack.update({
        where: { id: packId },
        data: updatePayload,
    });

    // ❗ Refresh targets only for LEADS pack
    if (updatedPack.packType === "LEADS") {
        await refreshTargetsForDealer(updatedPack.dealerId, updatedPack);
    }

    return updatedPack;
};

export const getAllPacksService = async () => {
    const packs = await prisma.pack.findMany({
        include: {
            dealer: true, // Include dealer details
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return packs;
};

export const getPackByIdService = async (packId) => {
    const pack = await prisma.pack.findUnique({
        where: { id: packId },
        include: {
            dealer: true
        }
    });

    if (!pack) {
        throw new Error("Pack not found");
    }

    return pack;
};

export const removePackService = async (packId) => {
    // 1. Find the pack
    const existing = await prisma.pack.findUnique({
        where: { id: packId },
        include: { dealer: true }
    });

    if (!existing) throw new Error("Pack not found");

    const dealerId = existing.dealerId;
    const packType = existing.packType;

    // 2. Calculate OLD dealer targets (needed for subtracting from owner)
    const oldDealerTargets = calculateDealerTargets(existing);

    // 3. Find owner
    const owner = await prisma.dealerOwner.findFirst({
        where: { dealerId },
        include: { user: true }
    });

    // 4. Delete the pack
    await prisma.pack.delete({ where: { id: packId } });

    // 5. If NOT a LEADS pack → done (no target impact)
    if (packType !== "LEADS") {
        return { message: "Pack deleted (non-LEADS, no target updates)" };
    }

    // -------------------------------------------------------
    // 🚀 NEW CLEAN LOGIC (As you requested)
    // -------------------------------------------------------

    // ❌ ALWAYS reset dealer targets to ZERO
    await prisma.dealer.update({
        where: { id: dealerId },
        data: {
            liveDailyTarget: 0,
            liveWeeklyTarget: 0,
            liveMonthlyTarget: 0,
        },
    });

    // ❌ ALWAYS reset dealer USER targets to ZERO
    await prisma.user.updateMany({
        where: { dealerId },
        data: {
            liveDailyTarget: 0,
            liveWeeklyTarget: 0,
            liveMonthlyTarget: 0,
        },
    });

    // ❌ OWNER → subtract ONLY the old pack targets
    if (owner) {
        await prisma.user.update({
            where: { id: owner.userId },
            data: {
                liveDailyTarget: { decrement: oldDealerTargets.daily },
                liveWeeklyTarget: { decrement: oldDealerTargets.weekly },
                liveMonthlyTarget: { decrement: oldDealerTargets.monthly },
            },
        });
    }

    return { message: "LEADS pack deleted and targets reset successfully" };
};



export const getPacksByDealerService = async (dealerId) => {
    const packs = await prisma.pack.findMany({
        where: { dealerId },
        orderBy: { createdAt: "desc" },
        include: {
            dealer: true
        }
    });

    if (!packs || packs.length === 0) {
        throw new Error("No packs found for this dealer");
    }

    return packs;
};

