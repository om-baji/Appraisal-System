import { atom } from "jotai"
import type { SessionUser } from "@/types"

export const userAtom = atom<SessionUser | null>(null)

export const isAuthenticatedAtom = atom((get) => {
    const user = get(userAtom)
    return user !== null && user.logged_in
})
