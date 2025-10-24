export const attachUser = (req, res, next) => {
    if (req.headers["x-user-id"]) {
        req.user = {
            id: req.headers["x-user-id"],
            role: { name: req.headers["x-user-role"] },
            dealerId: req.headers["x-dealer-id"] || null,
        };
    }
    next();
};
