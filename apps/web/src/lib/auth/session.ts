import { getToken, clearToken } from "./token";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  departmentId?: string;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  clearToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export function parseJWT(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function getUserFromToken(): User | null {
  const token = getToken();
  if (!token) return null;

  const payload = parseJWT(token);
  if (!payload) return null;

  return {
    id: payload.userId as string,
    email: payload.email as string,
    name: payload.name as string,
    role: payload.role as string,
    departmentId: payload.departmentId as string | undefined,
  };
}
