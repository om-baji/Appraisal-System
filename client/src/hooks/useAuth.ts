import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAtom } from "jotai"
import { useNavigate } from "react-router"
import toast from "react-hot-toast"
import { authApi } from "@/lib/api"
import { userAtom } from "@/store/auth"
import type { LoginPayload, SignupPayload } from "@/types"

export function useCurrentUser() {
    const [, setUser] = useAtom(userAtom)

    return useQuery({
        queryKey: ["auth", "me"],
        queryFn: async () => {
            const data = await authApi.getMe()
            setUser(data)
            return data
        },
        retry: false,
        staleTime: 1000 * 60 * 5,
    })
}

export function useLogin() {
    const [, setUser] = useAtom(userAtom)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: LoginPayload) => authApi.login(payload),
        onSuccess: (data) => {
            setUser({
                logged_in: true,
                employee_id: data.user.employee_id,
                employee_name: data.user.employee_name,
            })
            queryClient.invalidateQueries({ queryKey: ["auth"] })
            toast.success("Logged in successfully")
            navigate("/")
        },
        onError: () => {
            toast.error("Invalid email or password")
        },
    })
}

export function useSignup() {
    const navigate = useNavigate()

    return useMutation({
        mutationFn: (payload: SignupPayload) => authApi.signup(payload),
        onSuccess: () => {
            toast.success("Account created! Please log in.")
            navigate("/login")
        },
        onError: () => {
            toast.error("Signup failed. Email may already exist.")
        },
    })
}

export function useLogout() {
    const [, setUser] = useAtom(userAtom)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            setUser(null)
            queryClient.clear()
            toast.success("Logged out")
            navigate("/login")
        },
    })
}
