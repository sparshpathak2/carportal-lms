import prisma from "../lib/prisma.js";
import { nanoid } from "nanoid";

// Roles allowed to see/manage all leads
const canAccessAll = (role) =>
    ["SUPER_ADMIN", "ADMIN", "CALLING"].includes(role);

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

const DEFAULT_STATUS_ID = "Xa9fK3D2Lp"

// ✅ Create lead
// export const createLead = async (req, res) => {
//     try {
//         const roleName = req.user.role?.name;
//         const userDealerId = req.user.dealerId;

//         const {
//             dealerId,
//             asssignedToId,
//             asssignedToName,
//             name,
//             email,
//             phone,
//             alternatePhone,
//             oldModel,
//             location,
//             city,
//             leadForwardedTo,
//             testDrive,
//             finance,
//             occupation,
//             budget,
//             statusId,
//         } = req.body;

//         if (!name) {
//             return res.status(400).json({ success: false, message: "Name is required" });
//         }

//         // Dealers can only create for their dealerId
//         const finalDealerId = canAccessAll(roleName) ? dealerId || null : userDealerId;

//         const lead = await prisma.lead.create({
//             data: {
//                 id: nanoid(10),
//                 dealerId: finalDealerId,
//                 asssignedToId,
//                 asssignedToName,
//                 name,
//                 email,
//                 phone,
//                 alternatePhone,
//                 oldModel,
//                 location,
//                 city,
//                 leadForwardedTo,
//                 testDrive,
//                 callBack,
//                 finance,
//                 occupation,
//                 budget,
//                 statusId: statusId || process.env.DEFAULT_STATUS_ID,
//             },
//             include: { status: true },
//         });

//         res.status(201).json({
//             success: true,
//             message: "Lead created successfully",
//             data: formatLead(lead),
//         });
//     } catch (error) {
//         console.error("Create lead error:", error);
//         res.status(500).json({ success: false, message: "Failed to create lead" });
//     }
// };

// ✅ Create lead
export const createLead = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const userId = req.user?.id; // who is performing creation
        const userName = req.user?.name || "system"; // fallback

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
        } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        // Dealers can only create for their dealerId
        const finalDealerId = canAccessAll(roleName) ? dealerId || null : userDealerId;

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
                source,
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

        const leads = await prisma.lead.findMany({
            where: canAccessAll(roleName)
                ? {}
                : { dealerId: userDealerId },
            include: { status: true },
        });

        res.json({ success: true, data: leads.map(formatLead) });
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

        const lead = await prisma.lead.findFirst({
            where: canAccessAll(roleName) ? { id } : { id, dealerId: userDealerId },
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
        res.json({ success: true, message: "Lead fetched successfully", data: formatLead(lead) });
    } catch (error) {
        console.error("Get lead by ID error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch lead" });
    }
};

// ✅ Update lead
export const updateLead = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const userId = req.user?.id; // who is performing the update
        const userName = req.user?.name || "system"; // who is performing the update

        // console.log("user:", req.user)

        const { id } = req.params;
        const data = req.body;

        // 1. Fetch existing lead
        const existingLead = await prisma.lead.findFirst({
            where: canAccessAll(roleName) ? { id } : { id, dealerId: userDealerId },
            include: { status: true, lostReason: true },
        });

        if (!existingLead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found or not accessible" });
        }

        if (!canAccessAll(roleName)) {
            delete data.dealerId; // restrict dealerId changes
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

        // --- Handle Status ---
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

                // --- Handle Lost Reason ---
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

        // --- Handle Assignment ---
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

        // 2. Update lead
        const updatedLead = await prisma.lead.update({
            where: { id },
            data: updateData,
            include: { status: true, lostReason: true },
        });

        // 3. Save activities
        if (activities.length > 0) {
            await prisma.activity.createMany({ data: activities });
        }

        res.json({ success: true, data: formatLead(updatedLead), activities });
    } catch (error) {
        console.error("Update lead error:", error);
        res.status(500).json({ success: false, message: "Failed to update lead" });
    }
};

// ✅ Delete lead
export const deleteLead = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;

        const { id } = req.params;

        const lead = await prisma.lead.findFirst({
            where: canAccessAll(roleName) ? { id } : { id, dealerId: userDealerId },
        });

        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found or not accessible" });
        }

        await prisma.lead.delete({ where: { id } });

        res.json({ success: true, message: "Lead deleted successfully" });
    } catch (error) {
        console.error("Delete lead error:", error);
        res.status(500).json({ success: false, message: "Failed to delete lead" });
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
