import { useQuery } from "@tanstack/react-query"
import { employeeApi } from "@/lib/api"

export function useEmployees() {
    return useQuery({
        queryKey: ["employees"],
        queryFn: () => employeeApi.getAll(),
    })
}

export function useEmployee(employeeId: string) {
    return useQuery({
        queryKey: ["employees", employeeId],
        queryFn: () => employeeApi.getById(employeeId),
        enabled: !!employeeId,
    })
}
