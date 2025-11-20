// services/fbToken.service.js
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import ms from "ms"; // optional for readable time checks

const prisma = new PrismaClient();
const GRAPH = "https://graph.facebook.com/v19.0";
const APP_ID = process.env.FB_APP_ID;
const APP_SECRET = process.env.FB_APP_SECRET;

/**
 * Exchange short-lived user token -> long-lived user token
 * (Use manually once if you have a short lived token)
 */
export const exchangeUserToken = async (shortLivedUserToken) => {
    const url = `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortLivedUserToken}`;
    const res = await axios.get(url);
    // res.data: { access_token, token_type, expires_in }
    return res.data;
};

/**
 * Save long-lived user token in DB (upsert)
 */
export const saveLongLivedUserToken = async ({ token, expires_in, userId = null }) => {
    const expiresAt = new Date(Date.now() + expires_in * 1000);
    const record = await prisma.fbUserToken.upsert({
        where: { userId: userId ?? "DEFAULT_USER" },
        update: { token, expiresAt },
        create: { userId: userId ?? "DEFAULT_USER", token, expiresAt },
    });
    return record;
};

/**
 * Fetch page tokens with a long-lived user token (/me/accounts)
 * and upsert them into FbPageToken table.
 */
export const seedPageTokensFromUserToken = async (longLivedUserToken) => {
    const url = `${GRAPH}/me/accounts?access_token=${longLivedUserToken}&limit=100`;
    const res = await axios.get(url);
    const pages = res.data.data || [];

    const saved = [];
    for (const p of pages) {
        // pages response includes access_token, id, name
        // Page tokens provided via this endpoint usually have long expiry; treat as 60 days
        const expiresInSeconds = 60 * 24 * 60 * 60; // 60 days as safe default
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

        // ensure user token exists in DB to set relation
        let userRecord = await prisma.fbUserToken.findFirst();
        if (!userRecord) {
            // if none found, create placeholder using provided token
            userRecord = await saveLongLivedUserToken({ token: longLivedUserToken, expires_in: expiresInSeconds });
        }

        const up = await prisma.fbPageToken.upsert({
            where: { pageId: p.id },
            update: {
                pageName: p.name,
                accessToken: p.access_token,
                expiresAt,
                userTokenId: userRecord.id,
            },
            create: {
                pageId: p.id,
                pageName: p.name,
                accessToken: p.access_token,
                expiresAt,
                userTokenId: userRecord.id,
            },
        });

        saved.push(up);
    }

    return saved;
};

/**
 * Refresh a single page token using a long-lived user token.
 * (GET /{page_id}?fields=access_token&access_token={LONG_LIVED_USER_TOKEN})
 */
export const refreshPageToken = async (pageId, longLivedUserToken) => {
    const url = `${GRAPH}/${pageId}?fields=access_token&access_token=${longLivedUserToken}`;
    const res = await axios.get(url);
    const newToken = res.data.access_token;
    // update DB expiry to 60 days from now
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    const updated = await prisma.fbPageToken.update({
        where: { pageId },
        data: { accessToken: newToken, expiresAt },
    });
    return updated;
};

/**
 * Refresh the long-lived user token using itself
 * (Exchange same token to generate a fresh long-lived token)
 * Note: this uses the same endpoint but fb sometimes returns same token until revoked.
 */
export const refreshLongLivedUserToken = async () => {
    // read current user token
    const userRecord = await prisma.fbUserToken.findFirst();
    if (!userRecord) throw new Error("No long-lived user token found in DB");

    const url = `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${userRecord.token}`;
    const res = await axios.get(url);
    const { access_token, expires_in } = res.data;

    const updated = await prisma.fbUserToken.update({
        where: { id: userRecord.id },
        data: { token: access_token, expiresAt: new Date(Date.now() + expires_in * 1000) },
    });

    // update page records' userTokenId if needed (not necessary but kept consistent)
    await prisma.fbPageToken.updateMany({ data: { userTokenId: updated.id } });

    return updated;
};

/**
 * Return a valid page token for pageId.
 * If the stored token is close to expiry (<1 hour), attempt to refresh it using the stored long-lived user token.
 */
export const getValidPageToken = async (pageId) => {
    const page = await prisma.fbPageToken.findUnique({ where: { pageId }, include: { userToken: true } });
    if (!page) throw new Error(`No token found for page ${pageId}`);

    // If token expires within 1 hour, refresh
    const oneHour = 60 * 60 * 1000;
    if (page.expiresAt.getTime() - Date.now() < oneHour) {
        if (!page.userToken) throw new Error(`No user token available to refresh page ${pageId}`);
        try {
            await refreshPageToken(pageId, page.userToken.token);
            const updated = await prisma.fbPageToken.findUnique({ where: { pageId } });
            return updated.accessToken;
        } catch (err) {
            console.error("Failed to refresh page token:", err?.response?.data || err.message);
            throw err;
        }
    }

    return page.accessToken;
};

/**
 * For cron: refresh all page tokens using the stored long-lived user token
 */
export const refreshAllPageTokens = async () => {
    const pages = await prisma.fbPageToken.findMany({ include: { userToken: true } });
    for (const p of pages) {
        if (!p.userToken) {
            console.warn("Skipping page token refresh (no userToken):", p.pageId);
            continue;
        }
        try {
            await refreshPageToken(p.pageId, p.userToken.token);
            console.log("Refreshed page token for", p.pageId);
        } catch (err) {
            console.error("Error refreshing token for", p.pageId, err?.response?.data || err.message);
        }
    }
};
