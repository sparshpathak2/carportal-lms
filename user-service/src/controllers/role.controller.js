import prisma from "../lib/prisma.js";
import { nanoid } from "nanoid";

// ------------------------------------
// ✅ Get all roles
// ------------------------------------
export const getRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany();
        return res.status(200).json({ success: true, data: roles });
    } catch (err) {
        console.error("GetRoles Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ------------------------------------
// ✅ Get single role by ID
// ------------------------------------
export const getRoleById = async (req, res) => {
    const { id } = req.params;

    try {
        const role = await prisma.role.findUnique({
            where: { id },
        });

        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found" });
        }

        return res.status(200).json({ success: true, data: role });
    } catch (err) {
        console.error("GetRoleById Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ------------------------------------
// ✅ Create new role
// ------------------------------------
export const createRole = async (req, res) => {
    try {
        const { name, roleType } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        // Validate roleType
        const validTypes = ["INTERNAL", "DEALER"];
        if (roleType && !validTypes.includes(roleType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid roleType. Must be INTERNAL or DEALER",
            });
        }

        // Check if role name already exists
        const existing = await prisma.role.findFirst({
            where: { name },
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "Role name already exists" });
        }

        const newRole = await prisma.role.create({
            data: {
                id: nanoid(10),
                name,
                roleType: roleType || "DEALER", // default fallback
            },
        });

        return res.status(201).json({
            success: true,
            message: "Role created successfully",
            data: newRole,
        });
    } catch (err) {
        console.error("CreateRole Error:", err);

        if (err.code === "P2002") {
            return res.status(400).json({ success: false, message: "Role already exists" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
};

// ------------------------------------
// ✅ Update role by ID
// ------------------------------------
export const updateRole = async (req, res) => {
    const { id } = req.params;
    const { name, roleType } = req.body;

    try {
        const role = await prisma.role.findUnique({ where: { id } });

        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found" });
        }

        // Validate roleType
        const validTypes = ["INTERNAL", "DEALER"];
        if (roleType && !validTypes.includes(roleType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid roleType. Must be INTERNAL or DEALER",
            });
        }

        const updatedRole = await prisma.role.update({
            where: { id },
            data: {
                name: name ?? role.name,
                roleType: roleType ?? role.roleType,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Role updated successfully",
            data: updatedRole,
        });
    } catch (err) {
        console.error("UpdateRole Error:", err);

        if (err.code === "P2002") {
            return res.status(400).json({ success: false, message: "Role name already exists" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
};

// ------------------------------------
// ❌ Delete role by ID
// ------------------------------------
export const deleteRole = async (req, res) => {
    const { id } = req.params;

    try {
        const role = await prisma.role.findUnique({ where: { id } });

        if (!role) {
            return res.status(404).json({ success: false, message: "Role not found" });
        }

        await prisma.role.delete({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: "Role deleted successfully",
        });
    } catch (err) {
        console.error("DeleteRole Error:", err);

        return res.status(500).json({ message: "Internal server error" });
    }
};
