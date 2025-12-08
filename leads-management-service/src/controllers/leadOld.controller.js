import axios from "axios";
import prisma from "../lib/prisma.js";
import { nanoid } from "nanoid";
// import * as leadService from "../services/lead.service.js";

// Roles allowed to see/manage all leads
// const canAccessAll = (role) =>
//     ["SUPER_ADMIN", "ADMIN", "CALLING"].includes(role);

const canAccessAll = (role) => ["SUPER_ADMIN", "ADMIN"].includes(role);

const isDealerAdmin = (role) => role === "DEALER_ADMIN";

const isSelfAccess = (role) => ["CALLING", "DEALER_SALES"].includes(role);

const API_GATEWAY_URL = process.env.API_GATEWAY_URL
const USER_SERVICE_URL = process.env.USER_SERVICE_URL

// role helpers
const isInternal = (user) => user?.role?.roleType === "INTERNAL";
const isDealerUser = (user) => user?.role?.roleType === "DEALER";

// default status
const DEFAULT_STATUS_ID = "1Dhe1VRak9"

// Helper: format lead response
const formatLead = (lead) => ({
    id: lead.id,
    dealerId: lead.dealerId,
    assignedToId: lead.assignedToId,
    assignedToName: lead.assignedToName,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    alternatePhone: lead.alternatePhone,
    oldModel: lead.oldModel,
    location: lead.location,
    city: lead.city,
    leadForwardedTo: lead.leadForwardedTo,
    testDrive: lead.testDrive,
    // callBack: lead.callBack,
    finance: lead.finance,
    occupation: lead.occupation,
    budget: lead.budget,
    category: lead.category,
    source: lead.source,
    // status: lead.status ? lead.status.name : null,
    status: lead.status,
    lostReason: lead.lostReason,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
});


// ✅ Create lead
export const createLead = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const userId = req.user?.id; // who is performing creation
        const userName = req.user?.name || "System"; // fallback

        const {
            dealerId,
            assignedToId,
            assignedToName,
            name,
            email,
            phone,
            alternatePhone,
            oldModel,
            location,
            city,
            leadForwardedTo,
            testDrive,
            finance,
            occupation,
            budget,
            status, // status by name
            lostReason, // optional lost reason if Lost
            source,
            createdAt,
        } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        // Dealers can only create for their dealerId
        // const finalDealerId = canAccessAll(roleName) ? dealerId || null : userDealerId;

        let finalDealerId = dealerId;

        // SUPER_ADMIN, ADMIN → use provided dealerId
        if (canAccessAll(roleName)) {
            finalDealerId = dealerId || null;
        }
        // DEALER_ADMIN → force same dealer
        else if (isDealerAdmin(roleName)) {
            finalDealerId = userDealerId;
        }
        // CALLING, DEALER_SALES → force same dealer
        else if (isSelfAccess(roleName)) {
            finalDealerId = userDealerId;
        }

        // --- Resolve status by name (if provided) ---
        let statusId = null;
        if (status) {
            const foundStatus = await prisma.leadStatus.findUnique({ where: { name: status } });
            if (foundStatus) {
                statusId = foundStatus.id;
            }
        }
        if (!statusId) {
            statusId = DEFAULT_STATUS_ID;
        }

        // --- Resolve lost reason if status = Lost ---
        let lostReasonId = null;
        if (status === "Lost" && lostReason) {
            const foundReason = await prisma.leadLostReason.findFirst({
                where: { name: lostReason, statusId },
            });
            if (foundReason) lostReasonId = foundReason.id;
        }

        // Created At time
        let finalCreatedAt = undefined;

        if (createdAt) {
            const dt = new Date(createdAt);
            if (!isNaN(dt.getTime())) {
                finalCreatedAt = dt;
            }
        }

        // --- Create lead ---
        const lead = await prisma.lead.create({
            data: {
                id: nanoid(10),
                dealerId: finalDealerId,
                assignedToId,
                assignedToName,
                name,
                email,
                phone,
                alternatePhone,
                oldModel,
                location,
                city,
                leadForwardedTo,
                testDrive: testDrive === "Yes" || testDrive === true,
                finance: finance === "Yes" || finance === true,
                occupation,
                budget: budget ? parseInt(budget, 10) : null,
                statusId,
                lostReasonId,
                source: source || 'Manual',
                createdAt: finalCreatedAt,
            },
            include: { status: true, lostReason: true },
        });

        // --- Log activity ---
        const activity = await prisma.activity.create({
            data: {
                leadId: lead.id,
                performedById: userId,
                performedByName: userName,
                type: "LEAD_ADDED",
                description: `Lead created by ${userName}`,
                newStatus: lead.status?.name || "New",
                newAssignee: lead.assignedToName || null,
            },
        });

        res.status(201).json({
            success: true,
            message: "Lead created successfully",
            data: formatLead(lead),
            activity,
        });
    } catch (error) {
        console.error("Create lead error:", error);
        res.status(500).json({ success: false, message: "Failed to create lead" });
    }
};

// ✅ Get all leads
export const getLeads = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;

        // Extract filters from query
        const {
            status,
            category,
            assignedToId,
            dealerId,
            source,
            search,
            fromDate,
            toDate,
            filterType = "AND", // default AND
        } = req.query;

        // Base filter — restrict to dealer if needed
        // let baseFilter = canAccessAll(roleName)
        //     ? {}
        //     : { dealerId: userDealerId };

        let baseFilter = {};

        // 1️⃣ SUPER_ADMIN, ADMIN → access all
        if (canAccessAll(roleName)) {
            baseFilter = {};
        }
        // 2️⃣ DEALER_ADMIN → access all leads within same dealer
        else if (isDealerAdmin(roleName)) {
            baseFilter = { dealerId: userDealerId };
        }
        // 3️⃣ CALLING, DEALER_SALES → only own leads
        else if (isSelfAccess(roleName)) {
            baseFilter = { assignedToId: req.user.id };
        }


        // Build dynamic filters
        const filters = [];

        // Status filter (by name)
        if (status) {
            const statusObj = await prisma.leadStatus.findUnique({
                where: { name: status },
            });
            if (statusObj) filters.push({ statusId: statusObj.id });
        }

        // Category filter
        if (category) {
            filters.push({ category });
        }

        // Source filter
        if (source) {
            filters.push({ source });
        }

        // Owner filter
        if (assignedToId) {
            filters.push({ assignedToId });
        }

        // Dealer filter (optional if admin)
        if (dealerId) {
            filters.push({ dealerId });
        }

        // Date range filter
        if (fromDate && toDate) {
            const start = new Date(fromDate);
            const end = new Date(toDate);

            // Force both to local midnight boundaries
            start.setHours(0, 0, 0, 0);      // Start of the fromDate day
            end.setHours(23, 59, 59, 999);   // End of the toDate day

            filters.push({
                createdAt: {
                    gte: start,
                    lte: end,
                },
            });
        }


        // Search filter (name, email, phone)
        if (search) {
            filters.push({
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                    { phone: { contains: search, mode: "insensitive" } },
                ],
            });
        }

        // Combine filters using AND / OR
        const whereClause =
            filters.length > 0
                ? {
                    ...baseFilter,
                    [filterType === "OR" ? "OR" : "AND"]: filters,
                }
                : baseFilter;

        // Query leads
        const leads = await prisma.lead.findMany({
            where: whereClause,
            include: { status: true, lostReason: true },
            orderBy: { createdAt: "desc" },
        });

        res.json({
            success: true,
            count: leads.length,
            data: leads.map(formatLead),
        });
    } catch (error) {
        console.error("Get leads error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch leads" });
    }
};

// ✅ Get single lead
export const getLeadById = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;

        const { id } = req.params;

        // Build access filter
        let whereClause = { id };

        if (canAccessAll(roleName)) {
            whereClause = { id };
        } else if (isDealerAdmin(roleName)) {
            whereClause = { id, dealerId: userDealerId };
        } else if (isSelfAccess(roleName)) {
            whereClause = { id, assignedToId: req.user.id };
        }

        const lead = await prisma.lead.findFirst({
            // where: canAccessAll(roleName) ? { id } : { id, dealerId: userDealerId },
            where: whereClause,
            include: {
                status: true,
                lostReason: true,
            },
        });

        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found" });
        }

        res.json({
            success: true,
            message: "Lead fetched successfully",
            data: formatLead(lead),
        });
    } catch (error) {
        console.error("Get lead by ID error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch lead" });
    }
};

// ✅ Update lead
// export const updateLead = async (req, res) => {
//     try {
//         const roleName = req.user.role?.name;
//         const userDealerId = req.user.dealerId;
//         const userId = req.user?.id; // who is performing the update
//         const userName = req.user?.name || "system"; // who is performing the update

//         // console.log("user:", req.user)

//         const { id } = req.params;
//         const data = req.body;

//         // 1. Fetch existing lead
//         const existingLead = await prisma.lead.findFirst({
//             where: canAccessAll(roleName) ? { id } : { id, dealerId: userDealerId },
//             include: { status: true, lostReason: true },
//         });

//         if (!existingLead) {
//             return res
//                 .status(404)
//                 .json({ success: false, message: "Lead not found or not accessible" });
//         }

//         if (!canAccessAll(roleName)) {
//             delete data.dealerId; // restrict dealerId changes
//         }

//         const updateData = {
//             name: data.name,
//             email: data.email,
//             phone: data.phone,
//             dealerId: data.dealerId,
//             assignedToId: data.assignedToId,
//             assignedToName: data.assignedToName,
//             alternatePhone: data.alternatePhone,
//             leadForwardedTo: data.leadForwardedTo,
//             oldModel: data.oldModel,
//             location: data.location,
//             city: data.city,
//             occupation: data.occupation,
//             budget: data.budget ? parseInt(data.budget, 10) : null,
//             testDrive: data.testDrive === "Yes" || data.testDrive === true,
//             finance: data.finance === "Yes" || data.finance === true,
//         };

//         const activities = [];

//         // --- Handle Status ---
//         if (data.status) {
//             const status = await prisma.leadStatus.findUnique({
//                 where: { name: data.status },
//             });

//             if (status) {
//                 if (status.id !== existingLead.statusId) {
//                     activities.push({
//                         leadId: id,
//                         performedById: userId,
//                         performedByName: userName,
//                         type: "STATUS_UPDATE",
//                         description: `Status changed from '${existingLead.status?.name || "None"}' to '${status.name}'`,
//                         oldStatus: existingLead.status?.name || null,
//                         newStatus: status.name,
//                     });
//                 }

//                 updateData.statusId = status.id;

//                 // --- Handle Lost Reason ---
//                 if (status.name === "Lost" && data.lostReason) {
//                     const lostReason = await prisma.leadLostReason.findFirst({
//                         where: { name: data.lostReason, statusId: status.id },
//                     });

//                     if (lostReason) {
//                         if (lostReason.id !== existingLead.lostReasonId) {
//                             activities.push({
//                                 leadId: id,
//                                 performedById: userId,
//                                 performedByName: userName,
//                                 type: "STATUS_UPDATE",
//                                 description: `Lost reason changed from '${existingLead.lostReason?.name || "None"}' to '${lostReason.name}'`,
//                                 oldReason: existingLead.lostReason?.name || null,
//                                 newReason: lostReason.name,
//                             });
//                         }
//                         updateData.lostReasonId = lostReason.id;
//                     } else {
//                         updateData.lostReasonId = null;
//                     }
//                 } else {
//                     if (existingLead.lostReasonId) {
//                         activities.push({
//                             leadId: id,
//                             performedById: userId,
//                             performedByName: userName,
//                             type: "STATUS_UPDATE",
//                             description: `Lost reason cleared (was '${existingLead.lostReason?.name}')`,
//                             oldReason: existingLead.lostReason?.name || null,
//                             newReason: null,
//                         });
//                     }
//                     updateData.lostReasonId = null;
//                 }
//             }
//         }

//         // --- Handle Assignment ---
//         if (data.assignedToId && data.assignedToId !== existingLead.assignedToId) {
//             activities.push({
//                 leadId: id,
//                 performedById: userId,
//                 performedByName: userName,
//                 type: "ASSIGNMENT",
//                 description: `Lead reassigned from '${existingLead.assignedToName || "Unassigned"}' to '${data.assignedToName || "Unassigned"}'`,
//                 oldAssignee: existingLead.assignedToName || null,
//                 newAssignee: data.assignedToName || null,
//             });
//             updateData.assignedToId = data.assignedToId;
//             updateData.assignedToName = data.assignedToName;
//         }

//         // --- Handle Category ---
//         if (data.category) {
//             if (data.category !== existingLead.category) {
//                 activities.push({
//                     leadId: id,
//                     performedById: userId,
//                     performedByName: userName,
//                     type: "CATEGORY_UPDATE",
//                     description: `Category changed from '${existingLead.category || "None"}' to '${data.category}'`,
//                     oldCategory: existingLead.category || null,
//                     newCategory: data.category,
//                 });

//                 updateData.category = data.category;
//             }
//         }

//         // 2. Update lead
//         const updatedLead = await prisma.lead.update({
//             where: { id },
//             data: updateData,
//             include: { status: true, lostReason: true },
//         });

//         // 3. Save activities
//         if (activities.length > 0) {
//             await prisma.activity.createMany({ data: activities });
//         }

//         res.json({ success: true, data: formatLead(updatedLead), activities });
//     } catch (error) {
//         console.error("Update lead error:", error);
//         res.status(500).json({ success: false, message: "Failed to update lead" });
//     }
// };

// ✅ Update lead
export const updateLead = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const userId = req.user?.id;
        const userName = req.user?.name || "system";

        const { id } = req.params;
        const data = req.body;

        console.log("updateLead data:", data)

        // Build access filter
        let whereClause = { id };

        if (canAccessAll(roleName)) {
            whereClause = { id };
        } else if (isDealerAdmin(roleName)) {
            whereClause = { id, dealerId: userDealerId };
        } else if (isSelfAccess(roleName)) {
            whereClause = { id, assignedToId: req.user.id };
        }

        // 1️⃣ Fetch existing lead
        const existingLead = await prisma.lead.findFirst({
            where: whereClause,
            include: { status: true, lostReason: true },
        });

        if (!existingLead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found or not accessible",
            });
        }

        // Prevent non-admins from changing dealerId
        if (!canAccessAll(roleName)) {
            delete data.dealerId;
        }

        const updateData = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            dealerId: data.dealerId,
            assignedToId: data.assignedToId,
            assignedToName: data.assignedToName,
            alternatePhone: data.alternatePhone,
            leadForwardedTo: data.leadForwardedTo,
            oldModel: data.oldModel,
            location: data.location,
            city: data.city,
            occupation: data.occupation,
            budget: data.budget ? parseInt(data.budget, 10) : null,
            testDrive: data.testDrive === "Yes" || data.testDrive === true,
            finance: data.finance === "Yes" || data.finance === true,
        };

        const activities = [];

        // 🔥 METRIC CHECK VARIABLES
        let existingStatusName = existingLead.status?.name || null;
        let newStatusName = data.status || existingStatusName;

        let triggerDeliveredMetric = false;
        let triggerConvertedMetric = false;

        // 🔥 METRIC LOGIC — USE CASE 1
        if (data.assignedToId) {
            // console.log("If statement case 1-1")
            try {
                // console.log("If statement case 1-2")
                // Call user-management-service to fetch user
                const userResponse = await axios.get(
                    // `${API_GATEWAY_URL}/api/user/users/${data.assignedToId}`
                    `${USER_SERVICE_URL}/users/${data.assignedToId}`
                );

                // console.log("userResponse:", userResponse)

                const assignedUser = userResponse.data?.data;

                // console.log("assignedUser:", assignedUser)

                // Check roleType === "DEALER"
                if (assignedUser?.role?.roleType === "DEALER") {
                    console.log("CASE-1: Assigned user is DEALER — trigger Delivered metric");
                    triggerDeliveredMetric = true;
                } else {
                    console.log("CASE-1: Assigned user NOT DEALER — metric NOT triggered");
                }
            } catch (err) {
                // console.error("Failed to fetch assigned user role:", err.message);
                console.error("Failed to fetch assigned user role:", err);
            }
        }


        console.log("triggerDeliveredMetric:", triggerDeliveredMetric)

        // 🔥 METRIC CASE 2 — Using DB Status Order

        // 1️⃣ Fetch full status objects (old & new)
        // const existingStatus = await prisma.leadStatus.findUnique({
        //     where: { id: existingLead.status.id },
        //     select: { order: true, name: true }
        // });

        const existingStatus = existingLead.status

        console.log("existingStatus:", existingStatus)

        const newStatusRecord = await prisma.leadStatus.findUnique({
            where: { name: newStatusName },
        });

        console.log("newStatusRecord:", newStatusRecord)

        // 2️⃣ Validate and compare order
        if (
            // roleName === "DEALER" &&
            existingStatus?.order !== undefined &&
            newStatusRecord?.order !== undefined &&
            // existingLead.assignedToId == userDealerId &&
            // newStatusRecord.order > existingStatus.order &&
            newStatusRecord.order > 3 &&
            newStatusName != "Lost" &&
            newStatusName != "Not Reachable" &&
            // existingStatus.order < 4 &&
            userDealerId != null &&
            existingLead.dealerId == userDealerId
        ) {
            console.log(
                `CASE-2: Status progressed (${existingStatus.name} → ${newStatusRecord.name}) → Trigger Converted Metric`
            );
            triggerConvertedMetric = true;
        } else {
            console.log("CASE-2: Converted metric NOT triggered");
        }

        console.log("triggerConvertedMetric:", triggerConvertedMetric)

        // --- Status Handling ---
        if (data.status) {
            const status = await prisma.leadStatus.findUnique({
                where: { name: data.status },
            });

            if (status) {
                if (status.id !== existingLead.statusId) {
                    activities.push({
                        leadId: id,
                        performedById: userId,
                        performedByName: userName,
                        type: "STATUS_UPDATE",
                        description: `Status changed from '${existingLead.status?.name || "None"}' to '${status.name}'`,
                        oldStatus: existingLead.status?.name || null,
                        newStatus: status.name,
                    });
                }

                updateData.statusId = status.id;


                // Lost Reason
                if (status.name === "Lost" && data.lostReason) {
                    const lostReason = await prisma.leadLostReason.findFirst({
                        where: { name: data.lostReason, statusId: status.id },
                    });

                    if (lostReason) {
                        if (lostReason.id !== existingLead.lostReasonId) {
                            activities.push({
                                leadId: id,
                                performedById: userId,
                                performedByName: userName,
                                type: "STATUS_UPDATE",
                                description: `Lost reason changed from '${existingLead.lostReason?.name || "None"}' to '${lostReason.name}'`,
                                oldReason: existingLead.lostReason?.name || null,
                                newReason: lostReason.name,
                            });
                        }
                        updateData.lostReasonId = lostReason.id;
                    } else {
                        updateData.lostReasonId = null;
                    }
                } else {
                    if (existingLead.lostReasonId) {
                        activities.push({
                            leadId: id,
                            performedById: userId,
                            performedByName: userName,
                            type: "STATUS_UPDATE",
                            description: `Lost reason cleared (was '${existingLead.lostReason?.name}')`,
                            oldReason: existingLead.lostReason?.name || null,
                            newReason: null,
                        });
                    }
                    updateData.lostReasonId = null;
                }
            }
        }

        // --- Assignment ---
        if (data.assignedToId && data.assignedToId !== existingLead.assignedToId) {
            activities.push({
                leadId: id,
                performedById: userId,
                performedByName: userName,
                type: "ASSIGNMENT",
                description: `Lead reassigned from '${existingLead.assignedToName || "Unassigned"}' to '${data.assignedToName || "Unassigned"}'`,
                oldAssignee: existingLead.assignedToName || null,
                newAssignee: data.assignedToName || null,
            });

            updateData.assignedToId = data.assignedToId;
            updateData.assignedToName = data.assignedToName;
        }

        // --- Category ---
        if (data.category && data.category !== existingLead.category) {
            activities.push({
                leadId: id,
                performedById: userId,
                performedByName: userName,
                type: "CATEGORY_UPDATE",
                description: `Category changed from '${existingLead.category || "None"}' to '${data.category}'`,
                oldCategory: existingLead.category || null,
                newCategory: data.category,
            });

            updateData.category = data.category;
        }

        // 2️⃣ Update lead
        const updatedLead = await prisma.lead.update({
            where: { id },
            data: updateData,
            include: { status: true, lostReason: true },
        });

        // 3️⃣ Save activities
        if (activities.length > 0) {
            await prisma.activity.createMany({ data: activities });
        }

        // ⭐ FINAL METRIC UPDATES ⭐
        // if (triggerDeliveredMetric) {
        //     await prisma.dealerMetrics.updateMany({
        //         where: { dealerId: updatedLead.dealerId },
        //         data: { leadsDelivered: { increment: 1 } }
        //     });

        //     await prisma.userMetrics.updateMany({
        //         where: { userId },
        //         data: { leadsDelivered: { increment: 1 } }
        //     });
        // }

        // if (triggerInterestMetric) {
        //     await prisma.dealerMetrics.updateMany({
        //         where: { dealerId: updatedLead.dealerId },
        //         data: { leadsConverted: { increment: 1 } }
        //     });

        //     await prisma.userMetrics.updateMany({
        //         where: { userId },
        //         data: { leadsConverted: { increment: 1 } }
        //     });
        // }

        res.json({
            success: true,
            data: formatLead(updatedLead),
            activities,
        });
    } catch (error) {
        console.error("Update lead error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update lead",
        });
    }
};

// export const updateLead = async (req, res) => {
//     try {
//         const result = await leadService.updateLead({
//             leadId: req.params.id,
//             data: req.body,
//             user: req.user
//         });

//         return res.status(200).json({
//             success: true,
//             data: result.lead,
//             activities: result.activities
//         });

//     } catch (error) {
//         console.error("Update Lead Error:", error);
//         return res.status(500).json({ success: false, message: error.message });
//     }
// };


// ✅ Delete lead
export const deleteLead = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;

        const { id } = req.params;

        // Build access filter
        let whereClause = { id };

        if (canAccessAll(roleName)) {
            whereClause = { id };
        } else if (isDealerAdmin(roleName)) {
            whereClause = { id, dealerId: userDealerId };
        } else if (isSelfAccess(roleName)) {
            whereClause = { id, assignedToId: req.user.id };
        }

        const lead = await prisma.lead.findFirst({
            // where: canAccessAll(roleName) ? { id } : { id, dealerId: userDealerId },
            where: whereClause,
        });

        if (!lead) {
            return res.status(404).json({
                success: false,
                message: "Lead not found or not accessible",
            });
        }

        await prisma.lead.delete({
            where: { id },
        });

        res.json({
            success: true,
            message: "Lead deleted successfully",
        });
    } catch (error) {
        console.error("Delete lead error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete lead",
        });
    }
};

// Bulk upload leads
export const bulkUploadLeads = async (req, res) => {
    try {
        const { data } = req.body;

        // console.log("data from request body:", data);

        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ success: false, message: "No data provided" });
        }

        // ✅ Required fields (dealerId is optional)
        const REQUIRED_FIELDS = ["name"]; // keep minimal required
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const missing = REQUIRED_FIELDS.filter((f) => !(f in row) || !row[f]);
            if (missing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Row ${i + 1} missing fields: ${missing.join(", ")}`
                });
            }
        }

        // ✅ Assign nanoid + ensure optional dealerId
        const leadsToInsert = data.map((lead) => ({
            id: nanoid(10),
            name: lead.name,
            email: lead.email || null,
            phone: lead.phone ? String(lead.phone) : null,
            dealerId: lead.dealerId || null, // optional
            // statusId: lead.statusId || "New", // fallback if you want a default
            statusId: lead.statusId || DEFAULT_STATUS_ID,
        }));

        // ✅ Bulk insert
        const inserted = await prisma.lead.createMany({
            data: leadsToInsert,
            skipDuplicates: true,
        });

        return res.json({ success: true, insertedCount: inserted.count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message || "Server Error" });
    }
};

// ✅ Get distinct lead sources
export const getLeadSources = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;

        // 1️⃣ Define access condition based on role
        const whereCondition = {
            source: { not: null },
            // ...(canAccessAll(roleName) ? {} : { dealerId: userDealerId }),
            ...(canAccessAll(roleName)
                ? {}
                : isDealerAdmin(roleName)
                    ? { dealerId: userDealerId }
                    : isSelfAccess(roleName)
                        ? { assignedToId: req.user.id }
                        : {}),
        };

        // 2️⃣ Fetch distinct sources
        const sources = await prisma.lead.findMany({
            where: whereCondition,
            distinct: ["source"],
            select: {
                source: true,
            },
        });

        // 3️⃣ Extract only string values
        const formattedSources = sources.map((s) => s.source);

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

