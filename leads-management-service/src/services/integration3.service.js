// services/integration.service.js
import { PrismaClient } from "@prisma/client";
import {
    fetchLeadFullDetails,
    fetchAdName,
    fetchAdsetName,
    fetchCampaignName,
    fetchLeadsByFormId,
} from "../utils/fb2.utils.js";

const prisma = new PrismaClient();

const DEFAULT_STATUS_ID = "Xa9fK3D2Lp";

export const processFbLead = async ({ leadId, formId, pageId }) => {
    console.log("📥 Processing FB Lead:", { leadId, formId, pageId });

    // 1) Fetch lead details (includes ad_id/adset_id/campaign_id)
    const fbLead = await fetchLeadFullDetails(leadId, pageId);

    const adId = fbLead.ad_id || null;
    const adsetId = fbLead.adset_id || null;
    const campaignId = fbLead.campaign_id || null;

    // 2) Best-effort fetch names (may fail if token lacks ads perms)
    let adName = null, adsetName = null, campaignName = null;
    try {
        if (adId) adName = await fetchAdName(adId, pageId);
        if (adsetId) adsetName = await fetchAdsetName(adsetId, pageId);
        if (campaignId) campaignName = await fetchCampaignName(campaignId, pageId);
    } catch (err) {
        console.warn("⚠️ Cannot fetch marketing names (ads perms?):", err?.response?.data || err.message);
    }

    // 3) Normalize field_data to key/value
    const fieldData = (fbLead.field_data || []).reduce((acc, item) => {
        const key = item.name.toLowerCase().replace(/\s+/g, "_");
        acc[key] = item.values?.[0] || "";
        return acc;
    }, {});

    // 4) Build lead payload matching your Prisma Lead model
    const leadPayload = {
        id: fbLead.id,
        name: fieldData.full_name || fieldData.name || fieldData.fullname || "",
        email: fieldData.email || fieldData.mail || "",
        phone: fieldData.phone_number || fieldData.phonenumber || fieldData.phone || "",
        alternatePhone: null,
        oldModel: fieldData.model || null,
        location: fieldData.outlet_name || null,
        city: fieldData.city || null,
        leadForwardedTo: [],
        testDrive: false,
        finance: false,
        occupation: null,
        budget: null,
        category: "COLD",
        source: "Facebook",
        createdAt: new Date(fbLead.created_time),
        updatedAt: new Date(),
        statusId: DEFAULT_STATUS_ID,

        // marketing meta
        adId,
        adsetId,
        campaignId,
        adName,
        adsetName,
        campaignName,
    };

    // 5) Save (upsert to prevent duplicates)
    await prisma.lead.upsert({
        where: { id: leadPayload.id },
        create: leadPayload,
        update: leadPayload,
    });

    console.log("✅ Lead saved:", leadPayload.id);
};

export const fetchLeadsByForm = async (formId, pageId) => {
    const payload = await fetchLeadsByFormId(formId, pageId);
    return payload;
};
