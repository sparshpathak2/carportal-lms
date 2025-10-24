import express from "express";
import proxy from "express-http-proxy";

const router = express.Router();
const LEADS_SERVICE = process.env.LEADS_MANAGEMENT_SERVICE_URL || "http://localhost:3003";

// 👤 User management routes
router.use(
    "/leads",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/leads${req.url}`,
        proxyReqOptDecorator(proxyReqOpts, srcReq) {
            // if (srcReq.user) {
            //     proxyReqOpts.headers["x-user-id"] = srcReq.user.id;
            //     proxyReqOpts.headers["x-user-role"] = srcReq.user.role;
            //     proxyReqOpts.headers["x-dealer-id"] = srcReq.user.dealerId;
            // }
            // safely forward user id + role headers
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

router.use(
    "/activities",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/activities${req.url}`,
        proxyReqOptDecorator(proxyReqOpts, srcReq) {
            // if (srcReq.user) {
            //     proxyReqOpts.headers["x-user-id"] = srcReq.user.id;
            //     proxyReqOpts.headers["x-user-role"] = srcReq.user.role;
            //     proxyReqOpts.headers["x-dealer-id"] = srcReq.user.dealerId;
            // }
            // safely forward user id + role headers
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

router.use(
    "/statuses",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/statuses${req.url}`,
        proxyReqOptDecorator(proxyReqOpts, srcReq) {
            // if (srcReq.user) {
            //     proxyReqOpts.headers["x-user-id"] = srcReq.user.id;
            //     proxyReqOpts.headers["x-user-role"] = srcReq.user.role;
            //     proxyReqOpts.headers["x-dealer-id"] = srcReq.user.dealerId;
            // }
            // safely forward user id + role headers
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

router.use(
    "/comments",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/comments${req.url}`,
        proxyReqOptDecorator(proxyReqOpts, srcReq) {
            // if (srcReq.user) {
            //     proxyReqOpts.headers["x-user-id"] = srcReq.user.id;
            //     proxyReqOpts.headers["x-user-role"] = srcReq.user.role;
            //     proxyReqOpts.headers["x-dealer-id"] = srcReq.user.dealerId;
            // }
            // safely forward user id + role headers
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
