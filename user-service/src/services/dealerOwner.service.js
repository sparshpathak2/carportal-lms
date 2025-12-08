import prisma from "../lib/prisma.js";
import { calculateDealerTargets } from "./target.service.js";
import { refreshTargetsForDealer } from "./target.service.js";


export const assignDealerOwnerService = async (dealerId, newUserId) => {

    // 1. Validate dealer + packs
    const dealer = await prisma.dealer.findUnique({
        where: { id: dealerId },
        include: { packs: true }
    });
    if (!dealer) throw new Error("Dealer not found");

    const leadsPack = dealer.packs.find(p => p.packType === "LEADS");

    // ❗ Do NOT block assigning owner
    // If no LEADS pack → dealerTargets = 0
    let dealerTargets = { daily: 0, weekly: 0, monthly: 0 };

    if (leadsPack) {
        dealerTargets = calculateDealerTargets(leadsPack);
    }

    // 2. Validate new owner (must be INTERNAL)
    const newUser = await prisma.user.findUnique({
        where: { id: newUserId },
        include: { role: true }
    });
    if (!newUser) throw new Error("User not found");

    if (newUser.role.roleType !== "INTERNAL") {
        throw new Error("Only INTERNAL users can be dealer owners");
    }

    // 3. Find existing owner (if any)
    const existingOwner = await prisma.dealerOwner.findFirst({
        where: { dealerId },
        include: { user: true }
    });

    // 4. Remove old owner + subtract targets
    if (existingOwner) {

        // subtract targets only if pack existed
        if (leadsPack) {
            await prisma.user.update({
                where: { id: existingOwner.userId },
                data: {
                    liveDailyTarget: { decrement: dealerTargets.daily },
                    liveWeeklyTarget: { decrement: dealerTargets.weekly },
                    liveMonthlyTarget: { decrement: dealerTargets.monthly }
                }
            });
        }

        await prisma.dealerOwner.deleteMany({ where: { dealerId } });
    }

    // 5. Assign new owner
    const newOwner = await prisma.dealerOwner.create({
        data: { dealerId, userId: newUserId }
    });

    // add targets only if pack exists
    if (leadsPack) {
        await prisma.user.update({
            where: { id: newUserId },
            data: {
                liveDailyTarget: { increment: dealerTargets.daily },
                liveWeeklyTarget: { increment: dealerTargets.weekly },
                liveMonthlyTarget: { increment: dealerTargets.monthly }
            }
        });
    }

    return {
        message: "Dealer owner assigned successfully",
        owner: newOwner,
        appliedTargets: dealerTargets
    };
};



export const removeDealerOwnerService = async (dealerId) => {
    const existingOwner = await prisma.dealerOwner.findFirst({
        where: { dealerId },
        include: {
            user: true,
            dealer: { include: { packs: true } }
        }
    });

    if (!existingOwner) {
        return { message: "No owner assigned for this dealer" };
    }

    const userId = existingOwner.userId;
    const user = existingOwner.user;

    // ------------------------------
    // 1. SUBTRACT the target of this dealer (if LEADS pack exists)
    // ------------------------------
    const leadsPack = existingOwner.dealer.packs.find(
        p => p.packType === "LEADS"
    );

    if (leadsPack) {
        const dealerTargets = calculateDealerTargets(leadsPack);

        await prisma.user.update({
            where: { id: userId },
            data: {
                liveDailyTarget: { decrement: dealerTargets.daily },
                liveWeeklyTarget: { decrement: dealerTargets.weekly },
                liveMonthlyTarget: { decrement: dealerTargets.monthly }
            }
        });
    }

    // ------------------------------
    // 2. Remove dealerOwner entry
    // ------------------------------
    await prisma.dealerOwner.deleteMany({ where: { dealerId } });

    // ------------------------------
    // 3. CHECK if this INTERNAL USER still owns any dealers
    // ------------------------------
    const remainingLinkedDealers = await prisma.dealerOwner.count({
        where: { userId }
    });

    if (remainingLinkedDealers === 0) {
        // ❗ same logic as "no LEADS pack": reset everything to 0
        await prisma.user.update({
            where: { id: userId },
            data: {
                liveDailyTarget: 0,
                liveWeeklyTarget: 0,
                liveMonthlyTarget: 0
            }
        });
    }

    return { message: "Dealer owner removed successfully" };
};



export const getDealerOwnerService = async (dealerId) => {
    return await prisma.dealerOwner.findMany({
        where: { dealerId },
        include: {
            user: { include: { role: true } }
        }
    });
};
