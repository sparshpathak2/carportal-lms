import axios from "axios";

// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const API_BASE = "/api";

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // include cookies for auth
  headers: {
    "Content-Type": "application/json",
  },
});
