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
      providesTags: ["Setting"],
    }),
    getSettingByKey: builder.query<ApiSetting, string>({
      query: (key) => ({
        url: `/settings/${key}`,
        method: "GET",
      }),
      providesTags: (result, error, arg) => [{ type: "Setting", id: arg }],
    }),
    updateSetting: builder.mutation<ApiSetting, { key: string; value: string }>({
      query: (body) => ({
        url: "/settings",
        method: "PUT",
        body,
      }),
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
