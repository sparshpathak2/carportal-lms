import { nanoid } from "nanoid";
import prisma from "../lib/prisma.js";
import CustomerService from "./customer.service.js";
import axios from "axios";
import { canAccessAll, isDealerAdmin, isSelfAccess } from "../utils/roleAccess.utils.js";

const DEFAULT_STATUS_ID = "1Dhe1VRak9";
const USER_SERVICE_URL = process.env.USER_SERVICE_URL;

// Fetch user info from user-service
async function fetchUser(userId) {
    try {
        const res = await axios.get(`${USER_SERVICE_URL}/users/${userId}`);
        return res.data?.data || null;
    } catch (e) {
        console.error("Error fetching user:", e.message);
        return null;
    }
}

const formatLead = (lead) => ({
    id: lead.id,
    customer: {
        id: lead.customer?.id,
        name: lead.customer?.name,
        email: lead.customer?.email,
        phone: lead.customer?.phone,
        alternatePhone: lead.customer?.alternatePhone,
        city: lead.customer?.city,
    },
    oldModel: lead.oldModel,
    testDrive: lead.testDrive,
    finance: lead.finance,
    occupation: lead.occupation,
    budget: lead.budget,
    category: lead.category,
    source: lead.source,
    status: lead.status,
    lostReason: lead.lostReason,
    leadAssignments: lead.leadAssignments,
    analytics: lead.analytics,
    adId: lead.adId,
    adsetId: lead.adsetId,
    campaignId: lead.campaignId,
    adName: lead.adName,
    adsetName: lead.adsetName,
    campaignName: lead.campaignName,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    leadActivity: lead.leadActivity
});

export const handleLeadActivity = async (activities) => {
    if (!activities || activities.length === 0) return;

    await prisma.leadActivity.createMany({
        data: activities
    });
};

async function getActiveAssignment(leadId) {
    return prisma.leadAssignment.findFirst({
        where: { leadId, isActive: true },
        include: {
            status: true,
        },
    });
}

// export const handleLeadDataUpdate = async ({
//     data,
//     existingLead,
//     userId,
//     userName,
//     roleName
// }) => {
//     const updateData = {};
//     const activities = [];

//     const leadId = existingLead.id;

//     // Helper: Push activity with correct old/new field mapping
//     const pushActivity = ({ type, field, oldVal, newVal }) => {
//         let mapped = {};

//         switch (type) {
//             case "CATEGORY_UPDATE":
//                 mapped.oldCategory = oldVal;
//                 mapped.newCategory = newVal;
//                 break;
//             case "STATUS_UPDATE":
//                 mapped.oldStatus = oldVal;
//                 mapped.newStatus = newVal;
//                 break;
//             case "LOST_REASON_UPDATE":
//                 mapped.oldReason = oldVal;
//                 mapped.newReason = newVal;
//                 break;
//             case "ASSIGNMENT":
//                 mapped.oldAssignee = oldVal;
//                 mapped.newAssignee = newVal;
//                 break;
//         }

//         activities.push({
//             leadId,
//             performedById: userId,
//             performedByName: userName,
//             type,
//             description: `${field} changed from '${oldVal ?? "None"}' to '${newVal ?? "None"}'`,
//             ...mapped
//         });
//     };

//     // Helper for simple change detection
//     const detectChange = (field, newVal, type) => {
//         const oldVal = existingLead[field];

//         if (newVal !== undefined && newVal !== oldVal) {
//             pushActivity({ type, field, oldVal, newVal });
//             updateData[field] = newVal;
//         }
//     };


//     // ---------------------------------------------------------
//     // CATEGORY + STATUS (NEW LOGIC: Assignment > Lead)
//     // ---------------------------------------------------------
//     const activeAssignment = await getActiveAssignment(existingLead.id);

//     // -------------------------------------
//     // CATEGORY
//     // -------------------------------------
//     // if (data.category && data.category !== existingLead.category) {
//     //     pushActivity({
//     //         type: "CATEGORY_UPDATE",
//     //         field: "category",
//     //         oldVal: existingLead.category,
//     //         newVal: data.category
//     //     });
//     //     updateData.category = data.category;
//     // }

//     // -------------------------------------
//     // UPDATE CATEGORY
//     // -------------------------------------
//     if (data.category && data.category !== (activeAssignment?.category || existingLead.category)) {
//         pushActivity({
//             type: "CATEGORY_UPDATE",
//             field: "category",
//             oldVal: activeAssignment ? activeAssignment.category : existingLead.category,
//             newVal: data.category
//         });

//         // if (activeAssignment) {
//         //     updateData.leadAssignment = { category: data.category };
//         // } else {
//         //     updateData.category = data.category;
//         // }

//         if (activeAssignment) {
//             updateData.leadAssignments = {
//                 updateMany: {
//                     where: { isActive: true },
//                     data: { category: data.category }
//                 }
//             };
//         } else {
//             updateData.category = data.category;
//         }

//     }

//     // -------------------------------------
//     // UPDATE STATUS
//     // -------------------------------------
//     if (data.status) {
//         const statusObj = await prisma.leadStatus.findUnique({
//             where: { name: data.status }
//         });

//         const oldStatusName = activeAssignment
//             ? activeAssignment.status?.name
//             : existingLead.status?.name;

//         if (statusObj && statusObj.name !== oldStatusName) {
//             pushActivity({
//                 type: "STATUS_UPDATE",
//                 field: "status",
//                 oldVal: oldStatusName,
//                 newVal: statusObj.name
//             });

//             // if (activeAssignment) {
//             //     updateData.leadAssignment = {
//             //         ...(updateData.leadAssignment || {}),
//             //         statusId: statusObj.id
//             //     };
//             // } else {
//             //     updateData.statusId = statusObj.id;
//             // }

//             if (activeAssignment) {
//                 updateData.leadAssignments = {
//                     updateMany: {
//                         where: { isActive: true },
//                         data: { statusId: statusObj.id }
//                     }
//                 };
//             } else {
//                 updateData.statusId = statusObj.id;
//             }


//             // -----------------------
//             // LOST REASON
//             // -----------------------
//             if (statusObj.name === "Lost" && data.lostReason) {
//                 const lost = await prisma.leadLostReason.findFirst({
//                     where: { name: data.lostReason, statusId: statusObj.id }
//                 });

//                 pushActivity({
//                     type: "LOST_REASON_UPDATE",
//                     field: "lostReason",
//                     oldVal: activeAssignment
//                         ? activeAssignment.status?.lostReason?.name
//                         : existingLead.lostReason?.name,
//                     newVal: data.lostReason
//                 });

//                 // if (activeAssignment) {
//                 //     updateData.leadAssignment = {
//                 //         ...(updateData.leadAssignment || {}),
//                 //         lostReasonId: lost?.id || null,
//                 //     };
//                 // } else {
//                 //     updateData.lostReasonId = lost?.id || null;
//                 // }

//                 if (activeAssignment) {
//                     updateData.leadAssignments = {
//                         updateMany: {
//                             where: { isActive: true },
//                             data: { lostReasonId: lost?.id || null }
//                         }
//                     };
//                 } else {
//                     updateData.lostReasonId = lost?.id || null;
//                 }

//             } else {
//                 // RESET lostReason if not Lost
//                 if (activeAssignment) {
//                     updateData.leadAssignments = {
//                         updateMany: {
//                             where: { isActive: true },
//                             data: { lostReasonId: null }
//                         }
//                     };
//                 } else {
//                     updateData.lostReasonId = null;
//                 }


//             }
//         }
//     }

//     // -------------------------------------
//     // BOOLEAN FIELDS (Test Drive, Finance)
//     // -------------------------------------
//     const testDriveVal = data.testDrive === true || data.testDrive === "Yes";
//     detectChange("testDrive", testDriveVal, "TESTDRIVE_UPDATE");

//     const financeVal = data.finance === true || data.finance === "Yes";
//     detectChange("finance", financeVal, "FINANCE_UPDATE");

//     // -------------------------------------
//     // BUDGET
//     // -------------------------------------
//     if (data.budget) {
//         const newBudget = parseInt(data.budget);
//         detectChange("budget", newBudget, "BUDGET_UPDATE");
//     }

//     // -------------------------------------
//     // OCCUPATION / SOURCE / MODEL
//     // -------------------------------------
//     detectChange("occupation", data.occupation, "OCCUPATION_UPDATE");
//     detectChange("source", data.source, "SOURCE_UPDATE");
//     detectChange("oldModel", data.oldModel, "MODEL_UPDATE");

//     // -------------------------------------
//     // FB / Google Ads Tracking IDs
//     // -------------------------------------
//     const adFields = [
//         "adId",
//         "adsetId",
//         "campaignId",
//         "adName",
//         "adsetName",
//         "campaignName"
//     ];

//     adFields.forEach(field => {
//         if (data[field] !== undefined && data[field] !== existingLead[field]) {
//             pushActivity({
//                 type: "AD_FIELD_UPDATE",
//                 field,
//                 oldVal: existingLead[field],
//                 newVal: data[field]
//             });
//             updateData[field] = data[field];
//         }
//     });

//     return { updateData, activities };
// };

// export const handleLeadDataUpdate = async ({
//     data,
//     existingLead,
//     userId,
//     userName,
//     roleName
// }) => {
//     const updateData = {};
//     const activities = [];
//     const leadId = existingLead.id;

//     // ============================================================
//     // HELPERS
//     // ============================================================

//     const pushActivity = ({ type, field, oldVal, newVal }) => {
//         const mapped = {};

//         switch (type) {
//             case "CATEGORY_UPDATE":
//                 mapped.oldCategory = oldVal;
//                 mapped.newCategory = newVal;
//                 break;
//             case "STATUS_UPDATE":
//                 mapped.oldStatus = oldVal;
//                 mapped.newStatus = newVal;
//                 break;
//             case "LOST_REASON_UPDATE":
//                 mapped.oldReason = oldVal;
//                 mapped.newReason = newVal;
//                 break;
//             case "ASSIGNMENT":
//                 mapped.oldAssignee = oldVal;
//                 mapped.newAssignee = newVal;
//                 break;
//         }

//         activities.push({
//             leadId,
//             performedById: userId,
//             performedByName: userName,
//             type,
//             description: `${field} changed from '${oldVal ?? "None"}' to '${newVal ?? "None"}'`,
//             ...mapped
//         });
//     };

//     const detectChange = (field, newVal, type) => {
//         const oldVal = existingLead[field];
//         if (newVal !== undefined && newVal !== oldVal) {
//             pushActivity({ type, field, oldVal, newVal });
//             updateData[field] = newVal;
//         }
//     };

//     // merge all nested assignment updates
//     const pushToAssignmentUpdate = (patch) => {
//         if (!updateData.leadAssignments) {
//             updateData.leadAssignments = {
//                 updateMany: {
//                     where: { isActive: true },
//                     data: {}
//                 }
//             };
//         }

//         Object.assign(updateData.leadAssignments.updateMany.data, patch);
//     };

//     // ============================================================
//     // ASSIGNMENT FETCH
//     // ============================================================
//     const activeAssignment = await getActiveAssignment(existingLead.id);

//     const currentCategory = activeAssignment?.category ?? existingLead.category;
//     const currentStatusName = activeAssignment?.status?.name ?? existingLead.status?.name;
//     const currentLostReason = activeAssignment?.status?.lostReason?.name ?? existingLead.lostReason?.name;

//     // ============================================================
//     // CATEGORY UPDATE
//     // ============================================================
//     if (data.category && data.category !== currentCategory) {
//         pushActivity({
//             type: "CATEGORY_UPDATE",
//             field: "category",
//             oldVal: currentCategory,
//             newVal: data.category
//         });

//         if (activeAssignment) {
//             pushToAssignmentUpdate({ category: data.category });
//         } else {
//             updateData.category = data.category;
//         }
//     }

//     // ============================================================
//     // STATUS UPDATE
//     // ============================================================
//     if (data.status) {
//         const statusObj = await prisma.leadStatus.findUnique({
//             where: { name: data.status }
//         });

//         if (!statusObj) {
//             console.warn("Invalid status name:", data.status);
//         } else if (statusObj.name !== currentStatusName) {
//             pushActivity({
//                 type: "STATUS_UPDATE",
//                 field: "status",
//                 oldVal: currentStatusName,
//                 newVal: statusObj.name
//             });

//             if (activeAssignment) {
//                 pushToAssignmentUpdate({ statusId: statusObj.id });
//             } else {
//                 updateData.statusId = statusObj.id;
//             }

//             // ---------------------------------------------------
//             // LOST REASON HANDLING
//             // ---------------------------------------------------

//             // 1. If status is Lost -> assign reason
//             if (statusObj.name === "Lost" && data.lostReason) {
//                 const lostObj = await prisma.leadLostReason.findFirst({
//                     where: { name: data.lostReason, statusId: statusObj.id }
//                 });

//                 pushActivity({
//                     type: "STATUS_UPDATE",
//                     field: "lostReason",
//                     oldVal: currentLostReason,
//                     newVal: data.lostReason
//                 });

//                 const lostId = lostObj?.id ?? null;

//                 if (activeAssignment) {
//                     pushToAssignmentUpdate({ lostReasonId: lostId });
//                 } else {
//                     updateData.lostReasonId = lostId;
//                 }

//             } else {
//                 // 2. Any other status → reset lost reason
//                 pushActivity({
//                     type: "STATUS_UPDATE",
//                     field: "lostReason",
//                     oldVal: currentLostReason,
//                     newVal: null
//                 });

//                 if (activeAssignment) {
//                     pushToAssignmentUpdate({ lostReasonId: null });
//                 } else {
//                     updateData.lostReasonId = null;
//                 }
//             }
//         }
//     }

//     // ============================================================
//     // BOOLEAN FIELDS
//     // ============================================================
//     const testDriveVal = data.testDrive === true || data.testDrive === "Yes";
//     detectChange("testDrive", testDriveVal, "TESTDRIVE_UPDATE");

//     const financeVal = data.finance === true || data.finance === "Yes";
//     detectChange("finance", financeVal, "FINANCE_UPDATE");

//     // ============================================================
//     // BUDGET
//     // ============================================================
//     if (data.budget) {
//         detectChange("budget", parseInt(data.budget), "BUDGET_UPDATE");
//     }

//     // ============================================================
//     // SIMPLE FIELDS
//     // ============================================================
//     detectChange("occupation", data.occupation, "OCCUPATION_UPDATE");
//     detectChange("source", data.source, "SOURCE_UPDATE");
//     detectChange("oldModel", data.oldModel, "MODEL_UPDATE");

//     // ============================================================
//     // AD FIELDS
//     // ============================================================
//     [
//         "adId",
//         "adsetId",
//         "campaignId",
//         "adName",
//         "adsetName",
//         "campaignName"
//     ].forEach((field) => {
//         if (data[field] !== undefined && data[field] !== existingLead[field]) {
//             pushActivity({
//                 type: "AD_FIELD_UPDATE",
//                 field,
//                 oldVal: existingLead[field],
//                 newVal: data[field]
//             });
//             updateData[field] = data[field];
//         }
//     });

//     return { updateData, activities };
// };

// export const handleLeadAssignment = async ({
//     existingLead,
//     data,
//     userId,
//     userName
// }) => {

//     if (!data.assignedToId) return null;

//     // FIX HERE 👇
//     const currentAssignment = existingLead.leadAssignments?.find(a => a.isActive) || null;

//     if (currentAssignment && currentAssignment.assignedToId === data.assignedToId) {
//         return null;
//     }

//     const dealerId =
//         data.dealerId ||
//         currentAssignment?.dealerId ||
//         existingLead.customer?.dealerId ||
//         "";

//     if (!dealerId) {
//         throw new Error("dealerId is required for LeadDealerAssignment");
//     }

//     // Deactivate old assignment
//     await prisma.leadAssignment.updateMany({
//         where: { leadId: existingLead.id, isActive: true },
//         data: { isActive: false }
//     });

//     const hadExistingAssignment = currentAssignment !== null;


//     // ----------------------------------------------------
//     // 👇 NEW: Fetch assignedToName & assignedByName
//     // ----------------------------------------------------
//     let assignedToName = "";
//     let assignedByName = "";

//     try {
//         const assignedToUser = await fetchUser(data.assignedToId);
//         assignedToName = assignedToUser?.name || "";
//     } catch (err) {
//         console.error("Failed to fetch assignedToName", err);
//     }

//     try {
//         const assignedByUser = await fetchUser(userId);
//         assignedByName = assignedByUser?.name || "";
//     } catch (err) {
//         // Fallback to name passed from client session
//         assignedByName = userName;
//     }

//     const newAssignment = await prisma.leadAssignment.create({
//         data: {
//             leadId: existingLead.id,
//             dealerId,
//             assignedToId: data.assignedToId,
//             assignedById: userId,
//             assignedToName: assignedToName,
//             assignedByName: assignedByName,
//             isActive: true,
//         }
//     });

//     // FIX — now this ONLY runs on leads with ZERO previous assignments
//     if (!hadExistingAssignment) {
//         await prisma.comment.updateMany({
//             where: {
//                 leadId: existingLead.id,
//                 leadAssignmentId: null,   // SUPER IMPORTANT!
//             },
//             data: { leadAssignmentId: newAssignment.id }
//         });
//     }

//     const assignmentActivity = {
//         leadId: existingLead.id,
//         type: "ASSIGNMENT",
//         performedById: userId,
//         performedByName: userName,
//         leadAssignmentId: newAssignment.id,
//         description: `Lead forwarded to dealer user ${assignedToName}`,
//         oldAssignee: currentAssignment?.assignedToId ?? null,
//         newAssignee: data.assignedToId
//     };

//     return { newAssignment, assignmentActivity };
// };

// export const handleLeadAssignment = async ({
//     existingLead,
//     data,
//     userId,
//     userName
// }) => {

//     if (!data.assignedToId) return null;

//     // Active assignment (if any)
//     const currentAssignment =
//         existingLead.leadAssignments?.find(a => a.isActive) || null;

//     // No change → exit
//     if (currentAssignment && currentAssignment.assignedToId === data.assignedToId) {
//         return null;
//     }

//     const dealerId =
//         data.dealerId ||
//         currentAssignment?.dealerId ||
//         existingLead.customer?.dealerId ||
//         "";

//     if (!dealerId) {
//         throw new Error("dealerId is required for LeadAssignment");
//     }

//     // ----------------------------------------
//     // Detect FIRST assignment ever
//     // ----------------------------------------
//     const hadAnyAssignment =
//         existingLead.leadAssignments &&
//         existingLead.leadAssignments.length > 0;

//     // ----------------------------------------
//     // Deactivate existing active assignments
//     // ----------------------------------------
//     await prisma.leadAssignment.updateMany({
//         where: {
//             leadId: existingLead.id,
//             isActive: true
//         },
//         data: { isActive: false }
//     });

//     // ----------------------------------------
//     // Fetch names
//     // ----------------------------------------
//     let assignedToName = "";
//     let assignedByName = userName;

//     try {
//         const assignedToUser = await fetchUser(data.assignedToId);
//         assignedToName = assignedToUser?.name || "";
//     } catch { }

//     try {
//         const assignedByUser = await fetchUser(userId);
//         assignedByName = assignedByUser?.name || assignedByName;
//     } catch { }

//     // ----------------------------------------
//     // ✅ CREATE assignment WITH DEFAULTS
//     // ----------------------------------------
//     const newAssignment = await prisma.leadAssignment.create({
//         data: {
//             leadId: existingLead.id,
//             dealerId,
//             assignedToId: data.assignedToId,
//             assignedToName,
//             assignedById: userId,
//             assignedByName,
//             isActive: true,

//             // 🔥 DEFAULTS ONLY FOR FIRST ASSIGNMENT
//             statusId: hadAnyAssignment ? undefined : DEFAULT_STATUS_ID,
//             category: hadAnyAssignment ? undefined : DEFAULT_CATEGORY,
//             status: hadAnyAssignment ? undefined : DEFAULT_STATUS,
//         }
//     });

//     // ----------------------------------------
//     // Move legacy comments ONLY for first assignment
//     // ----------------------------------------
//     if (!hadAnyAssignment) {
//         await prisma.comment.updateMany({
//             where: {
//                 leadId: existingLead.id,
//                 leadAssignmentId: null
//             },
//             data: { leadAssignmentId: newAssignment.id }
//         });
//     }

//     // ----------------------------------------
//     // Activity
//     // ----------------------------------------
//     const assignmentActivity = {
//         leadId: existingLead.id,
//         type: "ASSIGNMENT",
//         performedById: userId,
//         performedByName: userName,
//         leadAssignmentId: newAssignment.id,
//         description: `Lead forwarded to dealer user ${assignedToName}`,
//         oldAssignee: currentAssignment?.assignedToId ?? null,
//         newAssignee: data.assignedToId
//     };

//     return { newAssignment, assignmentActivity };
// };

export const handleLeadDataUpdate = async ({
    data,
    existingLead,
    userId,
    userName,
    roleName
}) => {
    const updateData = {};
    const activities = [];
    const leadId = existingLead.id;

    // ============================================================
    // HELPERS
    // ============================================================

    const pushActivity = ({ type, field, oldVal, newVal }) => {
        // ❗ Safety guard (never log None → None)
        if (oldVal === newVal) return;

        const mapped = {};

        switch (type) {
            case "CATEGORY_UPDATE":
                mapped.oldCategory = oldVal;
                mapped.newCategory = newVal;
                break;
            case "STATUS_UPDATE":
                mapped.oldStatus = oldVal;
                mapped.newStatus = newVal;
                break;
            case "LOST_REASON_UPDATE":
                mapped.oldReason = oldVal;
                mapped.newReason = newVal;
                break;
            case "ASSIGNMENT":
                mapped.oldAssignee = oldVal;
                mapped.newAssignee = newVal;
                break;
        }

        activities.push({
            leadId,
            performedById: userId,
            performedByName: userName,
            type,
            description: `${field} changed from '${oldVal ?? "None"}' to '${newVal ?? "None"}'`,
            ...mapped
        });
    };

    const detectChange = (field, newVal, type) => {
        const oldVal = existingLead[field];
        if (newVal !== undefined && newVal !== oldVal) {
            pushActivity({ type, field, oldVal, newVal });
            updateData[field] = newVal;
        }
    };

    // Merge assignment updates
    const pushToAssignmentUpdate = (patch) => {
        if (!updateData.leadAssignments) {
            updateData.leadAssignments = {
                updateMany: {
                    where: { isActive: true },
                    data: {}
                }
            };
        }

        Object.assign(updateData.leadAssignments.updateMany.data, patch);
    };

    // ============================================================
    // ASSIGNMENT FETCH
    // ============================================================
    const activeAssignment = await getActiveAssignment(existingLead.id);

    const currentCategory =
        activeAssignment?.category ?? existingLead.category;

    const currentStatusName =
        activeAssignment?.status?.name ?? existingLead.status?.name;

    const currentLostReason =
        activeAssignment?.lostReason?.name ??
        existingLead.lostReason?.name ??
        null;

    // ============================================================
    // CATEGORY UPDATE
    // ============================================================
    if (data.category && data.category !== currentCategory) {
        pushActivity({
            type: "CATEGORY_UPDATE",
            field: "category",
            oldVal: currentCategory,
            newVal: data.category
        });

        if (activeAssignment) {
            pushToAssignmentUpdate({ category: data.category });
        } else {
            updateData.category = data.category;
        }
    }

    // ============================================================
    // STATUS UPDATE
    // ============================================================
    if (data.status) {
        const statusObj = await prisma.leadStatus.findUnique({
            where: { name: data.status }
        });

        if (!statusObj) {
            console.warn("Invalid status name:", data.status);
        }

        else if (statusObj.name !== currentStatusName) {
            // -------- STATUS CHANGE --------
            pushActivity({
                type: "STATUS_UPDATE",
                field: "status",
                oldVal: currentStatusName,
                newVal: statusObj.name
            });

            if (activeAssignment) {
                pushToAssignmentUpdate({ statusId: statusObj.id });
            } else {
                updateData.statusId = statusObj.id;
            }

            // ====================================================
            // LOST REASON HANDLING (FIXED)
            // ====================================================

            // Case 1: Status = Lost → set reason (only if provided & changed)
            if (statusObj.name === "Lost") {
                if (data.lostReason && data.lostReason !== currentLostReason) {
                    const lostObj = await prisma.leadLostReason.findFirst({
                        where: {
                            name: data.lostReason,
                            statusId: statusObj.id
                        }
                    });

                    pushActivity({
                        type: "LOST_REASON_UPDATE",
                        field: "lostReason",
                        oldVal: currentLostReason,
                        newVal: data.lostReason
                    });

                    const lostId = lostObj?.id ?? null;

                    if (activeAssignment) {
                        pushToAssignmentUpdate({ lostReasonId: lostId });
                    } else {
                        updateData.lostReasonId = lostId;
                    }
                }
            }

            // Case 2: Status ≠ Lost → clear reason ONLY if it existed
            else if (currentLostReason !== null) {
                pushActivity({
                    type: "LOST_REASON_UPDATE",
                    field: "lostReason",
                    oldVal: currentLostReason,
                    newVal: null
                });

                if (activeAssignment) {
                    pushToAssignmentUpdate({ lostReasonId: null });
                } else {
                    updateData.lostReasonId = null;
                }
            }
        }
    }

    // ============================================================
    // BOOLEAN FIELDS
    // ============================================================
    const testDriveVal = data.testDrive === true || data.testDrive === "Yes";
    detectChange("testDrive", testDriveVal, "TESTDRIVE_UPDATE");

    const financeVal = data.finance === true || data.finance === "Yes";
    detectChange("finance", financeVal, "FINANCE_UPDATE");

    // ============================================================
    // BUDGET
    // ============================================================
    if (data.budget) {
        detectChange("budget", parseInt(data.budget), "BUDGET_UPDATE");
    }

    // ============================================================
    // SIMPLE FIELDS
    // ============================================================
    detectChange("occupation", data.occupation, "OCCUPATION_UPDATE");
    detectChange("source", data.source, "SOURCE_UPDATE");
    detectChange("oldModel", data.oldModel, "MODEL_UPDATE");

    // ============================================================
    // AD FIELDS
    // ============================================================
    [
        "adId",
        "adsetId",
        "campaignId",
        "adName",
        "adsetName",
        "campaignName"
    ].forEach((field) => {
        if (data[field] !== undefined && data[field] !== existingLead[field]) {
            pushActivity({
                type: "AD_FIELD_UPDATE",
                field,
                oldVal: existingLead[field],
                newVal: data[field]
            });
            updateData[field] = data[field];
        }
    });

    return { updateData, activities };
};

export const handleLeadAssignment = async ({
    existingLead,
    data,
    userId,
    userName
}) => {
    if (!data.assignedToId) return null;

    // Current active assignment
    const currentAssignment =
        existingLead.leadAssignments?.find(a => a.isActive) || null;

    // No-op if same user
    if (currentAssignment?.assignedToId === data.assignedToId) {
        return null;
    }

    const dealerId =
        data.dealerId ||
        currentAssignment?.dealerId ||
        existingLead.customer?.dealerId ||
        "";

    if (!dealerId) {
        throw new Error("dealerId is required for LeadAssignment");
    }

    // 🔑 CHECK: did this user ever have this lead?
    const previousAssignment = await prisma.leadAssignment.findFirst({
        where: {
            leadId: existingLead.id,
            assignedToId: data.assignedToId
        },
        orderBy: { createdAt: "desc" }
    });

    const isFirstTimeAssignment = !previousAssignment;

    // Deactivate existing active assignment
    await prisma.leadAssignment.updateMany({
        where: {
            leadId: existingLead.id,
            isActive: true
        },
        data: { isActive: false }
    });

    // Fetch user names
    let assignedToName = "";
    let assignedByName = userName;

    try {
        const assignedToUser = await fetchUser(data.assignedToId);
        assignedToName = assignedToUser?.name || "";
    } catch { }

    try {
        const assignedByUser = await fetchUser(userId);
        assignedByName = assignedByUser?.name || assignedByName;
    } catch { }

    // 🔥 CREATE ASSIGNMENT WITH RESTORED STATE
    const newAssignment = await prisma.leadAssignment.create({
        data: {
            leadId: existingLead.id,
            dealerId,
            assignedToId: data.assignedToId,
            assignedToName,
            assignedById: userId,
            assignedByName,
            isActive: true,

            // ✅ RESTORE if user had it before
            statusId: isFirstTimeAssignment
                ? DEFAULT_STATUS_ID
                : previousAssignment?.statusId,

            category: isFirstTimeAssignment
                ? "COLD"
                : previousAssignment?.category,

            lostReasonId: isFirstTimeAssignment
                ? null
                : previousAssignment?.lostReasonId
        }
    });

    // Move legacy comments ONLY first time
    if (isFirstTimeAssignment) {
        await prisma.comment.updateMany({
            where: {
                leadId: existingLead.id,
                leadAssignmentId: null
            },
            data: { leadAssignmentId: newAssignment.id }
        });
    }

    const assignmentActivity = {
        leadId: existingLead.id,
        type: "ASSIGNMENT",
        performedById: userId,
        performedByName: userName,
        leadAssignmentId: newAssignment.id,
        description: `Lead forwarded to dealer user ${assignedToName}`,
        oldAssignee: currentAssignment?.assignedToId ?? null,
        newAssignee: data.assignedToId
    };

    return { newAssignment, assignmentActivity };
};


export const handleLeadAnalytics = async ({
    existingLead,
    updatedLead,
    assignmentResult,
    user,
    roleName,
    userDealerId
}) => {

    // console.log("updatedLead:", updatedLead)
    // ------------------------------------------
    // Extract old + new status info
    // ------------------------------------------
    const oldStatus = existingLead.status;
    const newStatus = updatedLead.status;

    const oldOrder = oldStatus?.order;
    const newOrder = newStatus?.order;

    const newStatusName = newStatus?.name;
    const oldStatusName = oldStatus?.name;

    // console.log("assignmentResult:", assignmentResult)

    // ------------------------------------------
    // Fetch or create analytics row
    // ------------------------------------------
    let analytics = await prisma.leadAnalytics.findUnique({
        where: { leadId: existingLead.id }
    });

    // console.log("analytics 1:", analytics)

    if (!analytics) {
        analytics = await prisma.leadAnalytics.create({
            data: {
                leadId: existingLead.id,
                internalUserId: roleName === "INTERNAL" ? user.id : null,
                dealerId: userDealerId || null,
                currentStatusOrder: oldOrder || null
            }
        });
    }

    // console.log("analytics 2:", analytics)

    let updates = {};
    let triggerDelivered = false;
    let triggerConverted = false;

    // ------------------------------------------
    // 🔥 CASE 1: DELIVERED METRIC
    // Triggered when:
    // - new dealer assignment occurs
    // - assigned user is a dealer
    // - deliveredMetricFlag = false
    // ------------------------------------------
    if (assignmentResult) {
        // assignmentResult.assignedToId = newly assigned user
        // assignmentResult.dealerId = dealer this lead is assigned to
        // console.log("if true 1")
        if (assignmentResult?.newAssignment?.dealerId && analytics.deliveredMetricFlag === false) {
            triggerDelivered = true;
            updates.deliveredMetricFlag = true;
            updates.firstDeliveredAt = new Date();
        }
    }

    // console.log("updates 1:", updates)

    // ------------------------------------------
    // 🔥 CASE 2: CONVERTED METRIC (Status Progression)
    // Conditions:
    // 1. Status order increases
    // 2. New order > 3 (delivered stage reached)
    // 3. Status NOT Lost/NR
    // 4. User belongs to the dealer the lead belongs to
    // 5. convertedMetricFlag = false
    // ------------------------------------------
    if (
        newOrder !== undefined &&
        oldOrder !== undefined &&
        newOrder > oldOrder &&
        newOrder > 3 &&
        newStatusName !== "Lost" &&
        newStatusName !== "Not Reachable" &&
        updatedLead.dealerId === userDealerId &&
        analytics.convertedMetricFlag === false
    ) {
        console.log("if true 2")
        triggerConverted = true;
        updates.convertedMetricFlag = true;
        updates.firstConvertedAt = new Date();
    }

    // console.log("updates 2:", updates)

    // ------------------------------------------
    // 🔥 Always update status order + last change time
    // ------------------------------------------
    if (newOrder !== analytics.currentStatusOrder) {
        updates.currentStatusOrder = newOrder;
        updates.lastStatusChangedAt = new Date();
    }

    // console.log("updates 3:", updates)

    // ------------------------------------------
    // Apply updates
    // ------------------------------------------
    if (Object.keys(updates).length > 0) {
        analytics = await prisma.leadAnalytics.update({
            where: { id: analytics.id },
            data: updates
        });
    }

    // console.log("final analytics:", analytics)
    // console.log("final triggerDelivered:", triggerDelivered)
    // console.log("final triggerConverted:", triggerConverted)

    return {
        deliveredTriggered: triggerDelivered,
        convertedTriggered: triggerConverted,
        analytics
    };
};

export const handleUserMetrics = async ({
    existingLead,
    updatedLead,
    user,
    roleType,
    deliveredTriggered,
    convertedTriggered
}) => {
    try {
        const userId = user?.id;
        const dealerId = updatedLead?.dealerId; // per dealer metrics
        if (!userId || !dealerId) return;

        const date = new Date(); // today's date

        // -----------------------------------------
        // BUILD METRIC INCREMENTS
        // -----------------------------------------
        const increments = {};

        // 1️⃣ Lead assigned to internal user
        if (
            roleType === "INTERNAL" &&
            existingLead.assignedToId === null &&
            updatedLead.assignedToId === userId
        ) {
            increments.leadsAssigned = 1;
        }

        // 2️⃣ Delivered triggered
        if (deliveredTriggered) increments.leadsDelivered = 1;

        // 3️⃣ Converted triggered
        if (convertedTriggered) increments.leadsConverted = 1;

        // 4️⃣ Optional metrics
        if (updatedLead.status?.name === "Not Reachable") increments.leadsUnattended = 1;
        if (updatedLead.status?.name === "Follow Up") increments.pendingFollowups = 1;

        if (Object.keys(increments).length === 0) return;

        // -----------------------------------------
        // CALL USER SERVICE (CROSS-SERVICE)
        // -----------------------------------------
        await axios.post(`${USER_SERVICE_URL}/metrics/user-dealer/update`, {
            userId,
            dealerId,
            date,
            increments
        });

        return { success: true, increments };
    } catch (err) {
        console.error("❌ handleUserMetrics ERROR:", err?.response?.data || err.message);
    }
};

export const handleDealerMetrics = async ({
    assignmentResult,
    deliveredTriggered,
    convertedTriggered,
    userDealerId
}) => {
    try {
        const dealerId = assignmentResult?.dealerId || userDealerId;
        if (!dealerId) return;

        const increments = {};

        if (deliveredTriggered) increments.leadsDelivered = 1;
        if (convertedTriggered) increments.leadsConverted = 1;

        if (Object.keys(increments).length === 0) return;

        await axios.post(`${USER_SERVICE_URL}/metrics/dealer/update`, {
            dealerId,
            increments
        });

        return { success: true, increments };
    } catch (err) {
        console.error("❌ handleDealerMetrics ERROR:", err?.response?.data || err.message);
    }
};

// export const updateMetricsViaUserService = async ({
//     deliveredTriggered,
//     convertedTriggered,
//     updatedLead,
//     assignmentResult,
//     user
// }) => {

//     try {
//         const payload = {
//             deliveredTriggered,
//             convertedTriggered,

//             // newly assigned user (for leadsDelivered increment)
//             assignedToId: assignmentResult?.assignedToId || null,

//             // dealer receiving lead
//             dealerId: assignmentResult?.dealerId || updatedLead?.dealerId || null,

//             // the performing user (internal dealer admin)
//             performedByUserId: user.id,

//             leadId: updatedLead.id,
//         };

//         await axios.post(
//             `${USER_SERVICE_URL}/metrics/update-from-leads`,
//             payload
//         );

//         console.log("User & Dealer metrics updated successfully");

//     } catch (err) {
//         console.error("FAILED updating metrics in user-service:", err?.message || err);
//     }
// };

// async function getDealerUserIds(dealerId) {
//     // Call user-service
//     const users = await userService.getUsersByDealerId(dealerId);

//     return users.map(u => u.id);
// }

// async function getCanAccessAllUserIds() {
//     const users = await userService.getUsersByRoles([
//         "SUPER_ADMIN",
//         "ADMIN"
//     ]);

//     return users.map(u => u.id);
// }


class LeadService {

    async createLead({ leadData, user }) {
        const roleName = user.role?.name;
        const userDealerId = user.dealerId;
        const userId = user.id;
        const userName = user.name || "System";
        const { createdAt } = leadData;

        // 1️⃣ Resolve Customer
        const customer = await CustomerService.findOrCreateCustomer({
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            alternatePhone: leadData.alternatePhone,
            city: leadData.city,
        });

        // 2️⃣ Resolve status
        let statusId = DEFAULT_STATUS_ID;
        if (leadData.status) {
            const statusObj = await prisma.leadStatus.findUnique({
                where: { name: leadData.status },
            });
            if (statusObj) statusId = statusObj.id;
        }

        // 3️⃣ Resolve lost reason
        let lostReasonId = null;
        if (leadData.status === "Lost" && leadData.lostReason) {
            const lostReason = await prisma.leadLostReason.findFirst({
                where: { name: leadData.lostReason, statusId },
            });
            if (lostReason) lostReasonId = lostReason.id;
        }

        // Created At time
        let finalCreatedAt = undefined;

        if (createdAt) {
            const dt = new Date(createdAt);
            if (!isNaN(dt.getTime())) {
                finalCreatedAt = dt;
            }
        }

        // 4️⃣ Create lead
        const lead = await prisma.lead.create({
            data: {
                id: nanoid(10),
                customerId: customer.id,
                oldModel: leadData.oldModel,
                testDrive: leadData.testDrive === "Yes" || leadData.testDrive === true,
                finance: leadData.finance === "Yes" || leadData.finance === true,
                occupation: leadData.occupation,
                budget: leadData.budget ? parseInt(leadData.budget, 10) : null,
                statusId,
                lostReasonId,
                source: leadData.source || "Manual",
                adId: leadData.adId,
                adsetId: leadData.adsetId,
                campaignId: leadData.campaignId,
                adName: leadData.adName,
                adsetName: leadData.adsetName,
                campaignName: leadData.campaignName,
                createdAt: finalCreatedAt,
            },
            include: {
                customer: true,
                status: true,
                lostReason: true,
                leadAssignments: true,
                analytics: true,
            },
        });

        // 5️⃣ Log Lead Created activity
        let activityDescription = "";

        if (!lead.source || lead.source === "Manual") {
            activityDescription = `Lead created by ${userName}`;
        } else {
            activityDescription = `Lead created/populated via ${lead.source}`;
        }

        await prisma.leadActivity.create({
            data: {
                leadId: lead.id,
                performedById: userId,
                performedByName: userName,
                type: "LEAD_ADDED",
                description: activityDescription,
                newStatus: lead.status?.name || "New",
            },
        });

        // 6️⃣ Auto-create LeadAssignment for dealer users
        let leadAssignment = null;

        if (userDealerId) {
            leadAssignment = await prisma.leadAssignment.create({
                data: {
                    leadId: lead.id,
                    dealerId: userDealerId,
                    assignedToId: userId,
                    assignedToName: userName,
                    assignedById: userId,
                    assignedByName: userName,
                    statusId: lead.statusId,
                    category: lead.category,
                },
            });

            // Log assignment activity
            await prisma.leadActivity.create({
                data: {
                    leadId: lead.id,
                    leadAssignmentId: leadAssignment.id,
                    performedById: userId,
                    performedByName: userName,
                    type: "ASSIGNMENT",
                    description: `Lead assigned to ${userName} at dealer`,
                    oldAssignee: null,
                    newAssignee: userName,
                },
            });
        }

        return { lead: formatLead(lead), leadAssignment };
    }


    // async getLeads({ user, queryFilters = {}, filterType = "AND" }) {
    //     const roleName = user.role?.name;
    //     const userDealerId = user.dealerId;
    //     const userId = user.id;

    //     // -------------------------------
    //     // 1️⃣ Base filter based on role
    //     // -------------------------------
    //     let baseFilter = {};

    //     if (canAccessAll(roleName)) {
    //         baseFilter = {}; // SUPER_ADMIN / ADMIN → access all leads
    //     } else if (isDealerAdmin(roleName)) {
    //         // Dealer Admin → only leads assigned to their dealer
    //         baseFilter = {
    //             // assignments: { some: { dealerId: userDealerId, isActive: true } },
    //             leadAssignments: { some: { dealerId: userDealerId } },
    //         };
    //     } else if (isSelfAccess(roleName)) {
    //         // Sales → only leads assigned to self
    //         baseFilter = {
    //             // assignments: { some: { assignedToId: userId, isActive: true } },
    //             leadAssignments: { some: { assignedToId: userId } },
    //         };
    //     }

    //     // -------------------------------
    //     // 2️⃣ Dynamic filters from queryFilters object
    //     // -------------------------------
    //     const filters = [];

    //     const {
    //         status,
    //         category,
    //         assignedToId,
    //         dealerId,
    //         source,
    //         search,
    //         fromDate,
    //         toDate,
    //     } = queryFilters;

    //     // Status filter
    //     if (status) {
    //         const statusObj = await prisma.leadStatus.findUnique({ where: { name: status } });
    //         if (statusObj) filters.push({ statusId: statusObj.id });
    //     }

    //     // Category filter
    //     if (category) filters.push({ category });

    //     // Source filter
    //     if (source) filters.push({ source });

    //     // Assigned user filter
    //     if (assignedToId) {
    //         filters.push({ leadAssignments: { some: { assignedToId, isActive: true } } });
    //     }

    //     // Dealer filter
    //     if (dealerId) {
    //         filters.push({ leadAssignments: { some: { dealerId, isActive: true } } });
    //     }

    //     // Date range filter
    //     if (fromDate && toDate) {
    //         const start = new Date(fromDate);
    //         const end = new Date(toDate);
    //         start.setHours(0, 0, 0, 0);
    //         end.setHours(23, 59, 59, 999);

    //         filters.push({ createdAt: { gte: start, lte: end } });
    //     }

    //     // Search filter (name, email, phone)
    //     if (search) {
    //         filters.push({
    //             OR: [
    //                 { name: { contains: search, mode: "insensitive" } },
    //                 { email: { contains: search, mode: "insensitive" } },
    //                 { phone: { contains: search, mode: "insensitive" } },
    //             ],
    //         });
    //     }

    //     // -------------------------------
    //     // 3️⃣ Combine base filter + dynamic filters
    //     // -------------------------------
    //     const whereClause =
    //         filters.length > 0
    //             ? { ...baseFilter, [filterType === "OR" ? "OR" : "AND"]: filters }
    //             : baseFilter;

    //     // -------------------------------
    //     // 4️⃣ Query leads
    //     // -------------------------------
    //     const leads = await prisma.lead.findMany({
    //         where: whereClause,
    //         include: {
    //             status: true,
    //             lostReason: true,

    //             leadAssignments: {
    //                 where: canAccessAll(roleName)
    //                     ? undefined
    //                     : { dealerId: userDealerId },

    //                 include: {
    //                     status: true,
    //                     lostReason: true,

    //                     leadActivities: {
    //                         where: canAccessAll(roleName)
    //                             ? undefined
    //                             : {
    //                                 leadAssignment: {
    //                                     dealerId: userDealerId
    //                                 }
    //                             },
    //                         orderBy: { createdAt: "desc" }
    //                     }
    //                 },

    //                 orderBy: { assignedAt: "desc" } // SAME AS getLeadById
    //             },

    //             analytics: true,
    //             customer: true,
    //         },
    //         orderBy: { createdAt: "desc" },
    //     });


    //     // -------------------------------
    //     // 5️⃣ Format and return
    //     // -------------------------------
    //     return leads.map(formatLead);
    // }

    // async getLeads({ user, queryFilters = {}, filterType = "AND" }) {
    //     const roleName = user.role?.name;
    //     const userDealerId = user.dealerId;
    //     const userId = user.id;

    //     const canAll = canAccessAll(roleName);
    //     const isDealer = isDealerAdmin(roleName);
    //     const isSelf = isSelfAccess(roleName);

    //     // -------------------------------
    //     // 1️⃣ BASE FILTER (dealer / self)
    //     // -------------------------------
    //     let baseFilter = {};

    //     if (!canAll) {
    //         baseFilter.leadAssignments = {
    //             some: { dealerId: userDealerId }
    //         };
    //     }

    //     if (isSelf) {
    //         baseFilter.leadAssignments = {
    //             some: { assignedToId: userId }
    //         };
    //     }

    //     // -------------------------------
    //     // 2️⃣ Dynamic query filters
    //     // -------------------------------
    //     const filters = [];
    //     const {
    //         status,
    //         category,
    //         assignedToId,
    //         dealerId,
    //         source,
    //         search,
    //         fromDate,
    //         toDate,
    //     } = queryFilters;

    //     if (status) {
    //         const statusObj = await prisma.leadStatus.findUnique({ where: { name: status } });
    //         if (statusObj) filters.push({ statusId: statusObj.id });
    //     }

    //     if (category) filters.push({ category });
    //     if (source) filters.push({ source });

    //     if (assignedToId) {
    //         filters.push({
    //             leadAssignments: { some: { assignedToId, isActive: true } }
    //         });
    //     }

    //     if (dealerId) {
    //         filters.push({
    //             leadAssignments: { some: { dealerId, isActive: true } }
    //         });
    //     }

    //     if (fromDate && toDate) {
    //         const start = new Date(fromDate);
    //         const end = new Date(toDate);
    //         start.setHours(0, 0, 0, 0);
    //         end.setHours(23, 59, 59, 999);

    //         filters.push({ createdAt: { gte: start, lte: end } });
    //     }

    //     if (search) {
    //         filters.push({
    //             OR: [
    //                 { name: { contains: search, mode: "insensitive" } },
    //                 { email: { contains: search, mode: "insensitive" } },
    //                 { phone: { contains: search, mode: "insensitive" } },
    //             ],
    //         });
    //     }

    //     // -------------------------------
    //     // 3️⃣ Final where clause
    //     // -------------------------------
    //     const whereClause =
    //         filters.length > 0
    //             ? { ...baseFilter, [filterType === "OR" ? "OR" : "AND"]: filters }
    //             : baseFilter;

    //     // -------------------------------
    //     // 4️⃣ Fetch leads
    //     // -------------------------------
    //     const leads = await prisma.lead.findMany({
    //         where: whereClause,
    //         include: {
    //             status: true,
    //             lostReason: true,
    //             analytics: true,
    //             customer: true,

    //             leadAssignments: {
    //                 where: canAll ? undefined : { dealerId: userDealerId },
    //                 include: {
    //                     status: true,
    //                     lostReason: true,
    //                     leadActivities: {
    //                         where: canAll
    //                             ? undefined
    //                             : { leadAssignment: { dealerId: userDealerId } },
    //                         orderBy: { createdAt: "desc" }
    //                     }
    //                 },
    //                 orderBy: { assignedAt: "desc" }
    //             }
    //         },
    //         orderBy: { createdAt: "desc" }
    //     });

    //     // -------------------------------
    //     // 5️⃣ VISIBILITY FILTER (🔥 SAME AS getLeadById)
    //     // -------------------------------
    //     const visibleLeads = canAll
    //         ? leads
    //         : leads.filter(lead => {
    //             const dealerAssignments = lead.leadAssignments;

    //             const activeAssignments = dealerAssignments.filter(a => a.isActive);
    //             const inactiveAssignments = dealerAssignments.filter(a => !a.isActive);

    //             const hasActive = activeAssignments.length > 0;
    //             const hasSingleInactive =
    //                 inactiveAssignments.length === 1 &&
    //                 dealerAssignments.length === 1;

    //             if (!hasActive && !hasSingleInactive) return false;

    //             // SELF users must be assigned
    //             if (isSelf) {
    //                 return dealerAssignments.some(a => a.assignedToId === userId);
    //             }

    //             return true;
    //         });

    //     // -------------------------------
    //     // 6️⃣ Format + return
    //     // -------------------------------
    //     return visibleLeads.map(formatLead);
    // }

    async getLeads({ user, queryFilters = {}, filterType = "AND" }) {
        const roleName = user.role?.name;
        const userDealerId = user.dealerId;
        const userId = user.id;

        const canAll = canAccessAll(roleName);
        const isSelf = isSelfAccess(roleName);

        // -------------------------------
        // 1️⃣ Base filter
        // -------------------------------
        let baseFilter = {};

        if (!canAll) {
            baseFilter = {
                leadAssignments: {
                    some: { dealerId: userDealerId }
                }
            };
        }

        // -------------------------------
        // 2️⃣ Dynamic filters
        // -------------------------------
        const filters = [];

        const {
            status,
            category,
            assignedToId,
            dealerId,
            source,
            search,
            fromDate,
            toDate,
        } = queryFilters;

        if (status) {
            const statusObj = await prisma.leadStatus.findUnique({ where: { name: status } });
            if (statusObj) filters.push({ statusId: statusObj.id });
        }

        if (category) filters.push({ category });
        if (source) filters.push({ source });

        if (assignedToId) {
            filters.push({
                leadAssignments: {
                    some: { assignedToId }
                }
            });
        }

        if (dealerId) {
            filters.push({
                leadAssignments: {
                    some: { dealerId }
                }
            });
        }

        if (fromDate && toDate) {
            const start = new Date(fromDate);
            const end = new Date(toDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);

            filters.push({ createdAt: { gte: start, lte: end } });
        }

        if (search) {
            filters.push({
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                    { phone: { contains: search, mode: "insensitive" } },
                ],
            });
        }

        const whereClause =
            filters.length > 0
                ? { ...baseFilter, [filterType === "OR" ? "OR" : "AND"]: filters }
                : baseFilter;

        // -------------------------------
        // 3️⃣ Fetch leads
        // -------------------------------
        const leads = await prisma.lead.findMany({
            where: whereClause,

            include: {
                status: true,
                lostReason: true,
                analytics: true,
                customer: true,

                // -------------------------------
                // ASSIGNMENTS (dealer scoped)
                // -------------------------------
                leadAssignments: {
                    where: canAll
                        ? undefined
                        : { dealerId: userDealerId },

                    include: {
                        status: true,
                        lostReason: true,

                        leadActivities: {
                            where: canAll
                                ? undefined
                                : {
                                    leadAssignment: {
                                        dealerId: userDealerId
                                    }
                                },
                            orderBy: { createdAt: "desc" }
                        }
                    },

                    orderBy: { assignedAt: "desc" }
                },

                // -------------------------------
                // LEAD ACTIVITY (top level)
                // -------------------------------
                leadActivity: canAll
                    ? {
                        orderBy: { createdAt: "desc" }
                    }
                    : {
                        where: {
                            OR: [
                                { performedById: userId },
                                { leadAssignment: { dealerId: userDealerId } }
                            ]
                        },
                        orderBy: { createdAt: "desc" }
                    }
            },

            orderBy: { createdAt: "desc" }
        });

        // -------------------------------
        // 4️⃣ VISIBILITY FILTER (CORE LOGIC)
        // -------------------------------
        // const visibleLeads = leads.filter((lead) => {
        //     if (canAll) return true;

        //     const dealerAssignments = lead.leadAssignments;

        //     const activeAssignments = dealerAssignments.filter(a => a.isActive);
        //     const inactiveAssignments = dealerAssignments.filter(a => !a.isActive);

        //     const hasActive = activeAssignments.length > 0;
        //     const hasSingleInactive =
        //         inactiveAssignments.length === 1 &&
        //         dealerAssignments.length === 1;

        //     if (!hasActive && !hasSingleInactive) return false;

        //     // SELF access check
        //     if (isSelf) {
        //         return dealerAssignments.some(a => a.assignedToId === userId);
        //     }

        //     return true;
        // });

        // -------------------------------
        // 4️⃣ VISIBILITY FILTER (FIXED)
        // -------------------------------
        const visibleLeads = leads.filter((lead) => {
            if (canAll) return true;

            const dealerAssignments = lead.leadAssignments;

            // assignments belonging to THIS user
            const userAssignments = dealerAssignments.filter(
                a => a.assignedToId === userId
            );

            const userActiveAssignments = userAssignments.filter(a => a.isActive);

            const hasUserActive = userActiveAssignments.length > 0;

            const hasSingleUserInactive =
                userAssignments.length === 1 &&
                userAssignments[0].isActive === false &&
                dealerAssignments.length === 1;

            if (!hasUserActive && !hasSingleUserInactive) {
                return false;
            }

            return true;
        });


        // -------------------------------
        // 5️⃣ Return formatted
        // -------------------------------
        return visibleLeads.map(formatLead);
    }

    // async getLeadById({ id, user }) {
    //     const roleName = user.role?.name;
    //     const userId = user.id;
    //     const userDealerId = user.dealerId;

    //     const canAll = canAccessAll(roleName);
    //     const isDealer = isDealerAdmin(roleName);
    //     const isSelf = isSelfAccess(roleName);

    //     // ----------------------------------------
    //     // Base where clause → filter ONLY Dealer Admin (not Self)
    //     // ----------------------------------------
    //     let whereClause = { id };

    //     if (isDealer) {
    //         whereClause.leadAssignments = {
    //             some: { dealerId: userDealerId }
    //         };
    //     }

    //     // ----------------------------------------
    //     // Fetch Lead
    //     // ----------------------------------------
    //     const lead = await prisma.lead.findFirst({
    //         where: whereClause,

    //         include: {
    //             customer: true,
    //             status: true,
    //             lostReason: true,
    //             analytics: true,

    //             // ----------------------------------------
    //             // LEAD ACTIVITY
    //             // ----------------------------------------
    //             leadActivity: canAll
    //                 ? {
    //                     orderBy: { createdAt: "desc" }
    //                 }
    //                 : isDealer
    //                     ? {
    //                         // Dealer Admin → activities belonging to THEIR assignment or THEIR performed activities
    //                         where: {
    //                             OR: [
    //                                 { performedById: userId },
    //                                 {
    //                                     leadAssignment: {
    //                                         assignedToId: userId
    //                                     }
    //                                 }
    //                             ]
    //                         },
    //                         orderBy: { createdAt: "desc" }
    //                     }
    //                     : {
    //                         // SELF user also sees ALL activity under their dealer
    //                         where: {
    //                             OR: [
    //                                 { performedById: userId }, // always allow own activity
    //                                 { leadAssignment: { dealerId: userDealerId } }
    //                             ]
    //                         },
    //                         orderBy: { createdAt: "desc" }
    //                     },

    //             // ----------------------------------------
    //             // ASSIGNMENTS
    //             // ----------------------------------------
    //             leadAssignments: {
    //                 where: canAll
    //                     ? undefined
    //                     : { dealerId: userDealerId },

    //                 include: {
    //                     status: true,
    //                     lostReason: true,
    //                     leadActivities: {
    //                         where: canAll
    //                             ? undefined
    //                             : {
    //                                 leadAssignment: {
    //                                     dealerId: userDealerId
    //                                 }
    //                             },
    //                         orderBy: { createdAt: "desc" }
    //                     }
    //                 },

    //                 orderBy: { assignedAt: "desc" }
    //             },

    //             comments: true
    //         }
    //     });

    //     if (!lead) {
    //         throw new Error("Lead not found or not accessible");
    //     }

    //     // ---------------------------------------------------------
    //     // SELF USER FINAL VALIDATION → Must be actively assigned
    //     // ---------------------------------------------------------
    //     if (isSelf) {
    //         const isAssigned = lead.leadAssignments.some(
    //             // (a) => a.assignedToId === userId && a.isActive
    //             (a) => a.assignedToId === userId
    //         );

    //         if (!isAssigned) {
    //             throw new Error("You are not assigned to this lead");
    //         }
    //     }

    //     // NOTE ❗️
    //     // For both Self + Dealer Admin:
    //     // They should see ALL assignments of their dealer,
    //     // so we DO NOT filter further here.

    //     return formatLead(lead);
    // }


    async getLeadById({ id, user }) {
        const roleName = user.role?.name;
        const userId = user.id;
        const userDealerId = user.dealerId;

        const canAll = canAccessAll(roleName);
        const isDealer = isDealerAdmin(roleName);
        const isSelf = isSelfAccess(roleName);

        // ----------------------------------------
        // BASE WHERE
        // ----------------------------------------
        let whereClause = { id };

        // Dealer + Self must at least belong to the dealer
        if (!canAll) {
            whereClause.leadAssignments = {
                some: { dealerId: userDealerId }
            };
        }

        // ----------------------------------------
        // FETCH LEAD
        // ----------------------------------------
        const lead = await prisma.lead.findFirst({
            where: whereClause,

            include: {
                customer: true,
                status: true,
                lostReason: true,
                analytics: true,

                // ----------------------------------------
                // LEAD ACTIVITY
                // ----------------------------------------
                leadActivity: canAll
                    ? {
                        orderBy: { createdAt: "desc" }
                    }
                    : {
                        where: {
                            OR: [
                                { performedById: userId },
                                { leadAssignment: { dealerId: userDealerId } }
                            ]
                        },
                        orderBy: { createdAt: "desc" }
                    },

                // ----------------------------------------
                // ASSIGNMENTS (Dealer scoped)
                // ----------------------------------------
                leadAssignments: {
                    where: canAll
                        ? undefined
                        : { dealerId: userDealerId },

                    include: {
                        status: true,
                        lostReason: true,
                        leadActivities: {
                            where: canAll
                                ? undefined
                                : {
                                    leadAssignment: {
                                        dealerId: userDealerId
                                    }
                                },
                            orderBy: { createdAt: "desc" }
                        }
                    },

                    orderBy: { assignedAt: "desc" }
                },

                comments: true
            }
        });

        if (!lead) {
            throw new Error("Lead not found or not accessible");
        }

        // ---------------------------------------------------------
        // 🚨 VISIBILITY VALIDATION (NEW CORE LOGIC)
        // ---------------------------------------------------------
        // if (!canAll) {
        //     const dealerAssignments = lead.leadAssignments;

        //     const activeAssignments = dealerAssignments.filter(a => a.isActive);
        //     const inactiveAssignments = dealerAssignments.filter(a => !a.isActive);

        //     const hasActive = activeAssignments.length > 0;
        //     const hasSingleInactive =
        //         inactiveAssignments.length === 1 &&
        //         dealerAssignments.length === 1;

        //     if (!hasActive && !hasSingleInactive) {
        //         throw new Error("Lead not accessible based on assignment state");
        //     }
        // }

        // ---------------------------------------------------------
        // SELF USER EXTRA VALIDATION
        // ---------------------------------------------------------
        // if (isSelf) {
        //     const isAssignedToUser = lead.leadAssignments.some(
        //         a => a.assignedToId === userId
        //     );

        //     if (!isAssignedToUser) {
        //         throw new Error("You are not assigned to this lead");
        //     }
        // }

        if (!canAll) {
            const dealerAssignments = lead.leadAssignments;

            const userAssignments = dealerAssignments.filter(
                a => a.assignedToId === userId
            );

            const userActiveAssignments = userAssignments.filter(a => a.isActive);

            const hasUserActive = userActiveAssignments.length > 0;

            const hasSingleUserInactive =
                userAssignments.length === 1 &&
                userAssignments[0].isActive === false &&
                dealerAssignments.length === 1;

            if (!hasUserActive && !hasSingleUserInactive) {
                throw new Error("Lead not accessible for this user");
            }
        }


        return formatLead(lead);
    }


    async updateLead({ leadId, data, user }) {
        const userId = user.id;
        const userName = user.name;
        const roleName = user.role?.name;
        const userDealerId = user.dealerId;
        const roleType = user.roleType;

        // ---------------- 1. Fetch Lead ----------------
        const existingLead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                status: true,
                lostReason: true,
                leadAssignments: {
                    where: { isActive: true },
                    orderBy: { assignedAt: "desc" },
                    take: 1
                }
            }
        });

        if (!existingLead) throw new Error("Lead not found");

        // ---------------- 2. Lead field updates + activities ----------------
        const { updateData, activities } = await handleLeadDataUpdate({
            data,
            existingLead,
            userId,
            userName,
            roleName,
            userDealerId
        });

        // ---------------- 3. Update Lead ----------------
        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: updateData,
            include: {
                status: true,
                lostReason: true,
                leadAssignments: {
                    where: { isActive: true },
                    orderBy: { assignedAt: "desc" },
                    take: 1
                }
            }
        });

        // ---------------- 4. Handle Lead Assignment ----------------
        const assignmentResult = await handleLeadAssignment({
            existingLead,
            data,
            userId,
            userName
        });

        // ⬇️ If assignment activity exists, push it into activities[]
        if (assignmentResult?.assignmentActivity) {
            activities.push(assignmentResult.assignmentActivity);
        }

        // ---------------- 5. Save ALL activities (field changes + assignment) ----------------
        if (activities.length > 0) {
            await handleLeadActivity(activities);
        }

        // ---------------- 6. Lead Analytics ----------------
        const {
            deliveredTriggered,
            convertedTriggered,
        } = await handleLeadAnalytics({
            existingLead,
            updatedLead,
            assignmentResult,
            user,
            roleName,
            userDealerId
        });

        // ---------------- 7. User Metrics ----------------
        await handleUserMetrics({
            existingLead,
            updatedLead,
            user,
            roleType,
            deliveredTriggered,
            convertedTriggered
        });

        // ---------------- 8. Dealer Metrics ----------------
        await handleDealerMetrics({
            assignmentResult,
            deliveredTriggered,
            convertedTriggered,
            userDealerId
        });

        // ---------------- 9. Retrieve Final Lead ----------------
        const finalLead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                customer: true,
                status: true,
                lostReason: true,
                analytics: true,
                leadActivity: { orderBy: { createdAt: "desc" } },
                leadAssignments: {
                    include: { leadActivities: true },
                    where: { isActive: true }
                },
                comments: true
            }
        });

        return {
            message: "Lead updated successfully",
            lead: finalLead,
        };
    }


    async deleteLead({ id, user }) {
        const roleName = user.role?.name;
        const userDealerId = user.dealerId;

        let whereClause = { id };
        if (isDealerAdmin(roleName)) whereClause.dealerId = userDealerId;
        if (isSelfAccess(roleName)) whereClause.assignedToId = user.id;

        const lead = await prisma.lead.findFirst({ where: whereClause });
        if (!lead) throw new Error("Lead not found or not accessible");

        await prisma.lead.delete({ where: { id } });
        return true;
    }
}

export default new LeadService();
