import { baseApi, toQueryString } from "../baseApi";

export type EnrollmentListQuery = {
  search?: string;
  page?: number;
  limit?: number;
};

export type AdminEnrollmentsResponse = Record<string, any>;
export type AdminEnrollmentResponse = Record<string, any>;

export type AdminEnrollmentPayZinipayPaymentRequest = Record<string, any>;
export type AdminEnrollmentManualPaymentRequest = Record<string, any>;

export const adminEnrollmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminEnrollments: build.query<
      AdminEnrollmentsResponse,
      EnrollmentListQuery | void
    >({
      query: (q) => {
        const query = q ?? {};
        const qs = toQueryString(query as Record<string, unknown>);
        return {
          url: `/enrollments${qs}`,
          method: "GET",
        };
      },
      providesTags: ["Enrollment"],
    }),
    adminEnrollment: build.query<AdminEnrollmentResponse, number | string>({
      query: (id) => ({
        url: `/enrollments/${id}`,
        method: "GET",
      }),
      providesTags: ["Enrollment"],
    }),
    adminEnrollmentsPayZinipayPayment: build.mutation<
      AdminEnrollmentResponse,
      AdminEnrollmentPayZinipayPaymentRequest
    >({
      query: (body) => ({
        url: "/enrollments/pay",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Enrollment"],
    }),
    adminEnrollmentsManualPayment: build.mutation<
      AdminEnrollmentResponse,
      AdminEnrollmentManualPaymentRequest
    >({
      query: (body) => ({
        url: "/enrollments/manual",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Enrollment"],
    }),
    adminDeleteEnrollment: build.mutation<{ message: string }, number | string>({
      query: (id) => ({
        url: `/enrollments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Enrollment"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAdminEnrollmentsQuery,
  useLazyAdminEnrollmentsQuery,
  useAdminEnrollmentQuery,
  useLazyAdminEnrollmentQuery,
  useAdminEnrollmentsPayZinipayPaymentMutation,
  useAdminEnrollmentsManualPaymentMutation,
  useAdminDeleteEnrollmentMutation,
} = adminEnrollmentsApi;