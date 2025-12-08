import LeadService from "../services/lead.service.js";

export const createLead = async (req, res) => {
    console.log("leadData at createLead controller:", req.body)
    try {
        const result = await LeadService.createLead({ leadData: req.body, user: req.user });
        res.status(201).json({ success: true, message: "Lead created", ...result });
    } catch (error) {
        console.error("Create Lead Error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to create lead" });
    }
};

export const getLeads = async (req, res) => {
    try {
        const leads = await LeadService.getLeads({ user: req.user, filters: req.query.filters });
        res.json({ success: true, count: leads.length, data: leads });
    } catch (error) {
        console.error("Get Leads Error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to fetch leads" });
    }
};

export const getLeadById = async (req, res) => {
    try {
        const lead = await LeadService.getLeadById({ id: req.params.id, user: req.user });
        res.json({ success: true, data: lead });
    } catch (error) {
        console.error("Get Lead Error:", error);
        res.status(404).json({ success: false, message: error.message });
    }
};

export const updateLead = async (req, res) => {
    try {
        const result = await LeadService.updateLead({
            leadId: req.params.id,
            data: req.body,
            user: req.user
        });

        res.json({
            success: true,
            message: "Lead updated successfully",
            ...result
        });
    } catch (error) {
        console.error("Update Lead Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update lead"
        });
    }
};


export const deleteLead = async (req, res) => {
    try {
        await LeadService.deleteLead({ id: req.params.id, user: req.user });
        res.json({ success: true, message: "Lead deleted successfully" });
    } catch (error) {
        console.error("Delete Lead Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// Bulk upload leads
// export const bulkUploadLeads = async (req, res) => {
//     try {
//         const { data } = req.body;

//         // console.log("data from request body:", data);

//         if (!data || !Array.isArray(data) || data.length === 0) {
//             return res.status(400).json({ success: false, message: "No data provided" });
//         }

//         // ✅ Required fields (dealerId is optional)
//         const REQUIRED_FIELDS = ["name"]; // keep minimal required
//         for (let i = 0; i < data.length; i++) {
//             const row = data[i];
//             const missing = REQUIRED_FIELDS.filter((f) => !(f in row) || !row[f]);
//             if (missing.length > 0) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Row ${i + 1} missing fields: ${missing.join(", ")}`
//                 });
//             }
//         }

//         // ✅ Assign nanoid + ensure optional dealerId
//         const leadsToInsert = data.map((lead) => ({
//             id: nanoid(10),
//             name: lead.name,
//             email: lead.email || null,
//             phone: lead.phone ? String(lead.phone) : null,
//             dealerId: lead.dealerId || null, // optional
//             // statusId: lead.statusId || "New", // fallback if you want a default
//             statusId: lead.statusId || DEFAULT_STATUS_ID,
//         }));

//         // ✅ Bulk insert
//         const inserted = await prisma.lead.createMany({
//             data: leadsToInsert,
//             skipDuplicates: true,
//         });

//         return res.json({ success: true, insertedCount: inserted.count });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, message: err.message || "Server Error" });
//     }
// };

// Bulk upload leads
// export const bulkUploadLeads = async (req, res) => {
//     try {
//         const { data } = req.body;

//         if (!data || !Array.isArray(data) || data.length === 0) {
//             return res.status(400).json({ success: false, message: "No data provided" });
//         }

//         // Minimal required fields
//         const REQUIRED_FIELDS = ["name"];
//         for (let i = 0; i < data.length; i++) {
//             const row = data[i];
//             const missing = REQUIRED_FIELDS.filter((f) => !(f in row) || !row[f]);
//             if (missing.length > 0) {
//                 return res.status(400).json({
//                     success: false,
//                     message: `Row ${i + 1} missing fields: ${missing.join(", ")}`
//                 });
//             }
//         }

//         const results = [];
//         const errors = [];

//         for (let i = 0; i < data.length; i++) {
//             const leadData = data[i];
//             try {
//                 // Call createLead service like in single lead
//                 const result = await LeadService.createLead({
//                     leadData,
//                     user: req.user
//                 });
//                 results.push(result.lead);
//             } catch (err) {
//                 errors.push({ row: i + 1, error: err.message });
//             }
//         }

//         return res.json({
//             success: true,
//             insertedCount: results.length,
//             errors
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, message: err.message || "Server Error" });
//     }
// };

export const bulkUploadLeads = async (req, res) => {
    try {
        const { data } = req.body;

        if (!data || !Array.isArray(data) || data.length === 0) {
            return res.status(400).json({ success: false, message: "No data provided" });
        }

        const REQUIRED_FIELDS = ["name"]; // minimal required
        const results = [];
        const errors = [];

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            // Check missing required fields
            const missing = REQUIRED_FIELDS.filter((f) => !(f in row) || !row[f]);
            if (missing.length > 0) {
                errors.push({ row: i + 1, error: `Missing fields: ${missing.join(", ")}` });
                continue;
            }

            // Ensure phone fields are strings
            if (row.phone) row.phone = String(row.phone);
            if (row.alternatePhone) row.alternatePhone = String(row.alternatePhone);

            // Ensure budget is number
            if (row.budget) row.budget = Number(row.budget);

            // Optional: parse createdAt if provided
            if (row.createdAt) {
                const dt = new Date(row.createdAt);
                row.createdAt = isNaN(dt.getTime()) ? undefined : dt.toISOString();
            }

            try {
                const result = await LeadService.createLead({ leadData: row, user: req.user });
                results.push(result.lead);
            } catch (err) {
                errors.push({ row: i + 1, error: err.message });
            }
        }

        const successCount = results.length;

        return res.json({
            success: successCount > 0,
            insertedCount: successCount,
            errors,
        });
    } catch (err) {
        console.error("Bulk upload error:", err);
        res.status(500).json({ success: false, message: err.message || "Server Error" });
    }
};
