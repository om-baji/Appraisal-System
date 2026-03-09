export type AppraisalStatus = "draft" | "submitted" | "approved" | "rejected"

export interface Employee {
    id: string
    employee_id: string
    employee_name: string
    email: string
}

export interface Appraisal {
    id: string
    employee_id: string
    employee_name: string
    reviewer_id: string
    reviewer_name: string
    appraisal_period: string
    performance_rating: number
    goals_achieved: string[]
    strengths: string
    areas_for_improvement: string
    comments: string
    status: AppraisalStatus
    created_at: string
    updated_at: string
}

export interface CreateAppraisalPayload {
    employee_id: string
    appraisal_period: string
    performance_rating?: number
    goals_achieved?: string[]
    strengths?: string
    areas_for_improvement?: string
    comments?: string
    status?: AppraisalStatus
}

export interface UpdateAppraisalPayload {
    appraisal_period?: string
    performance_rating?: number
    goals_achieved?: string[]
    strengths?: string
    areas_for_improvement?: string
    comments?: string
    status?: AppraisalStatus
}

export interface LoginPayload {
    email: string
    password: string
}

export interface SignupPayload {
    employee_name: string
    email: string
    password: string
}

export interface SessionUser {
    logged_in: boolean
    employee_id: string
    employee_name: string
}
