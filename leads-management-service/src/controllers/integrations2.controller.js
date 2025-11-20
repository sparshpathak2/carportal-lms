// controllers/integrations.controller.js
import * as integrationService from "../services/integration3.service.js";

export const verifyWebhook = (req, res) => {
    const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ FB webhook verified");
        return res.status(200).send(challenge);
    }
    console.warn("❌ FB webhook verify failed");
    return res.sendStatus(403);
};

export const handleWebhook = async (req, res) => {
    try {
        console.log("📩 Received Facebook webhook POST request");
        console.log("🔹 Raw body:", JSON.stringify(req.body, null, 2));

        const body = req.body;
        if (body.object !== "page") return res.sendStatus(404);

        for (const entry of body.entry || []) {
            for (const change of entry.changes || []) {
                if (change.field !== "leadgen") continue;
                const { leadgen_id, form_id, page_id } = change.value;
                try {
                    await integrationService.processFbLead({ leadId: leadgen_id, formId: form_id, pageId: page_id });
                } catch (err) {
                    console.error("❌ Error processing lead:", err?.message || err);
                }
            }
        }

        res.status(200).send("EVENT_RECEIVED");
    } catch (err) {
        console.error("Webhook handler error:", err);
        res.sendStatus(500);
    }
};

export const getFbLeads = async (req, res) => {
    try {
        const { form_id, page_id } = req.query;
        if (!form_id || !page_id) return res.status(400).json({ error: "form_id & page_id required" });
        const leads = await integrationService.fetchLeadsByForm(form_id, page_id);
        res.json(leads);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
