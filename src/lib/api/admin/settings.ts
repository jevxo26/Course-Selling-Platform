import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type ApiSetting = {
  id: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export const adminSettingsApi = createApi({
  reducerPath: "adminSettingsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/settings`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Setting"],
  endpoints: (builder) => ({
    getSettings: builder.query<ApiSetting[], void>({
      query: () => "/",
      providesTags: ["Setting"],
    }),
    getSettingByKey: builder.query<ApiSetting, string>({
      query: (key) => `/${key}`,
      providesTags: (result, error, arg) => [{ type: "Setting", id: arg }],
    }),
    updateSetting: builder.mutation<ApiSetting, { key: string; value: string }>({
      query: (body) => ({
        url: "/",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Setting"],
    }),
    deleteSetting: builder.mutation<{ message: string }, string>({
      query: (key) => ({
        url: `/${key}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Setting"],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useGetSettingByKeyQuery,
  useUpdateSettingMutation,
  useDeleteSettingMutation,
} = adminSettingsApi;
