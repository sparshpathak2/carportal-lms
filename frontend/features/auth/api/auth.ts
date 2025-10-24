import { axiosInstance } from "@/lib/axios";

export const loginApi = async (email: string, password: string) => {
  const res = await axiosInstance.post("/user/auth/login", { email, password });
  return res.data;
};

export const signupApi = async (data: {
  email: string;
  password: string;
  name: string;
  dealerId?: string;
  roles?: string[];
}) => {
  const res = await axiosInstance.post("/user/auth/signup", data);
  return res.data;
};
