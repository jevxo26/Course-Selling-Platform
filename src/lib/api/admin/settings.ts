import { baseApi } from "../baseApi";

export type ApiSetting = {
  id: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export const adminSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<ApiSetting[], void>({
      query: () => ({
        url: "/settings",
        method: "GET",
      }),
      transformResponse: (response: any) => response.data ?? response,
      providesTags: ["Setting"],
    }),
    getSettingByKey: builder.query<ApiSetting, string>({
      query: (key) => ({
        url: `/settings/${key}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data ?? response,
      providesTags: (result, error, arg) => [{ type: "Setting", id: arg }],
    }),
    updateSetting: builder.mutation<ApiSetting, { key: string; value: string }>({
      query: (body) => ({
        url: "/settings",
        method: "PUT",
        body,
      }),
      transformResponse: (response: any) => response.data ?? response,
      invalidatesTags: ["Setting"],
    }),
    deleteSetting: builder.mutation<{ message: string }, string>({
      query: (key) => ({
        url: `/settings/${key}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Setting"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSettingsQuery,
  useGetSettingByKeyQuery,
  useUpdateSettingMutation,
  useDeleteSettingMutation,
} = adminSettingsApi;
