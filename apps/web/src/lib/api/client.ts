import axios, { AxiosInstance } from "axios";
import { setupInterceptors } from "./interceptors";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with requests
});

setupInterceptors(apiClient);

export default apiClient;
