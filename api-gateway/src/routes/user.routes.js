import express from "express";
import proxy from "express-http-proxy";

const router = express.Router();
const USER_AUTH_SERVICE = process.env.USER_SERVICE_URL || "http://localhost:3002";

// 🔑 Auth routes
router.use(
    "/auth",
    proxy(USER_AUTH_SERVICE, {
        proxyReqPathResolver: (req) => `/auth${req.url}`,
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

// 👤 User management routes
router.use(
    "/users",
    proxy(USER_AUTH_SERVICE, {
        proxyReqPathResolver: (req) => `/users${req.url}`,
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

// 👤 Dealer management routes
router.use(
    "/dealers",
    proxy(USER_AUTH_SERVICE, {
        proxyReqPathResolver: (req) => `/dealers${req.url}`,
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
