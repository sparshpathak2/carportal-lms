import { axiosInstance } from "@/lib/axios";

// -------------------- Users --------------------

// Fetch all users
export const getAllUsers = async () => {
  const res = await axiosInstance.get("/user/users");
  return res.data;
};

// Get a single user by ID
export const getUserById = async (id: string) => {
  const res = await axiosInstance.get(`/user/users/${id}`);
  return res.data;
};

// Fetch users by dealer ID
export const getUsersByDealerId = async (id: string) => {
  console.log("dealerId:", id)
  const res = await axiosInstance.get(`/user/users/dealer/${id}`);
  return res.data;
};

// Create a new user
export const createUser = async (data: {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
}) => {
  const res = await axiosInstance.post("/user/users", data);
  return res.data;
};

// Update a user
export const editUser = async (
  id: string,
  data: Partial<{ name: string; email: string; phone?: string; role?: string; isActive?: boolean }>
) => {
  const res = await axiosInstance.put(`/user/users/${id}`, data);
  return res.data;
};

// Delete a user
export const deleteUser = async (id: string) => {
  const res = await axiosInstance.delete(`/user/users/${id}`);
  return res.data;
};

// -------------------- Roles / Permissions --------------------

// Fetch all roles
export const getRoles = async () => {
  const res = await axiosInstance.get("/user/roles");
  return res.data;
};

// Get a single role by ID
export const getRoleById = async (id: string) => {
  const res = await axiosInstance.get(`/user/roles/${id}`);
  return res.data;
};

// Create a new role
export const createRole = async (data: { name: string; permissions: string[] }) => {
  const res = await axiosInstance.post("/user/roles", data);
  return res.data;
};

// Update a role
export const editRole = async (
  id: string,
  data: Partial<{ name?: string; permissions?: string[] }>
) => {
  const res = await axiosInstance.put(`/user/roles/${id}`, data);
  return res.data;
};

// Delete a role
export const deleteRole = async (id: string) => {
  const res = await axiosInstance.delete(`/user/roles/${id}`);
  return res.data;
};

// -------------------- Dealers --------------------

export const getAllDealers = async () => {
  const res = await axiosInstance.get('/user/dealers');
  return res.data;
};
