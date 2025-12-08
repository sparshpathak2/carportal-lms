import CustomerService from "../services/customer.service.js";

class CustomerController {

    // Create or reuse customer
    async findOrCreateCustomer(req, res) {
        try {
            const customer = await CustomerService.findOrCreateCustomer(req.body);
            return res.status(200).json({
                success: true,
                message: "Customer found or created successfully",
                data: customer
            });
        } catch (error) {
            console.error("findOrCreateCustomer Error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // Get all customers
    async getCustomers(req, res) {
        try {
            const { search } = req.query;
            const customers = await CustomerService.getCustomers({ search });

            return res.status(200).json({
                success: true,
                count: customers.length,
                data: customers
            });

        } catch (error) {
            console.error("getCustomers Error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // Get customer by ID
    async getCustomerById(req, res) {
        try {
            const { id } = req.params;
            const customer = await CustomerService.getCustomerById(id);

            if (!customer) {
                return res.status(404).json({
                    success: false,
                    message: "Customer not found"
                });
            }

            return res.status(200).json({ success: true, data: customer });

        } catch (error) {
            console.error("getCustomerById Error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // Update customer
    async updateCustomer(req, res) {
        try {
            const { id } = req.params;
            const updated = await CustomerService.updateCustomer(id, req.body);

            return res.status(200).json({
                success: true,
                message: "Customer updated successfully",
                data: updated
            });

        } catch (error) {
            console.error("updateCustomer Error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }

    // Delete customer
    async deleteCustomer(req, res) {
        try {
            const { id } = req.params;
            await CustomerService.deleteCustomer(id);

            return res.status(200).json({
                success: true,
                message: "Customer deleted successfully"
            });

        } catch (error) {
            console.error("deleteCustomer Error:", error);
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}

export default new CustomerController();
