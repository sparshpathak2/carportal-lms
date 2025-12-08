import {
    createCommentService,
    getCommentsByLeadIdService,
    getCommentByIdService,
    updateCommentService,
    deleteCommentService,
} from "../services/leadComment.service.js";

export const createComment = async (req, res) => {
    try {
        const { leadId, leadAssignmentId, type, description, dueDate } = req.body;
        const { role: { name: roleName }, dealerId: userDealerId, id: userId, name: userName } = req.user;

        const result = await createCommentService({
            leadId,
            leadAssignmentId,
            type,
            description,
            dueDate,
            roleName,
            userDealerId,
            userId,
            userName,
        });

        if (result.error === "NOT_ALLOWED") {
            return res.status(403).json({ success: false, message: "Not allowed" });
        }

        res.status(201).json({ success: true, data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
};

export const getCommentsByLeadId = async (req, res) => {
    try {
        const leadId = req.params.id;
        const { role: { name: roleName }, dealerId: userDealerId, id: userId } = req.user;

        const result = await getCommentsByLeadIdService({
            leadId,
            roleName,
            userDealerId,
            userId,
        });

        if (result.error === "NOT_ALLOWED") {
            return res.status(403).json({ success: false, message: "Not allowed" });
        }

        res.json({ success: true, data: result.comments });
    } catch (err) {
        console.log("err:", err)
        res.status(500).json({ success: false });
    }
};

export const getCommentById = async (req, res) => {
    try {
        const id = req.params.id;
        const { role: { name: roleName }, dealerId: userDealerId, id: userId } = req.user;

        const result = await getCommentByIdService({ id, roleName, userDealerId, userId });

        if (result.error === "NOT_FOUND") return res.status(404).json({ success: false });
        if (result.error === "NOT_ALLOWED") return res.status(403).json({ success: false });

        res.json({ success: true, data: result.comment });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, description } = req.body;
        const { role: { name: roleName }, dealerId: userDealerId, id: userId } = req.user;

        const result = await updateCommentService({
            id,
            type,
            description,
            roleName,
            userDealerId,
            userId,
        });

        if (result.error === "NOT_FOUND") return res.status(404).json({ success: false });
        if (result.error === "NOT_ALLOWED") return res.status(403).json({ success: false });

        res.json({ success: true, data: result.updatedComment });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { role: { name: roleName }, dealerId: userDealerId, id: userId } = req.user;

        const result = await deleteCommentService({ id, roleName, userDealerId, userId });

        if (result.error === "NOT_FOUND") return res.status(404).json({ success: false });
        if (result.error === "NOT_ALLOWED") return res.status(403).json({ success: false });

        res.json({ success: true, message: "Comment deleted" });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};
