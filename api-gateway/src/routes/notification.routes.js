import express from "express";
import proxy from "express-http-proxy";

const router = express.Router();
const NOTIFICATION_SERVICE = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3004";

// 🔑 Notifications routes
router.use(
    "/notifications",
    proxy(NOTIFICATION_SERVICE, {
        proxyReqPathResolver: (req) => `/notifications${req.url}`,
        proxyReqOptDecorator(proxyReqOpts, srcReq) {
            if (srcReq.user) {
                proxyReqOpts.headers["x-user-id"] = srcReq.user.id;
                proxyReqOpts.headers["x-user-name"] = srcReq.user.name;
                proxyReqOpts.headers["x-user-role"] = srcReq.user.role?.name || "GUEST";
                proxyReqOpts.headers["x-dealer-id"] = srcReq.user.dealerId || "";
            }

            return proxyReqOpts;
        },
    })
);

export default router;
