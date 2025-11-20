// controllers/integrations.controller.js
import * as integrationService from "../services/integration2.service.js";

/**
 * Step 1: Facebook verification handshake (GET)
 * FB will call this URL to verify your webhook
 */
export const verifyWebhook = (req, res) => {
    const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ FB Webhook verified successfully");
        return res.status(200).send(challenge);
    }

    console.warn("❌ FB Webhook verification failed");
    return res.sendStatus(403);
};

/**
 * Step 2: Handle incoming webhook events (POST)
 * FB sends leadgen updates here
 */
export const handleWebhook = async (req, res) => {
    try {
        console.log("📩 Received Facebook webhook POST request");
        console.log("🔹 Raw body:", JSON.stringify(req.body, null, 2));

        const body = req.body;

        // Verify this is a page object
        if (body.object !== "page") {
            console.warn("⚠️ Ignoring non-page event:", body.object);
            return res.sendStatus(404);
        }

        for (const entry of body.entry || []) {
            console.log(`➡️ Processing entry for page_id: ${entry.id}`);

            for (const change of entry.changes || []) {
                console.log(`🔸 Change detected: field=${change.field}`);

                if (change.field === "leadgen") {
                    console.log("💡 Leadgen event received!");
                    console.log("🧾 Lead payload:", JSON.stringify(change.value, null, 2));

                    const { leadgen_id: leadId, form_id: formId, page_id: pageId } = change.value;

                    try {
                        // Process lead (handles token expiration internally)
                        await integrationService.processFbLead({ leadgen_id: leadId, form_id: formId, page_id: pageId });
                        console.log(`✅ Successfully processed lead: ${leadId}`);
                    } catch (err) {
                        console.error(`❌ Error processing FB lead ${leadId}:`, err.message);
                    }
                } else {
                    console.log(`⚠️ Skipping non-leadgen field: ${change.field}`);
                }
            }
        }

        // Acknowledge receipt
        res.status(200).send("EVENT_RECEIVED");
        console.log("📬 Response sent to Facebook: EVENT_RECEIVED");
    } catch (err) {
        console.error("❌ Error handling FB webhook:", err.stack || err.message);
        res.sendStatus(500);
    }
};

/**
 * Step 3: Optional manual fetch of leads for debugging
 * Use query params: ?form_id=<FORM_ID>&page_id=<PAGE_ID>
 */
export const getFbLeads = async (req, res) => {
    try {
        const formId = req.query.form_id;
        const pageId = req.query.page_id;

        if (!formId || !pageId) {
            return res.status(400).json({ error: "form_id and page_id are required" });
        }

        const leads = await integrationService.fetchLeadsByForm(formId, pageId);
        res.json(leads);
    } catch (err) {
        console.error("❌ Error fetching FB leads:", err.stack || err.message);
        res.status(500).json({ error: err.message });
    }
};
