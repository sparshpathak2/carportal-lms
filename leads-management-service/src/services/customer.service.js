import { nanoid } from "nanoid";
import prisma from "../lib/prisma.js";

class CustomerService {

    // Create or reuse existing customer
    async findOrCreateCustomer(data) {
        const { phone, email, name, alternatePhone, city } = data;

        // Check existing by phone OR email
        let customer = await prisma.customer.findFirst({
            where: {
                OR: [
                    { phone },
                    email ? { email } : undefined
                ].filter(Boolean)
            },
            include: {
                leads: true,          // ⭐ return all leads of this customer
                _count: { select: { leads: true } }
            }
        });

        if (customer) return customer;

        // Create new customer
        customer = await prisma.customer.create({
            data: {
                id: nanoid(10),
                name,
                phone,
                email,
                alternatePhone,
                city
            }
        });

        // Return newly created customer with leads included
        return await prisma.customer.findUnique({
            where: { id: customer.id },
            include: {
                leads: true,
                _count: { select: { leads: true } }
            }
        });
    }


    async getCustomers({ search }) {
        return await prisma.customer.findMany({
            where: search
                ? {
                    OR: [
                        { name: { contains: search, mode: "insensitive" } },
                        { phone: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } }
                    ]
                }
                : {},

            include: {
                leads: {
                    orderBy: { createdAt: "desc" }
                },
                _count: { select: { leads: true } }
            },

            orderBy: { createdAt: "desc" }
        });
    }


    async getCustomerById(customerId) {
        return await prisma.customer.findUnique({
            where: { id: customerId },
            include: {
                leads: {
                    orderBy: { createdAt: "desc" }
                },
                _count: { select: { leads: true } }
            }
        });
    }


    async updateCustomer(customerId, data) {
        return await prisma.customer.update({
            where: { id: customerId },
            data
        });
    }

    async deleteCustomer(customerId) {
        return await prisma.customer.delete({
            where: { id: customerId }
        });
    }
}

// ✔ Correct export for ES Modules
export default new CustomerService();
