import { baseApi, toQueryString } from "../baseApi";

export type WalletListQuery = {
  search?: string;
  page?: number;
  limit?: number;
};

export type WalletResponse = Record<string, any>;

export const adminWalletApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminWallets: build.query<WalletResponse, WalletListQuery | void>({
      query: (q) => {
        const query = q ?? {};
        const qs = toQueryString(query as Record<string, unknown>);
        return {
          url: `/wallet${qs}`,
          method: "GET",
        };
      },
      providesTags: ["Wallet" as any],
    }),
    adminDeleteWallet: build.mutation<{ message: string }, number | string>({
      query: (id) => ({
        url: `/wallet/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wallet" as any],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAdminWalletsQuery,
  useLazyAdminWalletsQuery,
  useAdminDeleteWalletMutation,
} = adminWalletApi;
