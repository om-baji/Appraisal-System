import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { appraisalApi } from "@/lib/api"
import type {
    AppraisalDecisionPayload,
    AppraisalStatus,
    CreateAppraisalPayload,
    UpdateAppraisalPayload,
} from "@/types"

export function useAppraisals(filters?: {
    employee_id?: string
    status?: AppraisalStatus
}) {
    return useQuery({
        queryKey: ["appraisals", filters],
        queryFn: () => appraisalApi.getAll(filters),
    })
}

export function useAppraisal(id: string) {
    return useQuery({
        queryKey: ["appraisals", id],
        queryFn: () => appraisalApi.getById(id),
        enabled: !!id,
    })
}

export function useMyAppraisals() {
    return useQuery({
        queryKey: ["appraisals", "mine"],
        queryFn: () => appraisalApi.getMyAppraisals(),
    })
}

export function useMyReviews() {
    return useQuery({
        queryKey: ["appraisals", "reviews"],
        queryFn: () => appraisalApi.getMyReviews(),
    })
}

export function useMySummary() {
    return useQuery({
        queryKey: ["appraisals", "summary", "mine"],
        queryFn: () => appraisalApi.getMySummary(),
    })
}

export function useMyReviewQueue(filters?: { status?: AppraisalStatus; limit?: number }) {
    return useQuery({
        queryKey: ["appraisals", "review-queue", filters],
        queryFn: () => appraisalApi.getMyReviewQueue(filters),
    })
}

export function useEmployeeHistory(employeeId?: string, limit?: number) {
    return useQuery({
        queryKey: ["appraisals", "history", employeeId, limit],
        queryFn: () => appraisalApi.getEmployeeHistory(employeeId!, limit),
        enabled: !!employeeId,
    })
}

export function useCreateAppraisal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateAppraisalPayload) => appraisalApi.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appraisals"] })
            toast.success("Appraisal created")
        },
        onError: () => {
            toast.error("Failed to create appraisal")
        },
    })
}

export function useUpdateAppraisal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateAppraisalPayload }) =>
            appraisalApi.update(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appraisals"] })
            toast.success("Appraisal updated")
        },
        onError: () => {
            toast.error("Failed to update appraisal")
        },
    })
}

export function useDeleteAppraisal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => appraisalApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appraisals"] })
            toast.success("Appraisal deleted")
        },
        onError: () => {
            toast.error("Failed to delete appraisal")
        },
    })
}

export function useUpdateAppraisalStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: AppraisalStatus }) =>
            appraisalApi.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appraisals"] })
            toast.success("Status updated")
        },
        onError: () => {
            toast.error("Failed to update status")
        },
    })
}

export function useSubmitAppraisal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => appraisalApi.submit(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appraisals"] })
            toast.success("Appraisal submitted")
        },
        onError: () => {
            toast.error("Failed to submit appraisal")
        },
    })
}

export function useDecideAppraisal() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: AppraisalDecisionPayload }) =>
            appraisalApi.decide(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appraisals"] })
            toast.success("Decision saved")
        },
        onError: () => {
            toast.error("Failed to save decision")
        },
    })
}
