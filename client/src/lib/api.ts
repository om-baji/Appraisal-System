import api from "./axios"
import type {
    Appraisal,
    AppraisalStatus,
    CreateAppraisalPayload,
    Employee,
    LoginPayload,
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
        const { data } = await api.post<{ message: string; appraisal: Appraisal }>(
            "/appraisals/",
            payload
        )
        return data
    },

    update: async (id: string, payload: UpdateAppraisalPayload) => {
        const { data } = await api.put<{ message: string; appraisal: Appraisal }>(
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
        const { data } = await api.patch<{ message: string; appraisal: Appraisal }>(
            `/appraisals/${id}/status`,
            { status }
        )
        return data
    },

    getMyAppraisals: async () => {
        const { data } = await api.get<{
            count: number
            employee_id: string
            appraisals: Appraisal[]
        }>("/appraisals/my/appraisals")
        return data
    },

    getMyReviews: async () => {
        const { data } = await api.get<{
            count: number
            reviewer_id: string
            appraisals: Appraisal[]
        }>("/appraisals/my/reviews")
        return data
    },
}
