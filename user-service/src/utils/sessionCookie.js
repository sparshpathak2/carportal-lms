// src/utils/sessionCookie.js

export function setSessionCookie(req, res, sessionId, options = {}) {
    const { maxAge = 1000 * 60 * 30 } = options;

    /**
     * Detect HTTPS correctly (proxy-safe)
     */
    const isHttps =
        req.secure === true ||
        req.headers["x-forwarded-proto"] === "https";

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("sessionId", sessionId, {
        httpOnly: true,
        secure: isProduction && isHttps,
        sameSite: isProduction && isHttps ? "none" : "lax",
        maxAge,
        path: "/",
    });
}

export function clearSessionCookie(req, res) {
    const isHttps =
        req.secure === true ||
        req.headers["x-forwarded-proto"] === "https";

    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("sessionId", {
        httpOnly: true,
        secure: isProduction && isHttps,
        sameSite: isProduction && isHttps ? "none" : "lax",
        path: "/",
    });
}
