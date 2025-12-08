import prisma from "../lib/prisma.js";

const canAccessAll = (role) => ["SUPER_ADMIN", "ADMIN"].includes(role);
const isDealerAdmin = (role) => role === "DEALER_ADMIN";
const isSelfAccess = (role) => ["CALLING", "DEALER_SALES"].includes(role);

// Format helper
export const formatActivity = (activity) => ({
    id: activity.id,
    leadId: activity.leadId,
    leadAssignmentId: activity.leadAssignmentId,
    performedById: activity.performedById,
    performedByName: activity.performedByName,
    type: activity.type,
    description: activity.description,
    dueDate: activity.dueDate,
    completed: activity.completed,
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
});

// --- Access Control ---
const hasAccess = (roleName, userDealerId, assignmentDealerId) => {
    if (canAccessAll(roleName)) return true;
    if (assignmentDealerId === userDealerId) return true;
    return false;
};

// ============================
// CREATE ACTIVITY (Service)
// ============================
export const createActivityService = async ({
    leadId,
    leadAssignmentId,
    type,
    description,
    dueDate,
    roleName,
    userDealerId,
    userId,
    userName,
}) => {
    // Find assignment
    const assignment = await prisma.leadAssignment.findUnique({
        where: { id: leadAssignmentId },
        include: { lead: true },
    });

    if (!assignment) return { error: "ASSIGNMENT_NOT_FOUND" };

    // Access check
    if (!hasAccess(roleName, userDealerId, assignment.dealerId)) {
        return { error: "NOT_ALLOWED" };
    }

    // Create activity
    const activity = await prisma.leadActivity.create({
        data: {
            leadId,
            leadAssignmentId,
            performedById: userId,
            performedByName: userName,
            type,
            description,
            dueDate,
        },
    });

    return { activity: formatActivity(activity) };
};

// ============================
// GET ACTIVITIES BY LEAD
// ============================
// export const getActivitiesByLeadIdService = async ({
//     leadId,
//     roleName,
//     userDealerId,
// }) => {
//     // Fetch assignments under this lead
//     const assignments = await prisma.leadAssignment.findMany({
//         where: { leadId },
//     });

//     if (!assignments.length) return { activities: [] };

//     // Which assignment IDs are allowed?
//     const allowedAssignments = canAccessAll(roleName)
//         ? assignments.map((a) => a.id)
//         : assignments.filter((a) => a.dealerId === userDealerId).map((a) => a.id);

//     if (!allowedAssignments.length) return { error: "NOT_ALLOWED" };

//     const activities = await prisma.leadActivity.findMany({
//         where: { leadAssignmentId: { in: allowedAssignments } },
//         orderBy: { createdAt: "desc" },
//     });

//     return { activities: activities.map(formatActivity) };
// };

export const getActivitiesByLeadIdService = async ({
    leadId,
    roleName,
    userDealerId,
}) => {
    // -------------------------------------------------
    // 1. Fetch all assignments for this lead
    // -------------------------------------------------
    const assignments = await prisma.leadAssignment.findMany({
        where: { leadId },
    });

    // Collect assignment IDs
    const allAssignmentIds = assignments.map(a => a.id);

    // -------------------------------------------------
    // 2. Determine allowed assignment IDs
    // -------------------------------------------------
    let allowedAssignmentIds;

    if (canAccessAll(roleName)) {
        // Super Admin & Admin → can access ALL + unassigned
        allowedAssignmentIds = allAssignmentIds;
    } else {
        // Dealer Admin → only their own dealer's assignments
        allowedAssignmentIds = assignments
            .filter((a) => a.dealerId === userDealerId)
            .map((a) => a.id);
    }

    // If they cannot access any assignment AND they are not super/admin → block
    if (!canAccessAll(roleName) && allowedAssignmentIds.length === 0) {
        return { error: "NOT_ALLOWED" };
    }

    // -------------------------------------------------
    // 3. Fetch Activities
    // -------------------------------------------------
    const activities = await prisma.leadActivity.findMany({
        where: {
            leadId,
            OR: [
                { leadAssignmentId: null },                      // 🔥 Unassigned/global activities
                { leadAssignmentId: { in: allowedAssignmentIds } }, // 🔥 Allowed assigned activities
            ]
        },
        orderBy: { createdAt: "desc" },
    });

    return { activities: activities.map(formatActivity) };
};


// ============================
// GET ACTIVITY BY ID
// ============================
export const getActivityByIdService = async ({
    id,
    roleName,
    userDealerId,
}) => {
    const activity = await prisma.leadActivity.findUnique({
        where: { id },
        include: {
            assignment: true, // assuming relation name
        },
    });

    if (!activity) return { error: "NOT_FOUND" };

    if (!hasAccess(roleName, userDealerId, activity.assignment.dealerId)) {
        return { error: "NOT_ALLOWED" };
    }

    return { activity: formatActivity(activity) };
};

// ============================
// UPDATE ACTIVITY
// ============================
export const updateActivityService = async ({
    id,
    data,
    roleName,
    userDealerId,
}) => {
    const activity = await prisma.leadActivity.findUnique({
        where: { id },
        include: { assignment: true },
    });

    if (!activity) return { error: "NOT_FOUND" };

    if (!hasAccess(roleName, userDealerId, activity.assignment.dealerId)) {
        return { error: "NOT_ALLOWED" };
    }

    const updated = await prisma.leadActivity.update({
        where: { id },
        data,
    });

    return { activity: formatActivity(updated) };
};

// ============================
// DELETE ACTIVITY
// ============================
export const deleteActivityService = async ({
    id,
    roleName,
    userDealerId,
}) => {
    const activity = await prisma.leadActivity.findUnique({
        where: { id },
        include: { assignment: true },
    });

    if (!activity) return { error: "NOT_FOUND" };

    if (!hasAccess(roleName, userDealerId, activity.assignment.dealerId)) {
        return { error: "NOT_ALLOWED" };
    }

    await prisma.leadActivity.delete({ where: { id } });

    return { success: true };
};
