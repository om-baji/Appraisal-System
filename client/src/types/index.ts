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

export interface MyAppraisalSummary {
    employee_id: string
    my_appraisals_count: number
    my_reviews_count: number
    approved_count: number
    submitted_reviews_count: number
    average_rating: number
}

export interface AppraisalCollectionResponse {
    count: number
    appraisals: Appraisal[]
}

export interface MyReviewQueueResponse extends AppraisalCollectionResponse {
    reviewer_id: string
    status: AppraisalStatus
}

export interface MyAppraisalsResponse extends AppraisalCollectionResponse {
    employee_id: string
}

export interface MyReviewsResponse extends AppraisalCollectionResponse {
    reviewer_id: string
}

export interface AppraisalHistoryResponse extends AppraisalCollectionResponse {
    employee_id: string
}

export interface AppraisalWriteResponse {
    message: string
    appraisal: Appraisal
}

export interface AppraisalDecisionPayload {
    decision: "approved" | "rejected"
    comments?: string
}
