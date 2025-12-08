import prisma from "../lib/prisma.js";
import { canAccessAll, isDealerAdmin, isSelfAccess } from "../utils/roleAccess.utils.js";

// ---------------------------------------
// CREATE COMMENT
// ---------------------------------------
// export const createCommentService = async ({
//     leadId,
//     leadAssignmentId,
//     type,
//     description,
//     dueDate,
//     userId,
//     userName,
//     roleName,
//     userDealerId,
// }) => {
//     const assignment = await validateAssignmentAccess({
//         leadAssignmentId,
//         leadId,
//         roleName,
//         userId,
//         userDealerId,
//     });

//     if (!assignment) return { error: "NOT_ALLOWED" };

//     const comment = await prisma.comment.create({
//         data: {
//             leadId,
//             leadAssignmentId,
//             type: type || "COMMENT",
//             description,
//             createdById: userId,
//             createdByName: userName,
//         },
//     });

//     const activity = await prisma.leadActivity.create({
//         data: {
//             leadId,
//             leadAssignmentId,
//             type: type || "COMMENT",
//             description,
//             performedById: userId,
//             performedByName: userName,
//             dueDate: dueDate ? new Date(dueDate) : null,
//         },
//     });

//     return { comment, activity };
// };

// export const createCommentService = async ({
//     leadId,
//     leadAssignmentId,
//     type,
//     description,
//     dueDate,
//     userId,
//     userName,
//     roleName,
//     userDealerId,
// }) => {
//     // ------------------------------------------
//     // 1. If no assignmentId passed → allow comment on lead with null assignment
//     //    (Only if user has access to this lead)
//     // ------------------------------------------
//     if (!leadAssignmentId) {
//         const hasAccess = await validateLeadAccess({
//             leadId,
//             roleName,
//             userId,
//             userDealerId,
//         });

//         if (!hasAccess) return { error: "NOT_ALLOWED" };

//         const comment = await prisma.comment.create({
//             data: {
//                 leadId,
//                 leadAssignmentId: null,
//                 type: type || "COMMENT",
//                 description,
//                 createdById: userId,
//                 createdByName: userName,
//             },
//         });

//         const activity = await prisma.leadActivity.create({
//             data: {
//                 leadId,
//                 leadAssignmentId: null,
//                 type: type || "COMMENT",
//                 description,
//                 performedById: userId,
//                 performedByName: userName,
//                 dueDate: dueDate ? new Date(dueDate) : null,
//             },
//         });

//         return { comment, activity };
//     }

//     // ------------------------------------------
//     // 2. leadAssignmentId is present → validate access
//     // ------------------------------------------
//     const assignment = await validateAssignmentAccess({
//         leadAssignmentId,
//         leadId,
//         roleName,
//         userId,
//         userDealerId,
//     });

//     if (!assignment) return { error: "NOT_ALLOWED" };

//     // ------------------------------------------
//     // 3. Create comment for given assignment
//     // ------------------------------------------
//     const comment = await prisma.comment.create({
//         data: {
//             leadId,
//             leadAssignmentId,
//             type: type || "COMMENT",
//             description,
//             createdById: userId,
//             createdByName: userName,
//         },
//     });

//     // ------------------------------------------
//     // 4. Create activity log entry
//     // ------------------------------------------
//     const activity = await prisma.leadActivity.create({
//         data: {
//             leadId,
//             leadAssignmentId,
//             type: type || "COMMENT",
//             description,
//             performedById: userId,
//             performedByName: userName,
//             dueDate: dueDate ? new Date(dueDate) : null,
//         },
//     });

//     return { comment, activity };
// };

// export const createCommentService = async ({
//     leadId,
//     leadAssignmentId,
//     type,
//     description,
//     dueDate,
//     userId,
//     userName,
//     roleName,
//     userDealerId,
// }) => {
//     // ------------------------------------------
//     // CASE 1: No assignment → only canAccessAll allowed
//     // ------------------------------------------
//     if (!leadAssignmentId) {
//         if (!canAccessAll(roleName)) {
//             return { error: "NOT_ALLOWED" };
//         }

//         // Create COMMENT + ACTIVITY without assignment
//         const comment = await prisma.comment.create({
//             data: {
//                 leadId,
//                 leadAssignmentId: null,
//                 type: type || "COMMENT",
//                 description,
//                 createdById: userId,
//                 createdByName: userName,
//             },
//         });

//         const activity = await prisma.leadActivity.create({
//             data: {
//                 leadId,
//                 leadAssignmentId: null,
//                 type: type || "COMMENT",
//                 description,
//                 performedById: userId,
//                 performedByName: userName,
//                 dueDate: dueDate ? new Date(dueDate) : null,
//             },
//         });

//         return { comment, activity };
//     }

//     // ------------------------------------------
//     // CASE 2: Assignment exists → check access through validateAssignmentAccess
//     // ------------------------------------------
//     const assignment = await validateAssignmentAccess({
//         leadAssignmentId,
//         leadId,
//         roleName,
//         userId,
//         userDealerId,
//     });

//     if (!assignment) return { error: "NOT_ALLOWED" };

//     // Create comment with assignment
//     const comment = await prisma.comment.create({
//         data: {
//             leadId,
//             leadAssignmentId,
//             type: type || "COMMENT",
//             description,
//             createdById: userId,
//             createdByName: userName,
//         },
//     });

//     const activity = await prisma.leadActivity.create({
//         data: {
//             leadId,
//             leadAssignmentId,
//             type: type || "COMMENT",
//             description,
//             performedById: userId,
//             performedByName: userName,
//             dueDate: dueDate ? new Date(dueDate) : null,
//         },
//     });

//     return { comment, activity };
// };

// export const createCommentService = async ({
//     leadId,
//     leadAssignmentId,
//     type,
//     description,
//     dueDate,
//     userId,
//     userName,
//     roleName,
//     userDealerId,
// }) => {

//     const isAdmin = canAccessAll(roleName);
//     const isDealerUser = isDealerAdmin(roleName) || isSelfAccess(roleName);

//     // ---------------------------------------------------------------------
//     // CASE 1 → NO ASSIGNMENT: Only SUPER_ADMIN / ADMIN can comment
//     // ---------------------------------------------------------------------
//     if (!leadAssignmentId) {
//         if (!isAdmin) return { error: "NOT_ALLOWED" };

//         const comment = await prisma.comment.create({
//             data: {
//                 leadId,
//                 leadAssignmentId: null,
//                 type: type || "COMMENT",
//                 description,
//                 createdById: userId,
//                 createdByName: userName,
//             },
//         });

//         const activity = await prisma.leadActivity.create({
//             data: {
//                 leadId,
//                 leadAssignmentId: null,
//                 type: type || "COMMENT",
//                 description,
//                 performedById: userId,
//                 performedByName: userName,
//                 dueDate: dueDate ? new Date(dueDate) : null,
//             },
//         });

//         return { comment, activity };
//     }

//     // ---------------------------------------------------------------------
//     // CASE 2 → ASSIGNMENT EXISTS
//     // Fetch that assignment
//     // ---------------------------------------------------------------------
//     const assignment = await prisma.leadAssignment.findUnique({
//         where: { id: leadAssignmentId },
//         select: { dealerId: true, isActive: true },
//     });

//     if (!assignment) return { error: "NOT_ALLOWED" };

//     // ---------------------------------------------------------------------
//     // RULE: Super Admin / Admin → always allowed
//     // ---------------------------------------------------------------------
//     if (!isAdmin) {
//         // Dealer admin OR self access
//         if (isDealerUser) {
//             // Must be active
//             // if (!assignment.isActive) return { error: "NOT_ALLOWED" };

//             // Must match dealer
//             if (assignment.dealerId !== userDealerId)
//                 return { error: "NOT_ALLOWED" };
//         } else {
//             // Any other role → no access
//             return { error: "NOT_ALLOWED" };
//         }
//     }

//     // ---------------------------------------------------------------------
//     // Create comment and activity (both assigned)
//     // ---------------------------------------------------------------------
//     const comment = await prisma.comment.create({
//         data: {
//             leadId,
//             leadAssignmentId,
//             type: type || "COMMENT",
//             description,
//             createdById: userId,
//             createdByName: userName,
//         },
//     });

//     const activity = await prisma.leadActivity.create({
//         data: {
//             leadId,
//             leadAssignmentId,
//             type: type || "COMMENT",
//             description,
//             performedById: userId,
//             performedByName: userName,
//             dueDate: dueDate ? new Date(dueDate) : null,
//         },
//     });

//     return { comment, activity };
// };

export const createCommentService = async ({
    leadId,
    leadAssignmentId, // incoming — NOT used for dealer users
    type,
    description,
    dueDate,
    userId,
    userName,
    roleName,
    userDealerId,
}) => {

    const isAdmin = canAccessAll(roleName);
    const isDealerUser = isDealerAdmin(roleName) || isSelfAccess(roleName);

    // ---------------------------------------------------------------------
    // CASE 1 → NO ASSIGNMENT: Only SUPER_ADMIN / ADMIN can comment
    // ---------------------------------------------------------------------
    if (!leadAssignmentId && isAdmin) {
        return await createCommentAndActivity({
            leadId,
            leadAssignmentId: null,
            type,
            description,
            dueDate,
            userId,
            userName,
        });
    }

    // ---------------------------------------------------------------------
    // CASE 2 → Dealer Admin / Self Access
    // They must ALWAYS use the *latest assignment* where THEIR dealer was assigned
    // EVEN IF inactive.
    // ---------------------------------------------------------------------
    if (isDealerUser) {
        const userLastAssignment = await prisma.leadAssignment.findFirst({
            where: {
                leadId,
                dealerId: userDealerId,
            },
            orderBy: { createdAt: "desc" },
            select: { id: true },
        });

        if (!userLastAssignment) {
            return { error: "NOT_ALLOWED" }; // dealer was never assigned this lead
        }

        return await createCommentAndActivity({
            leadId,
            leadAssignmentId: userLastAssignment.id,
            type,
            description,
            dueDate,
            userId,
            userName,
        });
    }

    // ---------------------------------------------------------------------
    // CASE 3 → SUPER ADMIN / ADMIN (assignment present)
    // they use the assignment provided by client
    // ---------------------------------------------------------------------
    if (isAdmin) {
        return await createCommentAndActivity({
            leadId,
            leadAssignmentId,
            type,
            description,
            dueDate,
            userId,
            userName,
        });
    }

    // ---------------------------------------------------------------------
    // Any other role → NOT ALLOWED
    // ---------------------------------------------------------------------
    return { error: "NOT_ALLOWED" };
};



// Helper function
const createCommentAndActivity = async ({
    leadId,
    leadAssignmentId,
    type,
    description,
    dueDate,
    userId,
    userName,
}) => {
    const comment = await prisma.comment.create({
        data: {
            leadId,
            leadAssignmentId,
            type: type || "COMMENT",
            description,
            createdById: userId,
            createdByName: userName,
        },
    });

    const activity = await prisma.leadActivity.create({
        data: {
            leadId,
            leadAssignmentId,
            type: type || "COMMENT",
            description,
            performedById: userId,
            performedByName: userName,
            dueDate: dueDate ? new Date(dueDate) : null,
        },
    });

    return { comment, activity };
};



// ---------------------------------------
// GET COMMENTS BY LEAD ID
// ---------------------------------------
// export const getCommentsByLeadIdService = async ({
//     leadId,
//     roleName,
//     userId,
//     userDealerId,
// }) => {
//     const assignments = await prisma.leadAssignment.findMany({
//         where: canAccessAll(roleName)
//             ? { leadId }
//             : {
//                 leadId,
//                 OR: [
//                     { dealerId: userDealerId },
//                     { assignedToId: userId },
//                 ],
//             },
//     });

//     if (!assignments.length) return { error: "NOT_ALLOWED" };

//     const comments = await prisma.comment.findMany({
//         where: {
//             leadId,
//             leadAssignmentId: { in: assignments.map((a) => a.id) },
//         },
//         orderBy: { createdAt: "desc" },
//     });

//     return { comments };
// };

export const getCommentsByLeadIdService = async ({
    leadId,
    roleName,
    userId,
    userDealerId,
}) => {
    const assignments = await prisma.leadAssignment.findMany({
        where: canAccessAll(roleName)
            ? { leadId }
            : {
                leadId,
                OR: [
                    { dealerId: userDealerId },
                    { assignedToId: userId },
                ],
            },
    });

    // CASE 1: Lead has NO assignments yet
    if (!assignments.length) {
        // Show comments with NULL assignmentId
        const comments = await prisma.comment.findMany({
            where: {
                leadId,
                leadAssignmentId: null
            },
            orderBy: { createdAt: "desc" },
        });

        return { comments };
    }

    // CASE 2: Lead has assignments → filter by those assignment IDs
    const comments = await prisma.comment.findMany({
        where: {
            leadId,
            leadAssignmentId: { in: assignments.map((a) => a.id) },
        },
        orderBy: { createdAt: "desc" },
    });

    return { comments };
};


// ---------------------------------------
// GET COMMENT BY ID
// ---------------------------------------
export const getCommentByIdService = async ({ id, roleName, userId, userDealerId }) => {
    const comment = await prisma.comment.findUnique({
        where: { id },
        include: {
            leadAssignment: true,
        },
    });

    if (!comment) return { error: "NOT_FOUND" };

    const assignment = comment.leadAssignment;

    if (
        !canAccessAll(roleName) &&
        assignment.dealerId !== userDealerId &&
        assignment.assignedToId !== userId
    ) {
        return { error: "NOT_ALLOWED" };
    }

    return { comment };
};

// ---------------------------------------
// UPDATE COMMENT
// ---------------------------------------
export const updateCommentService = async ({
    id,
    type,
    description,
    roleName,
    userId,
    userDealerId,
}) => {
    const comment = await prisma.comment.findUnique({
        where: { id },
        include: { leadAssignment: true },
    });

    if (!comment) return { error: "NOT_FOUND" };

    const assignment = comment.leadAssignment;

    if (
        !canAccessAll(roleName) &&
        assignment.dealerId !== userDealerId &&
        assignment.assignedToId !== userId
    ) {
        return { error: "NOT_ALLOWED" };
    }

    const updatedComment = await prisma.comment.update({
        where: { id },
        data: {
            type: type || comment.type,
            description: description || comment.description,
        },
    });

    return { updatedComment };
};

// ---------------------------------------
// DELETE COMMENT
// ---------------------------------------
export const deleteCommentService = async ({ id, roleName, userId, userDealerId }) => {
    const comment = await prisma.comment.findUnique({
        where: { id },
        include: { leadAssignment: true },
    });

    if (!comment) return { error: "NOT_FOUND" };

    const assignment = comment.leadAssignment;

    if (
        !canAccessAll(roleName) &&
        assignment.dealerId !== userDealerId &&
        assignment.assignedToId !== userId
    ) {
        return { error: "NOT_ALLOWED" };
    }

    await prisma.comment.delete({ where: { id } });

    return { success: true };
};
