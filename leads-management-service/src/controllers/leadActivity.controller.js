import {
    createActivityService,
    getActivitiesByLeadIdService,
    getActivityByIdService,
    updateActivityService,
    deleteActivityService,
} from "../services/leadActivity.service.js";

// ========================
// CREATE ACTIVITY
// ========================
export const createActivity = async (req, res) => {
    try {
        const {
            leadId,
            dealerAssignmentId,
            type,
            description,
            dueDate,
        } = req.body;

        const { role: { name: roleName }, dealerId: userDealerId, id: userId, name: userName } = req.user;

        const result = await createActivityService({
            leadId,
            dealerAssignmentId,
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

        if (result.error === "ASSIGNMENT_NOT_FOUND") {
            return res.status(404).json({ success: false, message: "Assignment not found" });
        }

        res.status(201).json({ success: true, data: result.activity });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

// ========================
// GET ACTIVITIES BY LEAD
// ========================
export const getActivitiesByLeadId = async (req, res) => {
    try {
        const leadId = req.params.id;
        const { role: { name: roleName }, dealerId: userDealerId } = req.user;

        const result = await getActivitiesByLeadIdService({
            leadId,
            roleName,
            userDealerId,
        });

        if (result.error === "NOT_ALLOWED") {
            return res.status(403).json({ success: false, message: "Not allowed" });
        }

        res.json({ success: true, data: result.activities });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

// ========================
// GET ACTIVITY BY ID
// ========================
export const getActivityById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role: { name: roleName }, dealerId: userDealerId } = req.user;

        const result = await getActivityByIdService({
            id,
            roleName,
            userDealerId,
        });

        if (result.error === "NOT_NOT_FOUND") {
            return res.status(404).json({ success: false });
        }

        if (result.error === "NOT_ALLOWED") {
            return res.status(403).json({ success: false });
        }

        res.json({ success: true, data: result.activity });
    } catch {
        res.status(500).json({ success: false });
    }
};

// ========================
// UPDATE ACTIVITY
// ========================
export const updateActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const { role: { name: roleName }, dealerId: userDealerId } = req.user;

        const result = await updateActivityService({
            id,
            data,
            roleName,
            userDealerId,
        });

        if (result.error === "NOT_FOUND") {
            return res.status(404).json({ success: false });
        }

        if (result.error === "NOT_ALLOWED") {
            return res.status(403).json({ success: false });
        }

        res.json({ success: true, data: result.activity });
    } catch {
        res.status(500).json({ success: false });
    }
};

// ========================
// DELETE ACTIVITY
// ========================
export const deleteActivity = async (req, res) => {
    try {
        const { id } = req.params;
        const { role: { name: roleName }, dealerId: userDealerId } = req.user;

        const result = await deleteActivityService({
            id,
            roleName,
            userDealerId,
        });

        if (result.error === "NOT_FOUND") {
            return res.status(404).json({ success: false });
        }

        if (result.error === "NOT_ALLOWED") {
            return res.status(403).json({ success: false });
        }

        res.json({ success: true, message: "Activity deleted" });
    } catch {
        res.status(500).json({ success: false });
    }
};
