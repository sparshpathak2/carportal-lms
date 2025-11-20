// scripts/initTokens.js
import "dotenv/config";
import { exchangeUserToken, saveLongLivedUserToken, seedPageTokensFromUserToken } from "../services/fbToken2.service.js";

const SHORT = process.env.FB_SHORT_LIVED_USER_TOKEN;
if (!SHORT) {
    console.error("Please set FB_SHORT_LIVED_USER_TOKEN in .env");
    process.exit(1);
}

(async () => {
    try {
        console.log("🔁 Exchanging short-lived user token to long-lived token...");
        const { access_token, expires_in } = await exchangeUserToken(SHORT);

        console.log("🔒 Saving long-lived user token to DB...");
        // await saveLongLivedUserToken({ token: access_token, expires_in, userId: "DEFAULT_USER" });
        await saveLongLivedUserToken({ token: access_token, expires_in });

        console.log("🌱 Seeding page tokens from long-lived user token...");
        const pages = await seedPageTokensFromUserToken(access_token);
        console.log("✅ Seeded page tokens:", pages.map(p => ({ pageId: p.pageId, pageName: p.pageName })));
        process.exit(0);
    } catch (err) {
        console.error("Init tokens failed:", err?.response?.data || err.message);
        process.exit(1);
    }
})();
