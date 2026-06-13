import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";

export function toQueryString(params: Record<string, unknown>): string {
  const entries = Object.entries(params).filter(([, v]) => {
    if (v === undefined || v === null) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "number") return Number.isFinite(v);
    return true;
  });

  if (entries.length === 0) return "";

  const qs = entries
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join("&");

  return `?${qs}`;
}

export const baseApi = createApi({
  reducerPath: "baseApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "https://api.maruftech.online",

    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      let token =
        state.auth?.user?.token ??
        state.auth?.user?.accessToken ??
        state.auth?.user?.access_token;
      let role = state.auth?.user?.role ?? (state.auth as any)?.role;

      if (!token && typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("course_platform_auth");
          if (raw) {
            const parsed = JSON.parse(raw);
            token =
              parsed?.user?.token ??
              parsed?.user?.accessToken ??
              parsed?.user?.access_token ??
              parsed?.token ??
              parsed?.accessToken ??
              parsed?.access_token;
            role = role ?? parsed?.user?.role ?? parsed?.role;
          }
        } catch { }
      }

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
        headers.set("access_token", token);
        headers.set("x-access-token", token);
      }
      if (role) {
        headers.set("x-role", role);
        headers.set("role", role);
      }
      headers.set("accept", "application/json");

      return headers;
    },
  }),

  tagTypes: [
    "Auth",
    "User",
    "Course",
    "Category",
    "Product",
    "Payment",
    "PaymentMethod",
    "Enrollment",
    "Instructor",
    "Percentage",
    "Withdraw",
    "Shop",
    "Stats",
  ],

  endpoints: () => ({}),
});
