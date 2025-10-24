import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";

// Login controller
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        const sessionId = uuidv4();
        // const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30min

        await prisma.session.create({
            data: { id: sessionId, userId: user.id, expiresAt },
        });

        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            // maxAge: 1000 * 60 * 60 * 24,
            maxAge: 1000 * 60 * 30,
        });

        return res.json({ message: "Login successful", user });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Logout controller
export const logout = async (req, res) => {
    try {
        const sessionId = req.cookies?.sessionId;
        if (sessionId) {
            await prisma.session.deleteMany({ where: { id: sessionId } });
            res.clearCookie("sessionId");
        }
        return res.json({ message: "Logged out" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Verify session controller
// export const verifySession = async (req, res) => {
//     try {
//         const sessionId = req.cookies.sessionId; // ✅ from cookie
//         // console.log("sessionId:", sessionId)
//         if (!sessionId) return res.json({ valid: false });

//         const session = await prisma.session.findUnique({
//             where: { id: sessionId },
//             include: {
//                 user: {
//                     include: {
//                         roles: { include: { role: true } },
//                         dealer: true,
//                     },
//                 },
//             },
//         });

//         if (!session || session.expiresAt < new Date()) {
//             return res.json({ valid: false });
//         }

//         // Strip password before returning
//         const { password, ...safeUser } = session.user;

//         return res.json({
//             valid: true,
//             user: safeUser,
//         });
//     } catch (error) {
//         console.error("VerifySession error:", error);
//         return res.status(500).json({ message: "Server error during session verification" });
//     }
// };

// export const verifySession = async (req, res) => {
//     try {
//         const sessionId = req.cookies.sessionId; // ✅ from cookie
//         if (!sessionId) return res.json({ valid: false });

//         const session = await prisma.session.findUnique({
//             where: { id: sessionId },
//             include: {
//                 user: {
//                     include: {
//                         role: true,   // ✅ single role (not roles[])
//                         dealer: true, // ✅ keep dealer if needed
//                     },
//                 },
//             },
//         });

//         // ❌ No session or expired
//         if (!session || session.expiresAt < new Date()) {
//             return res.json({ valid: false });
//         }

//         // Strip password before returning
//         const { password, ...safeUser } = session.user;

//         return res.json({
//             valid: true,
//             user: safeUser,
//         });
//     } catch (error) {
//         console.error("VerifySession error:", error);
//         return res.status(500).json({ message: "Server error during session verification" });
//     }
// };

export const verifySession = async (req, res) => {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) return res.json({ valid: false });

        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                user: {
                    include: {
                        role: true,
                        dealer: true,
                    },
                },
            },
        });

        if (!session || session.expiresAt < new Date()) {
            return res.json({ valid: false });
        }

        // Keep all fields, just remove password
        const safeUser = { ...session.user, password: undefined };

        return res.json({
            valid: true,
            user: safeUser,
        });
    } catch (error) {
        console.error("VerifySession error:", error);
        return res.status(500).json({ message: "Server error during session verification" });
    }
};



// Signup controller
// export const signup = async (req, res) => {
//     try {
//         const { email, password, name, dealerId, roles } = req.body;

//         // Check if user already exists
//         const existingUser = await prisma.user.findUnique({ where: { email } });
//         if (existingUser)
//             return res.status(400).json({ message: "Email already registered" });

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create user with roles
//         const newUser = await prisma.user.create({
//             data: {
//                 id: nanoid(10),
//                 email,
//                 password: hashedPassword,
//                 name,
//                 dealerId: dealerId || null,
//                 roles: {
//                     create: (roles || ["ADMIN"]).map((roleName) => ({
//                         id: nanoid(10),
//                         role: {
//                             connectOrCreate: {
//                                 where: { name: roleName },
//                                 create: {
//                                     id: nanoid(10), // role id
//                                     name: roleName,
//                                 },
//                             },
//                         },
//                     })),
//                 },
//             },
//             include: { roles: { include: { role: true } } },
//         });

//         // Create session
//         const sessionId = uuidv4();
//         // const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
//         const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

//         await prisma.session.create({
//             data: { id: sessionId, userId: newUser.id, expiresAt },
//         });

//         // Set cookie
//         res.cookie("sessionId", sessionId, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "strict",
//             // maxAge: 1000 * 60 * 60 * 24,
//             maxAge: 1000 * 60 * 30,
//         });

//         return res
//             .status(201)
//             .json({ message: "Signup successful", user: newUser });
//     } catch (error) {
//         console.error("Signup error:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };

export const signup = async (req, res) => {
    try {
        const { email, password, name, dealerId, role } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Default role = GUEST if none provided
        const selectedRole = role || "GUEST";

        // Ensure role exists
        const roleRecord = await prisma.role.upsert({
            where: { name: selectedRole },
            update: {},
            create: {
                id: nanoid(10),
                name: selectedRole,
            },
        });

        // Create user with single roleId
        const newUser = await prisma.user.create({
            data: {
                id: nanoid(10),
                email,
                password: hashedPassword,
                name,
                dealerId: dealerId || null,
                roleId: roleRecord.id,
            },
            include: { role: true },
        });

        // Create session
        const sessionId = uuidv4();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

        await prisma.session.create({
            data: { id: sessionId, userId: newUser.id, expiresAt },
        });

        // Set cookie
        res.cookie("sessionId", sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 1000 * 60 * 30,
        });

        return res
            .status(201)
            .json({ success: true, message: "Signup successful", user: newUser });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};


