import prisma from "../lib/prisma.js";
import { canAccessAll, isDealerAdmin, isSelfAccess } from "../utils/roleAccess.utils.js";

export async function getAllDealersService(user) {
    try {
        let whereClause = {};

        // Access control logic
        if (canAccessAll(user?.user?.role?.name)) {
            // No filter → return all dealers
            whereClause = {};
        } else if (isDealerAdmin(user?.user?.role?.name) || isSelfAccess(user?.user?.role?.name)) {
            // Return only the dealer user belongs to
            whereClause = { id: user?.user?.dealerId };
        }


        const dealers = await prisma.dealer.findMany({
            where: whereClause,
            include: {
                users: {
                    include: { role: true },
                },
                owners: {
                    include: { user: true },
                },
                packs: true,
            },
        });

        return dealers;
    } catch (error) {
        console.error("Error in DealerService.getAllDealers:", error);
        throw new Error("DATABASE_ERROR");
    }
}

