// src/lib/prisma.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;



// Use DATABASE_URL from your .env file
// export const prisma = new PrismaClient({
//     adapter: process.env.DATABASE_URL
// });


// export default prisma;