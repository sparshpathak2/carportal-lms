import express from "express";
import proxy from "express-http-proxy";

const router = express.Router();
const USER_AUTH_SERVICE = process.env.USER_SERVICE_URL || "http://localhost:3002";

// Reusable Header
const forwardUserHeaders = (proxyReqOpts, srcReq) => {
    if (srcReq.user) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.id;
        proxyReqOpts.headers["x-user-name"] = srcReq.user.name;
        proxyReqOpts.headers["x-user-role"] = srcReq.user.role?.name || "GUEST";
        proxyReqOpts.headers["x-dealer-id"] = srcReq.user.dealerId || "";
    }
    return proxyReqOpts;
};


// Reusable Proxy
const buildProxy = (basePath) =>
    proxy(USER_AUTH_SERVICE, {
        proxyReqPathResolver: (req) => `${basePath}${req.url}`,
        proxyReqOptDecorator: forwardUserHeaders,
    });


// 🔑 Auth
router.use("/auth", buildProxy("/auth"));


// 👤 Users
router.use("/users", buildProxy("/users"));


// 🏢 Dealers
router.use("/dealers", buildProxy("/dealers"));


// Packs
router.use("/packs", buildProxy("/packs"));


export default router;
