import prisma from "../lib/prisma.js";
import { nanoid } from "nanoid";

// Roles allowed to see/manage all leads
const canAccessAll = (role) =>
    ["SUPER_ADMIN", "ADMIN", "CALLING"].includes(role);

// ✅ Helper: format comment
const formatComment = (comment) => ({
    id: comment.id,
    leadId: comment.leadId,
    type: comment.type,
    description: comment.description,
    createdById: comment.createdById,
    createdByName: comment.createdByName,
    createdAt: comment.createdAt,
});

// ✅ Helper: log comment as activity
const logCommentActivity = async ({ leadId, performedById, performedByName, type, description }) => {
    return prisma.activity.create({
        data: {
            // id: nanoid(10),
            leadId,
            performedById,
            performedByName,
            type, // type matches comment type
            description: `Comment: ${description}`,
            oldStatus: null,
            newStatus: null,
            oldReason: null,
            newReason: null,
            oldAssignee: null,
            newAssignee: null,
        },
    });
};

// ========================
// Create a new comment
// ========================
// export const createComment = async (req, res) => {
//     try {
//         const roleName = req.user.role?.name;
//         const userDealerId = req.user.dealerId;
//         const userId = req.user?.id || "system";

//         const { leadId, type, description } = req.body;

//         if (!leadId || !description) {
//             return res
//                 .status(400)
//                 .json({ success: false, message: "leadId and description are required" });
//         }

//         const lead = await prisma.lead.findFirst({
//             where: canAccessAll(roleName)
//                 ? { id: leadId }
//                 : { id: leadId, dealerId: userDealerId },
//         });

//         if (!lead) {
//             return res
//                 .status(404)
//                 .json({ success: false, message: "Lead not found or not accessible" });
//         }

//         const comment = await prisma.comment.create({
//             data: {
//                 // id: nanoid(10),
//                 leadId,
//                 type: type || "REMARK",
//                 description,
//                 createdBy: userId,
//             },
//         });

//         // Log as activity
//         const activity = await logCommentActivity({
//             leadId,
//             performedBy: userId,
//             type: comment.type,
//             description: comment.description,
//         });

//         res.status(201).json({ success: true, data: { comment, activity } });
//     } catch (err) {
//         console.error("Create comment error:", err);
//         res.status(500).json({ success: false, message: "Failed to create comment" });
//     }
// };

export const createComment = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const userId = req.user?.id || null;
        const userName = req.user?.name || "System";

        const { leadId, type, description, dueDate } = req.body; // ✅ added dueDate

        if (!leadId || !description) {
            return res
                .status(400)
                .json({ success: false, message: "leadId and description are required" });
        }

        const lead = await prisma.lead.findFirst({
            where: canAccessAll(roleName)
                ? { id: leadId }
                : { id: leadId, dealerId: userDealerId },
        });

        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found or not accessible" });
        }

        const comment = await prisma.comment.create({
            data: {
                leadId,
                type: type || "COMMENT",
                description,
                // dueDate: dueDate ? new Date(dueDate) : null,
                createdById: userId,
                createdByName: userName,
            },
        });

        // Log as activity
        const activity = await logCommentActivity({
            leadId,
            performedById: userId,
            performedByName: userName,
            type: comment.type,
            description: comment.description,
            dueDate: dueDate ? new Date(dueDate) : null,
        });

        res.status(201).json({ success: true, data: { comment, activity } });
    } catch (err) {
        console.error("Create comment error:", err);
        res.status(500).json({ success: false, message: "Failed to create comment" });
    }
};


// ========================
// Get all comments for a lead
// ========================
export const getCommentsByLeadId = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const leadId = req.params.id;

        const lead = await prisma.lead.findFirst({
            where: canAccessAll(roleName)
                ? { id: leadId }
                : { id: leadId, dealerId: userDealerId },
        });

        if (!lead) {
            return res
                .status(404)
                .json({ success: false, message: "Lead not found or not accessible" });
        }

        const comments = await prisma.comment.findMany({
            where: { leadId },
            orderBy: { createdAt: "desc" },
        });

        res.json({ success: true, data: comments.map(formatComment) });
    } catch (err) {
        console.error("Get comments error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch comments" });
    }
};

// ========================
// Get single comment by ID
// ========================
export const getCommentById = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const { id } = req.params;

        const comment = await prisma.comment.findUnique({
            where: { id },
            include: { lead: true },
        });

        if (!comment) {
            return res
                .status(404)
                .json({ success: false, message: "Comment not found" });
        }

        if (!canAccessAll(roleName) && comment.lead.dealerId !== userDealerId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        res.json({ success: true, data: formatComment(comment) });
    } catch (err) {
        console.error("Get comment by ID error:", err);
        res.status(500).json({ success: false, message: "Failed to fetch comment" });
    }
};

// ========================
// Update comment by ID
// ========================
export const updateComment = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const userId = req.user?.id || "system";
        const { id } = req.params;
        const data = req.body;

        const comment = await prisma.comment.findUnique({
            where: { id },
            include: { lead: true },
        });

        if (!comment) {
            return res
                .status(404)
                .json({ success: false, message: "Comment not found" });
        }

        if (!canAccessAll(roleName) && comment.lead.dealerId !== userDealerId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const updatedComment = await prisma.comment.update({
            where: { id },
            data: {
                type: data.type || comment.type,
                description: data.description || comment.description,
            },
        });

        // Log update as activity
        const activity = await logCommentActivity({
            leadId: comment.leadId,
            performedBy: userId,
            type: updatedComment.type,
            description: `Updated comment: ${updatedComment.description}`,
        });

        res.json({ success: true, data: { updatedComment, activity } });
    } catch (err) {
        console.error("Update comment error:", err);
        res.status(500).json({ success: false, message: "Failed to update comment" });
    }
};

// ========================
// Delete comment by ID
// ========================
export const deleteComment = async (req, res) => {
    try {
        const roleName = req.user.role?.name;
        const userDealerId = req.user.dealerId;
        const { id } = req.params;

        const comment = await prisma.comment.findUnique({
            where: { id },
            include: { lead: true },
        });

        if (!comment) {
            return res
                .status(404)
                .json({ success: false, message: "Comment not found" });
        }

        if (!canAccessAll(roleName) && comment.lead.dealerId !== userDealerId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        await prisma.comment.delete({ where: { id } });

        res.json({ success: true, message: "Comment deleted successfully" });
    } catch (err) {
        console.error("Delete comment error:", err);
        res.status(500).json({ success: false, message: "Failed to delete comment" });
    }
};
