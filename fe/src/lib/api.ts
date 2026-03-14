const AUTH_STORAGE_KEY = "ecom_auth";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "http://localhost:5000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

function getToken() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token || null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, method: HttpMethod, body?: unknown): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json();
  if (!response.ok) {
    throw new ApiError(data?.message || "Request failed", response.status);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, "GET"),
  post: <T>(path: string, body?: unknown) => request<T>(path, "POST", body),
  put: <T>(path: string, body?: unknown) => request<T>(path, "PUT", body),
  patch: <T>(path: string, body?: unknown) => request<T>(path, "PATCH", body),
  delete: <T>(path: string) => request<T>(path, "DELETE"),
};

export { ApiError, API_BASE_URL };
