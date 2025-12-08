import {
    assignDealerOwnerService,
    removeDealerOwnerService,
    getDealerOwnerService
} from "../services/dealerOwner.service.js";

export const assignDealerOwner = async (req, res) => {
    try {
        const { dealerId, userId } = req.params;   // ✅ FIXED

        const result = await assignDealerOwnerService(dealerId, userId);

        return res.status(201).json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("assignDealerOwner:", error);
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


export const removeDealerOwner = async (req, res) => {
    try {
        const { dealerId } = req.params;

        const result = await removeDealerOwnerService(dealerId);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export const getDealerOwner = async (req, res) => {
    try {
        const { dealerId } = req.params;

        const result = await getDealerOwnerService(dealerId);

        return res.status(200).json({
            success: true,
            data: result
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
