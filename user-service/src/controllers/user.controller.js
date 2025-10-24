import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

// ✅ Get all users (with roles and dealer)
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                role: true,
                dealer: true,
            },
        });
        return res.status(200).json({ success: true, data: users });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Get a single user by ID
export const getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                role: true,
                dealer: true,
            },
        });
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ success: true, data: user });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Get users by dealerId
export const getUsersByDealerId = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ success: false, message: "dealerId is required" });
    }

    try {
        const users = await prisma.user.findMany({
            where: { dealerId: id },
            include: {
                role: true,
                dealer: true,
            },
        });

        return res.status(200).json({ success: true, data: users });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// ✅ Update user by ID
export const updateUserById = async (req, res) => {
    const { id } = req.params;
    const { email, password, name, dealerId, roleId } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) return res.status(404).json({ message: "User not found" });

        // hash password only if provided
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                email: email || existingUser.email,
                name: name || existingUser.name,
                password: hashedPassword || existingUser.password,
                dealerId: dealerId ?? existingUser.dealerId,
                roleId: roleId || existingUser.roleId,
            },
            include: {
                role: true,
                dealer: true,
            },
        });

        return res.status(200).json({ success: true, data: updatedUser });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ✅ Delete user by ID
export const deleteUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await prisma.user.delete({
            where: { id },
        });
        return res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// export const bulkUpload = async (req, res) => {
//     try {
//         const { data } = req.body

//         console.log("bulk upload data:", data)

//         if (!data || !Array.isArray(data)) {
//             return res.status(400).json({ message: "Invalid data format" })
//         }

//         // Optional: validate each record
//         const requiredFields = ["id", "amount", "status", "email"]
//         for (const row of data) {
//             for (const field of requiredFields) {
//                 if (!row[field]) {
//                     return res.status(400).json({ message: `Missing field: ${field}` })
//                 }
//             }
//         }

//         // Save to DB (example: insert Payments)
//         await prisma.payment.createMany({
//             data,
//             skipDuplicates: true, // avoid duplicate IDs
//         })

//         return res.json({ message: "Bulk upload successful", count: data.length })
//     } catch (err) {
//         console.error(err)
//         return res.status(500).json({ message: "Server error" })
//     }
// }

