import prisma from "../lib/prisma.js";
import { canAccessAll, isDealerAdmin, isSelfAccess } from "../utils/roleAccess.utils.js";

// ✅ Get all lead statuses
// export const getLeadSources = async (req, res) => {
//     try {
//         const roleName = req.user.role?.name;
//         const userDealerId = req.user.dealerId;

//         // 1️⃣ Define access condition based on role
//         const whereCondition = {
//             source: { not: null },
//             // ...(canAccessAll(roleName) ? {} : { dealerId: userDealerId }),
//             ...(canAccessAll(roleName)
//                 ? {}
//                 : isDealerAdmin(roleName)
//                     ? { dealerId: userDealerId }
//                     : isSelfAccess(roleName)
//                         ? { assignedToId: req.user.id }
//                         : {}),
//         };

//         // 2️⃣ Fetch distinct sources
//         const sources = await prisma.lead.findMany({
//             where: whereCondition,
//             distinct: ["source"],
//             select: {
//                 source: true,
//             },
//         });

//         // 3️⃣ Extract only string values
//         const formattedSources = sources.map((s) => s.source);

//         res.json({
//             success: true,
//             message: "Lead sources fetched successfully",
//             data: formattedSources,
//         });
//     } catch (error) {
//         console.error("Error fetching sources:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch lead sources",
//         });
//     }
// };


export const getLeadSources = async (req, res) => {
    try {
        const sources = await prisma.lead.findMany({
            where: {
                source: {
                    not: null,
                },
            },
            distinct: ["source"],
            select: {
                source: true,
            },
        });

        const formattedSources = sources
            .map((s) => s.source)
            .filter(Boolean);

        res.json({
            success: true,
            message: "Lead sources fetched successfully",
            data: formattedSources,
        });
    } catch (error) {
        console.error("Error fetching sources:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch lead sources",
        });
    }
};



// export const getLeadSources = async (req, res) => {
//     try {
//         const userId = req.user.id;

//         const sources = await prisma.lead.findMany({
//             where: {
//                 source: { not: null },
//                 leadAssignments: {
//                     some: {
//                         assignedToId: userId,
//                         isActive: true, // optional but recommended
//                     },
//                 },
//             },
//             distinct: ["source"],
//             select: {
//                 source: true,
//             },
//         });

//         const formattedSources = sources
//             .map((s) => s.source)
//             .filter(Boolean);

//         res.json({
//             success: true,
//             message: "Lead sources fetched successfully",
//             data: formattedSources,
//         });
//     } catch (error) {
//         console.error("Error fetching sources:", error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to fetch lead sources",
//         });
//     }
// };

