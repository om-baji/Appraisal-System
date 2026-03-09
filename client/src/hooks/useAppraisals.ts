import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { appraisalApi } from "@/lib/api"
import type {
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
