// services/integration.service.js
import {
    fetchLeadFullDetails,
    fetchAdName,
    fetchAdsetName,
    fetchCampaignName,
    fetchLeadsByFormId,
} from "../utils/fb.utils.js";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const processFbLead = async ({ leadId, formId, pageId }) => {
    console.log("📥 Processing FB Lead:", { leadId, formId, pageId });

    // 👉 Step 1: Get full lead metadata
    const fbLead = await fetchLeadFullDetails(leadId);

    // 👉 Step 2: Extract marketing hierarchy IDs
    const adId = fbLead.ad_id || null;
    const adsetId = fbLead.adset_id || null;
    const campaignId = fbLead.campaign_id || null;

    console.log("📊 FB Lead Metadata:", { adId, adsetId, campaignId });

    // 👉 Step 3: Fetch names (only if your business has access)
    let adName = null,
        adsetName = null,
        campaignName = null;

    try {
        if (adId) adName = await fetchAdName(adId);
        if (adsetId) adsetName = await fetchAdsetName(adsetId);
        if (campaignId) campaignName = await fetchCampaignName(campaignId);
    } catch (err) {
        console.warn("⚠️ Could not fetch ad hierarchy names:", err.message);
    }

    // 👉 Step 4: Map to your LMS lead format
    const lead = mapFbLeadToLmsLead(fbLead, {
        adId,
        adsetId,
        campaignId,
        adName,
        adsetName,
        campaignName,
    });

    // 👉 Step 5: Save in DB
    await prisma.lead.create({ data: lead });

    console.log("✅ Lead stored in LMS:", lead.id);
};

export const fetchLeadsByForm = async (formId, pageId) => {
    return await fetchLeadsByFormId(formId, pageId);
};

const mapFbLeadToLmsLead = (fbLead, marketingMeta) => {
    const normalize = (s) => s.toLowerCase().replace(/\s+/g, "_");

    const fieldData = fbLead.field_data?.reduce((acc, item) => {
        const key = normalize(item.name);
        acc[key] = item.values?.[0] || "";
        return acc;
    }, {});

    return {
        id: fbLead.id,

        name:
            fieldData.full_name ||
            fieldData.name ||
            fieldData.fullname ||
            "",

        phone:
            fieldData.phone_number ||
            fieldData.phonenumber ||
            fieldData.phone ||
            "",

        email:
            fieldData.email ||
            fieldData.mail ||
            "",

        city: fieldData.city || null,

        formId: fbLead.form_id,
        createdAt: new Date(fbLead.created_time),

        // 🎯 NEW FIELDS
        adId: marketingMeta.adId,
        adsetId: marketingMeta.adsetId,
        campaignId: marketingMeta.campaignId,

        adName: marketingMeta.adName,
        adsetName: marketingMeta.adsetName,
        campaignName: marketingMeta.campaignName,

        dealerId: null,
        assignedToId: null,
        assignedToName: null,
        alternatePhone: null,
        location: null,
        oldModel: null,
        leadForwardedTo: [],
        testDrive: false,
        finance: false,
        occupation: null,
        budget: null,
        category: "COLD",
        source: "Facebook",
    };
};
