import { fetchLeadFullDetails, fetchLeadsByFormId } from "../utils/fb.utils.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const processFbLead = async (leadData) => {
    const { leadgen_id: leadId, form_id: formId, page_id: pageId } = leadData;
    console.log("📥 Received FB Lead:", { leadId, formId, pageId });

    // Step 1: Get full lead details using valid token
    // const details = await fetchLeadDetails(leadId, pageId);
    const details = await fetchLeadFullDetails(leadId, pageId);

    // Step 2: Map data to LMS
    const lead = mapFbLeadToLmsLead(details);

    // Step 3: Save to DB
    await prisma.lead.create({ data: lead });
};

export const fetchLeadsByForm = async (formId, pageId) => {
    return await fetchLeadsByFormId(formId, pageId);
};

// const mapFbLeadToLmsLead = (fbLead) => {
//     console.log("fbLead:", fbLead)
//     const fieldData = fbLead.field_data?.reduce((acc, item) => {
//         acc[item.name] = item.values[0];
//         return acc;
//     }, {});

//     return {
//         id: fbLead.id,
//         name: fieldData.full_name || fieldData.name || "",
//         email: fieldData.email || "",
//         phone: fieldData.phone_number || "",
//         formId: fbLead.form_id,
//         createdAt: new Date(fbLead.created_time),
//         dealerId: null,
//         assignedToId: null,
//         assignedToName: null,
//         alternatePhone: null,
//         oldModel: null,
//         location: null,
//         city: null,
//         leadForwardedTo: [],
//         testDrive: false,
//         finance: false,
//         occupation: null,
//         budget: null,
//         category: "COLD",
//         source: "Facebook",
//     };
// };

const mapFbLeadToLmsLead = (fbLead) => {
    console.log("fbLead:", fbLead);

    // Normalize field labels (case-insensitive and spaces → underscores)
    const fieldData = fbLead.field_data?.reduce((acc, item) => {
        const key = item.name.toLowerCase().replace(/\s+/g, "_");
        acc[key] = item.values[0];
        return acc;
    }, {});

    return {
        id: fbLead.id,

        // Accept ALL possible name formats
        name:
            fieldData.full_name ||
            fieldData.name ||
            fieldData.fullname ||
            fieldData["full_name"] ||
            "",

        // Accept FB's "Phone Number"
        phone:
            fieldData.phone_number ||
            fieldData.phonenumber ||
            fieldData["phone_number"] ||
            fieldData["phone"] ||
            "",

        // Accept FB's "Email"
        email:
            fieldData.email ||
            fieldData["e-mail"] ||
            fieldData.mail ||
            "",

        formId: fbLead.form_id,
        createdAt: new Date(fbLead.created_time),

        dealerId: null,
        assignedToId: null,
        assignedToName: null,
        alternatePhone: null,
        oldModel: null,
        location: null,
        city: fieldData.city || null,

        leadForwardedTo: [],
        testDrive: false,
        finance: false,
        occupation: null,
        budget: null,
        category: "COLD",
        source: "Facebook",
    };
};

