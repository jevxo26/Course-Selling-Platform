import { baseApi, toQueryString } from "../baseApi";

export type PaymentMethodType = "zinipay" | "nagad" | "bank" | "binance" | "visa";
export type PaymentMethodStatus = "pending" | "approved" | "rejected";

export type StudentPaymentMethodsMySearchQuery = {
  type?: PaymentMethodType | string;
  status?: PaymentMethodStatus | string;
  page?: number;
  limit?: number;
};

export type StudentPaymentMethodsMySearchResponse = Record<string, any>;
export type StudentCreatePaymentMethodResponse = Record<string, any>;
export type StudentCreatePaymentMethodBody = Record<string, any> & {
  type: PaymentMethodType | string;
};

export const studentPaymentMethodsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    studentPaymentMethodsMySearch: build.query<
      StudentPaymentMethodsMySearchResponse,
      StudentPaymentMethodsMySearchQuery | void
    >({
      query: (q) => {
        const query = q ?? {};
        const qs = toQueryString(query as Record<string, unknown>);
        return {
          url: `/payment-methods/my${qs}`,
          method: "GET",
        };
      },
      providesTags: ["PaymentMethod"],
    }),
    studentCreatePaymentMethod: build.mutation<
      StudentCreatePaymentMethodResponse,
      StudentCreatePaymentMethodBody
    >({
      query: (body) => ({
        url: "/payment-methods",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PaymentMethod"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useStudentPaymentMethodsMySearchQuery,
  useLazyStudentPaymentMethodsMySearchQuery,
  useStudentCreatePaymentMethodMutation,
} = studentPaymentMethodsApi;
