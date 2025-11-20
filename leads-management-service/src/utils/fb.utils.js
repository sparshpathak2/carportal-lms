// import axios from "axios";

// const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";
// const ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

// export const fetchLeadDetails = async (leadId) => {
//     const url = `${GRAPH_API_BASE}/${leadId}?access_token=${ACCESS_TOKEN}`;
//     const res = await axios.get(url);
//     return res.data;
// };

// export const fetchLeadDetails = async (leadId) => {
//     const url = `${GRAPH_API_BASE}/${leadId}?access_token=${ACCESS_TOKEN}`;
//     try {
//         const res = await axios.get(url);
//         return res.data;
//     } catch (err) {
//         console.error("🔥 FB ERROR:", err?.response?.data);
//         throw err;
//     }
// };


// export const fetchLeadsByFormId = async (formId) => {
//     const url = `${GRAPH_API_BASE}/${formId}/leads?access_token=${ACCESS_TOKEN}`;
//     const res = await axios.get(url);
//     return res.data;
// };

// import axios from "axios";
// import { getValidPageToken } from "../services/fbToken.service.js";

// const GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

// export const fetchLeadDetails = async (leadId, pageId) => {
//     const token = await getValidPageToken(pageId);
//     const url = `${GRAPH_API_BASE}/${leadId}?access_token=${token}`;
//     const res = await axios.get(url);
//     return res.data;
// };

// export const fetchLeadsByFormId = async (formId, pageId) => {
//     const token = await getValidPageToken(pageId);
//     const url = `${GRAPH_API_BASE}/${formId}/leads?access_token=${token}`;
//     const res = await axios.get(url);
//     return res.data;
// };



// utils/fb.utils.js
import axios from "axios";

const GRAPH = "https://graph.facebook.com/v19.0";
const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

// --- Fetch full lead including ad hierarchy ids ---
export const fetchLeadFullDetails = async (leadId) => {
    const url = `${GRAPH}/${leadId}?fields=id,created_time,field_data,form_id,ad_id,adset_id,campaign_id&access_token=${TOKEN}`;

    const res = await axios.get(url);
    return res.data;
};

// --- Fetch Ad Name ---
export const fetchAdName = async (adId) => {
    const url = `${GRAPH}/${adId}?fields=name&access_token=${TOKEN}`;
    const res = await axios.get(url);
    return res.data.name;
};

// --- Fetch Adset Name ---
export const fetchAdsetName = async (adsetId) => {
    const url = `${GRAPH}/${adsetId}?fields=name&access_token=${TOKEN}`;
    const res = await axios.get(url);
    return res.data.name;
};

// --- Fetch Campaign Name ---
export const fetchCampaignName = async (campaignId) => {
    const url = `${GRAPH}/${campaignId}?fields=name&access_token=${TOKEN}`;
    const res = await axios.get(url);
    return res.data.name;
};

// --- Fetch leads for a form ---
export const fetchLeadsByFormId = async (formId) => {
    const url = `${GRAPH}/${formId}/leads?access_token=${TOKEN}`;
    const res = await axios.get(url);
    return res.data;
};
