// role.ts
export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "DEALER_ADMIN"
  | "CALLING"
  | "DEALER_SALES"
  | string; // fallback for any other roles

/**
 * Check if the role has access to all leads / data
 */
export const canAccessAll = (role: UserRole): boolean =>
  ["SUPER_ADMIN", "ADMIN"].includes(role);

/**
 * Check if the role is a Dealer Admin
 */
export const isDealerAdmin = (role: UserRole): boolean =>
  role === "DEALER_ADMIN";

/**
 * Check if the role is a self-access user (sales / calling)
 */
export const isSelfAccess = (role: UserRole): boolean =>
  ["CALLING", "DEALER_SALES"].includes(role);
