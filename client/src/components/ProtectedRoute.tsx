import { Navigate } from "react-router"
import { useAtomValue } from "jotai"
import { isAuthenticatedAtom } from "@/store/auth"
import { useCurrentUser } from "@/hooks/useAuth"
import Spinner from "./Spinner"

interface ProtectedRouteProps {
    children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isLoading, isError } = useCurrentUser()
    const isAuthenticated = useAtomValue(isAuthenticatedAtom)

    if (isLoading) {
        return <Spinner size="lg" />
    }

    if (isError || !isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}
