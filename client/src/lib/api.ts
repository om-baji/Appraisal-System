import api from "./axios"
import type {
    Appraisal,
    AppraisalDecisionPayload,
    AppraisalHistoryResponse,
    AppraisalWriteResponse,
    AppraisalStatus,
    CreateAppraisalPayload,
    Employee,
    LoginPayload,
    MyAppraisalSummary,
    MyAppraisalsResponse,
    MyReviewQueueResponse,
    MyReviewsResponse,
    SessionUser,
    SignupPayload,
    UpdateAppraisalPayload,
} from "@/types"

export const authApi = {
    login: async (payload: LoginPayload) => {
        const { data } = await api.post<{ message: string; user: Employee }>(
            "/user/login",
            payload
        )
        return data
    },

    signup: async (payload: SignupPayload) => {
        const { data } = await api.post<{ message: string; user: Employee }>(
            "/user/signup",
            payload
        )
        return data
    },

    logout: async () => {
        const { data } = await api.post<{ message: string }>("/user/logout")
        return data
    },

    getMe: async () => {
        const { data } = await api.get<SessionUser>("/user/me")
        return data
    },
}

export const employeeApi = {
    getAll: async () => {
        const { data } = await api.get<{ message: string; users: Employee[] }>(
            "/user/"
        )
        return data.users
    },

    getById: async (employeeId: string) => {
        const { data } = await api.get<{ message: string; user: Employee }>(
            `/user/${employeeId}`
        )
        return data.user
    },
}

export const appraisalApi = {
    getAll: async (filters?: { employee_id?: string; status?: AppraisalStatus }) => {
        const params = new URLSearchParams()
        if (filters?.employee_id) params.set("employee_id", filters.employee_id)
        if (filters?.status) params.set("status", filters.status)
        const { data } = await api.get<{ count: number; appraisals: Appraisal[] }>(
            `/appraisals/?${params.toString()}`
        )
        return data
    },

    getById: async (id: string) => {
        const { data } = await api.get<Appraisal>(`/appraisals/${id}`)
        return data
    },

    create: async (payload: CreateAppraisalPayload) => {
        const { data } = await api.post<AppraisalWriteResponse>(
            "/appraisals/",
            payload
        )
        return data
    },

    update: async (id: string, payload: UpdateAppraisalPayload) => {
        const { data } = await api.put<AppraisalWriteResponse>(
            `/appraisals/${id}`,
            payload
        )
        return data
    },

    delete: async (id: string) => {
        const { data } = await api.delete<{ message: string }>(`/appraisals/${id}`)
        return data
    },

    updateStatus: async (id: string, status: AppraisalStatus) => {
        const { data } = await api.patch<AppraisalWriteResponse>(
            `/appraisals/${id}/status`,
            { status }
        )
        return data
    },

    submit: async (id: string) => {
        const { data } = await api.post<AppraisalWriteResponse>(
            `/appraisals/${id}/submit`
        )
        return data
    },

    decide: async (id: string, payload: AppraisalDecisionPayload) => {
        const { data } = await api.patch<AppraisalWriteResponse>(
            `/appraisals/${id}/decision`,
            payload
        )
        return data
    },

    getMyAppraisals: async () => {
        const { data } = await api.get<MyAppraisalsResponse>("/appraisals/my/appraisals")
        return data
    },

    getMyReviews: async () => {
        const { data } = await api.get<MyReviewsResponse>("/appraisals/my/reviews")
        return data
    },

    getMySummary: async () => {
        const { data } = await api.get<MyAppraisalSummary>("/appraisals/my/summary")
        return data
    },

    getMyReviewQueue: async (filters?: { status?: AppraisalStatus; limit?: number }) => {
        const params = new URLSearchParams()
        if (filters?.status) params.set("status", filters.status)
        if (typeof filters?.limit === "number") params.set("limit", String(filters.limit))
        const query = params.toString()
        const suffix = query ? `?${query}` : ""
        const { data } = await api.get<MyReviewQueueResponse>(`/appraisals/my/review-queue${suffix}`)
        return data
    },

    getEmployeeHistory: async (employeeId: string, limit?: number) => {
        const suffix = typeof limit === "number" ? `?limit=${limit}` : ""
        const { data } = await api.get<AppraisalHistoryResponse>(
            `/appraisals/employee/${employeeId}/history${suffix}`
        )
        return data
    },
}
