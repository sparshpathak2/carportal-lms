import {
    createPackService,
    getAllPacksService,
    getPackByIdService,
    getPacksByDealerService,
    removePackService,
    updatePackService,
} from "../services/pack.service.js";

export const createPack = async (req, res) => {
    try {
        const pack = await createPackService(req.body);
        return res.status(201).json({ success: true, data: pack });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

export const updatePack = async (req, res) => {
    try {
        const pack = await updatePackService(req.params.id, req.body);
        return res.status(200).json({ success: true, data: pack });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

// Get all packs
export const getAllPacks = async (req, res) => {
    try {
        const packs = await getAllPacksService();
        return res.status(200).json({ success: true, data: packs });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

// Get pack by ID
export const getPackById = async (req, res) => {
    try {
        const pack = await getPackByIdService(req.params.id);
        return res.status(200).json({ success: true, data: pack });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

// Delete pack by ID
export const removePack = async (req, res) => {
    try {
        const result = await removePackService(req.params.id);
        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};


export const getPackByDealerId = async (req, res) => {
    const { dealerId } = req.params;

    try {
        const packs = await getPacksByDealerService(dealerId);
        return res.status(200).json({ success: true, data: packs });
    } catch (err) {
        return res.status(404).json({ success: false, message: err.message });
    }
};