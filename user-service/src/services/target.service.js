import prisma from "../lib/prisma.js";

/**
 * Calculate dealer targets from pack
 */
export const calculateDealerTargets = (pack) => {
    const daily = Math.ceil(pack.targetLeads / 26);
    const weekly = Math.ceil(pack.targetLeads / 4);
    const monthly = pack.targetLeads;

    return { daily, weekly, monthly };
};

/**
 * Update Dealer Live Targets
 */
export const updateDealerLiveTargets = async (dealerId, pack) => {
    const { daily, weekly, monthly } = calculateDealerTargets(pack);

    await prisma.dealer.update({
        where: { id: dealerId },
        data: {
            liveDailyTarget: daily,
            liveWeeklyTarget: weekly,
            liveMonthlyTarget: monthly,
        },
    });

    return { daily, weekly, monthly };
};

/**
 * Update User Live Targets for dealer users
 */
// export const updateAllUsersLiveTargets = async (dealerId, dealerTargets) => {

//     // 1. Fetch dealer’s INTERNAL owner (from dealerOwner table)
//     const dealerOwner = await prisma.dealerOwner.findFirst({
//         where: { dealerId },
//         include: {
//             user: {
//                 include: { role: true }
//             }
//         }
//     });

//     const owner = dealerOwner?.user || null;

//     // 2. Fetch only dealer users (roleType = DEALER)
//     const dealerUsers = await prisma.user.findMany({
//         where: { dealerId },
//         include: { role: true }
//     });

//     // ----------- 1. INTERNAL OWNER gets FULL target -----------
//     if (owner) {
//         await prisma.user.update({
//             where: { id: owner.id },
//             data: {
//                 liveDailyTarget: dealerTargets.daily,
//                 liveWeeklyTarget: dealerTargets.weekly,
//                 liveMonthlyTarget: dealerTargets.monthly
//             }
//         });
//     }

//     // ----------- 2. DEALER USERS get DISTRIBUTED target -----------
//     if (dealerUsers.length > 0) {
//         const perUserDaily = Math.ceil(dealerTargets.daily / dealerUsers.length);
//         const perUserWeekly = Math.ceil(dealerTargets.weekly / dealerUsers.length);
//         const perUserMonthly = Math.ceil(dealerTargets.monthly / dealerUsers.length);

//         await prisma.user.updateMany({
//             where: {
//                 id: { in: dealerUsers.map((u) => u.id) },
//             },
//             data: {
//                 liveDailyTarget: perUserDaily,
//                 liveWeeklyTarget: perUserWeekly,
//                 liveMonthlyTarget: perUserMonthly,
//             },
//         });
//     }
// };

export const updateAllUsersLiveTargets = async (dealerId, dealerTargets) => {

    // 1. Fetch dealer’s INTERNAL owner (from dealerOwner table)
    const dealerOwner = await prisma.dealerOwner.findFirst({
        where: { dealerId },
        include: {
            user: {
                include: { role: true }
            }
        }
    });

    const owner = dealerOwner?.user || null;

    // 2. Fetch only dealer users (roleType = DEALER)
    const dealerUsers = await prisma.user.findMany({
        where: { dealerId },
        include: { role: true }
    });

    // ----------- 1. INTERNAL OWNER gets FULL target -----------
    if (owner) {
        await prisma.user.update({
            where: { id: owner.id },
            data: {
                liveDailyTarget: dealerTargets.daily,
                liveWeeklyTarget: dealerTargets.weekly,
                liveMonthlyTarget: dealerTargets.monthly
            }
        });
    }

    // ----------- 2. DEALER USERS get DISTRIBUTED target -----------
    if (dealerUsers.length > 0) {
        const count = dealerUsers.length;

        // --- Daily ---
        const baseDaily = Math.floor(dealerTargets.daily / count);
        let remainderDaily = dealerTargets.daily % count;

        // --- Weekly ---
        const baseWeekly = Math.floor(dealerTargets.weekly / count);
        let remainderWeekly = dealerTargets.weekly % count;

        // --- Monthly ---
        const baseMonthly = Math.floor(dealerTargets.monthly / count);
        let remainderMonthly = dealerTargets.monthly % count;

        for (let i = 0; i < dealerUsers.length; i++) {
            const user = dealerUsers[i];

            const daily = baseDaily + (remainderDaily > 0 ? 1 : 0);
            const weekly = baseWeekly + (remainderWeekly > 0 ? 1 : 0);
            const monthly = baseMonthly + (remainderMonthly > 0 ? 1 : 0);

            // Reduce the remainder as we assign
            if (remainderDaily > 0) remainderDaily--;
            if (remainderWeekly > 0) remainderWeekly--;
            if (remainderMonthly > 0) remainderMonthly--;

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    liveDailyTarget: daily,
                    liveWeeklyTarget: weekly,
                    liveMonthlyTarget: monthly,
                },
            });
        }
    }
};




/**
 * Full pipeline to update both Dealer + Users
 */
export const refreshTargetsForDealer = async (dealerId, pack) => {
    const dealerTargets = await updateDealerLiveTargets(dealerId, pack);
    await updateAllUsersLiveTargets(dealerId, dealerTargets);
};

