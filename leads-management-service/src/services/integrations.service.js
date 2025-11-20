import { fetchLeadDetails, fetchLeadsByFormId } from "../utils/fb.utils.js";

// This runs whenever Facebook sends a lead notification
export const processFbLead = async (leadData) => {
    const { leadgen_id: leadId, form_id: formId, page_id: pageId } = leadData;
    console.log("📥 Received FB Lead:", { leadId, formId, pageId });

    // Step 1: Get full lead details
    const details = await fetchLeadDetails(leadId);

    // Step 2: Map data to your LMS schema
    const lead = mapFbLeadToLmsLead(details);

    // Step 3: Save to DB or send to LMS
    await saveLeadToDbOrLms(lead);
};

// Optional manual fetch
export const fetchLeadsByForm = async (formId) => {
    return await fetchLeadsByFormId(formId);
};

// 🧩 Helper: Transform Facebook fields → your internal structure
const mapFbLeadToLmsLead = (fbLead) => {
    const fieldData = fbLead.field_data?.reduce((acc, item) => {
        acc[item.name] = item.values[0];
        return acc;
    }, {});

    return {
        name: fieldData.full_name || fieldData.name || "",
        email: fieldData.email || "",
        phone: fieldData.phone_number || "",
        formId: fbLead.form_id,
        leadId: fbLead.id,
        createdAt: fbLead.created_time,
    };
};

// 🧠 This could be a DB call or internal API call
const saveLeadToDbOrLms = async (lead) => {
    console.log("💾 Saving lead:", lead);
    // Example: use axios to send to internal LMS microservice
    // await axios.post(`${process.env.LMS_SERVICE_URL}/leads`, lead);
};
