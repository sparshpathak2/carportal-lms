// services/fbToken.service.js
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const GRAPH = "https://graph.facebook.com/v19.0";
const APP_ID = process.env.FB_APP_ID;
const APP_SECRET = process.env.FB_APP_SECRET;

/**
 * Exchange short-lived user token -> long-lived user token
 */
export const exchangeUserToken = async (shortLivedUserToken) => {
    const url = `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortLivedUserToken}`;
    const res = await axios.get(url);
    // res.data: { access_token, token_type, expires_in }
    return res.data;
};

/**
 * Save long-lived user token in DB (upsert by userId or default)
 */
// export const saveLongLivedUserToken = async ({ token, expires_in, userId = "DEFAULT_USER" }) => {
//     const expiresAt = new Date(Date.now() + expires_in * 1000);
//     const record = await prisma.fbUserToken.upsert({
//         where: { userId },
//         update: { token, expiresAt },
//         create: { userId, token, expiresAt },
//     });
//     return record;
// };

export const saveLongLivedUserToken = async ({ token, expires_in }) => {
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Always keep only ONE user token in table
    const existing = await prisma.fbUserToken.findFirst();

    if (existing) {
        return prisma.fbUserToken.update({
            where: { id: existing.id },
            data: { token, expiresAt },
        });
    }

    return prisma.fbUserToken.create({
        data: { token, expiresAt },
    });
};


/**
 * Seed Page tokens into DB using long-lived user token (/me/accounts)
 * Returns saved page rows.
 */
export const seedPageTokensFromUserToken = async (longLivedUserToken) => {
    const url = `${GRAPH}/me/accounts?access_token=${longLivedUserToken}&limit=100`;
    const res = await axios.get(url);
    const pages = res.data.data || [];

    let userRecord = await prisma.fbUserToken.findFirst();
    if (!userRecord) {
        // create user token entry if not exists (safe fallback)
        userRecord = await saveLongLivedUserToken({ token: longLivedUserToken, expires_in: 60 * 24 * 60 * 60 });
    }

    const saved = [];
    for (const p of pages) {
        // p.access_token is the page token
        const expiresSeconds = 60 * 24 * 60 * 60; // assume 60 days
        const expiresAt = new Date(Date.now() + expiresSeconds * 1000);

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
 * Refresh a single page token using long-lived user token
 */
export const refreshPageToken = async (pageId, longLivedUserToken) => {
    const url = `${GRAPH}/${pageId}?fields=access_token&access_token=${longLivedUserToken}`;
    const res = await axios.get(url);
    const newToken = res.data.access_token;
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
    const updated = await prisma.fbPageToken.update({
        where: { pageId },
        data: { accessToken: newToken, expiresAt },
    });
    return updated;
};

/**
 * Refresh stored long-lived user token (exchange using itself)
 */
export const refreshLongLivedUserToken = async () => {
    const userRecord = await prisma.fbUserToken.findFirst();
    if (!userRecord) throw new Error("No long-lived user token found");

    const url = `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${userRecord.token}`;
    const res = await axios.get(url);

    const { access_token, expires_in } = res.data;

    const updated = await prisma.fbUserToken.update({
        where: { id: userRecord.id },
        data: {
            token: access_token,
            expiresAt: new Date(Date.now() + expires_in * 1000),
        },
    });

    // Re-link all pages to this user token (safe)
    await prisma.fbPageToken.updateMany({
        data: { userTokenId: updated.id },
    });

    return updated;
};


/**
 * Get a valid page token. Refresh page token if expiring within 1 hour.
 */
export const getValidPageToken = async (pageId) => {
    const page = await prisma.fbPageToken.findUnique({
        where: { pageId },
        include: { userToken: true },
    });

    if (!page) throw new Error(`No token found for page ${pageId}`);
    if (!page.userToken) throw new Error("Page token missing reference to FbUserToken");

    const oneHour = 60 * 60 * 1000;

    // If about to expire → refresh
    if (page.expiresAt.getTime() - Date.now() < oneHour) {
        const updated = await refreshPageToken(pageId, page.userToken.token);
        return updated.accessToken;
    }

    return page.accessToken;
};


/**
 * Refresh all page tokens (cron)
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
