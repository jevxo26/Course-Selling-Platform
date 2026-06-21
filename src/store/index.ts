import { configureStore, type Middleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import axios from "axios";
import authReducer, { logout, setUser } from "./slices/authSlice";
import { authApi } from "@/lib/api/authApi";
import { baseApi } from "@/lib/api/baseApi";

const AUTH_STORAGE_KEY = "course_platform_auth";

function normalizeRole(input: unknown): "student" | "superadmin" | "affiliate" | "unknown" {
  if (typeof input !== "string") return "unknown";
  const role = input.trim().toLowerCase();
  if (role === "student") return "student";
  if (role === "affiliate") return "affiliate";
  if (role === "superadmin" || role === "super_admin" || role === "admin")
    return "superadmin";
  return "unknown";
}

function extractToken(payload: unknown): string | null {
  const p = payload as Record<string, any> | null;
  if (!p) return null;
  return (
    p.token ??
    p.accessToken ??
    p.access_token ??
    p.data?.token ??
    p.data?.accessToken ??
    p.data?.access_token ??
    p.user?.token ??
    p.user?.accessToken ??
    p.user?.access_token ??
    null
  );
}

function extractUser(payload: unknown): Record<string, any> | null {
  const p = payload as Record<string, any> | null;
  if (!p) return null;
  const candidate = p.user ?? p.data?.user ?? p.data ?? null;
  return candidate && typeof candidate === "object" ? candidate : null;
}

async function fetchCurrentUser(
  token: string,
): Promise<Record<string, any> | null> {
  try {
    const decodeJwtRole = (rawToken: string): string | undefined => {
      try {
        const payload = rawToken.split(".")[1];
        if (!payload) return undefined;

        const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized + "===".slice((normalized.length + 3) % 4);

        const decoded =
          typeof atob === "function"
            ? atob(padded)
            : Buffer.from(padded, "base64").toString("binary");

        const parsed = JSON.parse(decoded) as { role?: unknown };
        return typeof parsed.role === "string" ? parsed.role : undefined;
      } catch {
        return undefined;
      }
    };

    const role = decodeJwtRole(token);

    const headers: Record<string, string> = {
      authorization: `Bearer ${token}`,
      access_token: token,
      "x-access-token": token,
    };

    if (role) {
      headers.role = role;
      headers["x-role"] = role;
    }

    const res = await axios.get(
      (process.env.NEXT_PUBLIC_API_BASE_URL ||
        "https://course-selling-api.up.railway.app") + "/auth/profile",
      {
        headers,
      },
    );
    const candidate =
      res.data?.user ?? res.data?.data?.user ?? res.data?.data ?? res.data;
    return candidate && typeof candidate === "object" ? candidate : null;
  } catch {
    return null;
  }
}

function cookieAttrs() {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

function persistRoleCookie(role: string) {
  if (typeof window === "undefined") return;
  const attrs = cookieAttrs();
  document.cookie = `role=${encodeURIComponent(role)}; Path=/; Max-Age=2592000; SameSite=Lax${attrs}`;
}

function clearRoleCookie() {
  if (typeof window === "undefined") return;
  const attrs = cookieAttrs();
  document.cookie = `role=; Path=/; Max-Age=0; SameSite=Lax${attrs}`;
}

function persistAuth(payload: {
  user: Record<string, any> | null;
  token: string | null;
}) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    if (payload.token) {
      localStorage.setItem("token", payload.token);
      localStorage.setItem("access_token", payload.token);
    }
    if (payload.user?.role) {
      persistRoleCookie(String(payload.user.role));
    }
  } catch {
    return;
  }
}

function clearPersistedAuth() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    clearRoleCookie();
  } catch {
    return;
  }
}

function redirectByRole(role: "student" | "superadmin" | "affiliate" | "unknown") {
  if (typeof window === "undefined") return;
  if (role === "superadmin") {
    window.location.href = "/admin/dashboard";
    return;
  }
  if (role === "affiliate") {
    window.location.href = "/affiliate/dashboard";
    return;
  }
  if (role === "student") {
    window.location.href = "/student";
  }
}

const authFlowMiddleware: Middleware =
  (storeApi) => (next) => async (action) => {
    const result = next(action);

    const isAuthSuccess =
      authApi.endpoints.login.matchFulfilled(action) ||
      authApi.endpoints.register.matchFulfilled(action);

    if (isAuthSuccess) {
      const token = extractToken(action.payload);
      const userFromPayload = extractUser(action.payload);

      let resolvedUser = userFromPayload;
      if (token) {
        resolvedUser = (await fetchCurrentUser(token)) ?? userFromPayload;
      }

      const role = normalizeRole(
        resolvedUser?.role ??
          (action.payload as any)?.role ??
          userFromPayload?.role,
      );

      const userWithToken = resolvedUser
        ? { ...resolvedUser, ...(token ? { token } : {}) }
        : token
          ? { token }
          : null;

      storeApi.dispatch(setUser(userWithToken));
      persistAuth({ user: userWithToken, token });
      redirectByRole(role);
    }

    if (logout.match(action)) {
      clearPersistedAuth();
    }

    return result;
  };

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, authFlowMiddleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

