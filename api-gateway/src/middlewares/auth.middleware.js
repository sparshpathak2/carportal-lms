import axios from "axios";

const USER_SERVICE_URL = "http://127.0.0.1:3002";

export const authMiddleware = async (req, res, next) => {
    const publicRoutes = ["/login", "/signup"];

    // allow login/signup requests without session
    // if (publicRoutes.includes(req.path)) return next();
    if (publicRoutes.some(route => req.path.endsWith(route))) {
        return next();
    }

    const sessionId = req.cookies?.sessionId;
    if (!sessionId) {
        return res.status(401).json({ message: "Unauthorized: No session" });
    }

    try {
        const response = await axios.post(
            // `${process.env.USER_SERVICE_URL}/auth/verify-session`,
            `${USER_SERVICE_URL}/auth/verify-session`,
            { sessionId },
            { headers: { Cookie: req.headers.cookie } }
        );

        const { valid, user } = response.data;
        if (!valid || !user) {
            return res.status(401).json({ message: "Invalid session" });
        }

        req.user = user;

        console.log("user in req at auth:", req.user)

        req.headers["x-user-id"] = user.id;
        req.headers["x-user-name"] = user.name;
        req.headers["x-user-role"] = user.role?.name || "GUEST"; // ✅ single role
        req.headers["x-dealer-id"] = user.dealerId || null; // ✅ if dealer linked

        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.status(401).json({ message: "Auth check failed" });
    }
};
