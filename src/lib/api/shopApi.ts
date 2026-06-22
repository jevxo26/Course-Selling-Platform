import { baseApi } from "./baseApi";

export interface ShopItem {
  id: number;
  name: string;
  gmail: string;
  logo: string;
  price: string | number;
}

export interface PaginatedShopResponse {
  items: ShopItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const shopApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShopItems: builder.query<
      PaginatedShopResponse,
      { page?: number; limit?: number; search?: string }
    >({
      query: (params) => ({
        url: "/shop",
        params,
      }),
      transformResponse: (response: { data: PaginatedShopResponse } | PaginatedShopResponse) => {
        // Handle cases where response might be wrapped in { success, data } or returned directly
        if ('data' in response && response.data?.items) {
          return response.data as PaginatedShopResponse;
        }
        return response as PaginatedShopResponse;
      },
      providesTags: ["Shop"],
    }),
    createShopItem: builder.mutation<any, FormData>({
      query: (data) => ({
        url: "/shop",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Shop"],
    }),
    updateShopItem: builder.mutation<any, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/shop/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Shop"],
    }),
    deleteShopItem: builder.mutation<any, number>({
      query: (id) => ({
        url: `/shop/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shop"],
    }),
    buyShopItem: builder.mutation<
      { paymentUrl: string },
      { userId: number; shopId: number; amount?: number }
    >({
      query: (data) => ({
        url: "/shop-purchases/buy/zinipay",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => response.data ?? response,
    }),
    getShopPurchaseDetails: builder.query<any, number>({
      query: (id) => `/shop-purchases/my/${id}`,
      transformResponse: (response: any) => response.data ?? response,
    }),
    getMyShopPurchases: builder.query<any[], void>({
      query: () => "/shop-purchases/my",
      transformResponse: (response: any) => response.data ?? response,
      providesTags: ["Shop"],
    }),
  }),
});

export const { useGetShopItemsQuery, useCreateShopItemMutation, useUpdateShopItemMutation, useDeleteShopItemMutation, useBuyShopItemMutation, useGetShopPurchaseDetailsQuery, useGetMyShopPurchasesQuery } = shopApi;
