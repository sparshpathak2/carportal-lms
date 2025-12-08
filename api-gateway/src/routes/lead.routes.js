import express from "express";
import proxy from "express-http-proxy";

const router = express.Router();
const LEADS_SERVICE =
    process.env.LEADS_MANAGEMENT_SERVICE_URL || "http://localhost:3003";

// Helper function to safely attach user headers
const attachUserHeaders = (proxyReqOpts, srcReq) => {
    if (srcReq.user) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.id;
        proxyReqOpts.headers["x-user-name"] = srcReq.user.name;
        proxyReqOpts.headers["x-user-role"] = srcReq.user.role?.name || "GUEST";
        proxyReqOpts.headers["x-dealer-id"] = srcReq.user.dealerId || "";
    }
    return proxyReqOpts;
};

// ✅ Leads routes
router.use(
    "/leads",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/leads${req.url}`,
        proxyReqOptDecorator: attachUserHeaders,
    })
);

// ✅ Customers routes
router.use(
    "/customers",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/customers${req.url}`,
        proxyReqOptDecorator: attachUserHeaders,
    })
);

// ✅ Lead activities routes
router.use(
    "/activities",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/activities${req.url}`,
        proxyReqOptDecorator: attachUserHeaders,
    })
);

// ✅ Lead statuses routes
router.use(
    "/statuses",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/statuses${req.url}`,
        proxyReqOptDecorator: attachUserHeaders,
    })
);

// ✅ Lead lead lost reasons routes
router.use(
    "/leadLostReasons",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/leadLostReasons${req.url}`,
        proxyReqOptDecorator: attachUserHeaders,
    })
);

// ✅ Lead sources routes
router.use(
    "/sources",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/sources${req.url}`,
        proxyReqOptDecorator: attachUserHeaders,
    })
);

// ✅ Lead filters routes
router.use(
    "/filters",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/filters${req.url}`,
        proxyReqOptDecorator: attachUserHeaders,
    })
);

// ✅ Lead comments routes
router.use(
    "/comments",
    proxy(LEADS_SERVICE, {
        proxyReqPathResolver: (req) => `/comments${req.url}`,
        proxyReqOptDecorator: attachUserHeaders,
    })
);

// 🚫 REMOVED: /integrations proxy
// because /api/integrations/fb/webhook is already handled directly in index.js (no auth)

export default router;
