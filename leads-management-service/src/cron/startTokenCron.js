// cron/startTokenCron.js
import cron from "node-cron";
import { refreshAllPageTokens, refreshLongLivedUserToken } from "../services/fbToken.service.js";

export const startTokenCron = () => {

    // Test to check if cron job has run
    // cron.schedule("* * * * *", () => {
    //     console.log("⏰ Cron test running every minute");
    // });

    // Refresh page tokens every 12 hours
    cron.schedule("0 */12 * * *", async () => {
        console.log("🔁 Cron: Refresh all page tokens");
        try {
            await refreshAllPageTokens();
            console.log("🔁 Done: page tokens refreshed");
        } catch (err) {
            console.error("Cron error refreshing page tokens:", err?.message || err);
        }
    });

    // Refresh long-lived user token every 50 days (run daily check is safer)
    cron.schedule("0 3 */50 * *", async () => {
        console.log("🔁 Cron: Refresh long-lived user token");
        try {
            await refreshLongLivedUserToken();
            console.log("🔁 Done: long-lived user token refreshed");
        } catch (err) {
            console.error("Cron error refreshing long-lived user token:", err?.message || err);
        }
    });
};
