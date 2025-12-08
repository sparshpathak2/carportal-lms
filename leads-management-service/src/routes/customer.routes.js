import { Router } from "express";
import CustomerController from "../controllers/customer.controller.js";

const router = Router();

// Create OR reuse existing customer
router.post("/", CustomerController.findOrCreateCustomer);

// Get all customers
router.get("/", CustomerController.getCustomers);

// Get customer by ID
router.get("/:id", CustomerController.getCustomerById);

// Update customer
router.put("/:id", CustomerController.updateCustomer);

// Delete customer
router.delete("/:id", CustomerController.deleteCustomer);

export default router;
