export const canAccessAll = (role) =>
    ["SUPER_ADMIN", "ADMIN"].includes(role);

export const isDealerAdmin = (role) =>
    role === "DEALER_ADMIN";

export const isSelfAccess = (role) =>
    ["CALLING", "DEALER_SALES"].includes(role);
