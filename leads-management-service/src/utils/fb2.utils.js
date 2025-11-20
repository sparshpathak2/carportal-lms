// utils/fb.utils.js
import axios from "axios";
import { getValidPageToken } from "../services/fbToken2.service.js";

const GRAPH = "https://graph.facebook.com/v19.0";

/**
 * Fetch full lead including ad/campaign ids using page token
 */
export const fetchLeadFullDetails = async (leadId, pageId) => {
    const token = await getValidPageToken(pageId);
    const url = `${GRAPH}/${leadId}?fields=id,created_time,field_data,form_id,ad_id,adset_id,campaign_id&access_token=${token}`;
    const res = await axios.get(url);
    return res.data;
};

export const fetchLeadsByFormId = async (formId, pageId) => {
    const token = await getValidPageToken(pageId);
    const url = `${GRAPH}/${formId}/leads?access_token=${token}`;
    const res = await axios.get(url);
    return res.data;
};

export const fetchAdName = async (adId, pageId) => {
    const token = await getValidPageToken(pageId);
    const url = `${GRAPH}/${adId}?fields=name&access_token=${token}`;
    const res = await axios.get(url);
    return res.data.name;
};

export const fetchAdsetName = async (adsetId, pageId) => {
    const token = await getValidPageToken(pageId);
    const url = `${GRAPH}/${adsetId}?fields=name&access_token=${token}`;
    const res = await axios.get(url);
    return res.data.name;
};

export const fetchCampaignName = async (campaignId, pageId) => {
    const token = await getValidPageToken(pageId);
    const url = `${GRAPH}/${campaignId}?fields=name&access_token=${token}`;
    const res = await axios.get(url);
    return res.data.name;
};
