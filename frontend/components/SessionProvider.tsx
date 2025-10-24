"use client"

import React, { useEffect, useState, createContext, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { axiosInstance } from "@/lib/axios"

interface SessionContextType {
    user: any | null
    loading: boolean
    refreshSession: () => Promise<void>
}

export const SessionContext = createContext<SessionContextType>({
    user: null,
    loading: true,
    refreshSession: async () => { },
})

export function SessionProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<any | null>(null)
    const [loading, setLoading] = useState(true)

    const fetchSession = async () => {
        try {
            const res = await axiosInstance.post("/user/auth/verify-session", { withCredentials: true })
            setUser(res.data.user)
        } catch (err) {
            setUser(null)
            if (pathname !== "/login") {
                router.replace("/login")
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSession()
    }, [pathname]) // check on route changes

    if (loading) {
        return (
            <div className="flex w-full justify-center mt-[10%]">
                <Loader2 className="animate-spin" size={24} />
            </div>
        )
    }

    return (
        <SessionContext.Provider value={{ user, loading, refreshSession: fetchSession }}>
            {children}
        </SessionContext.Provider>
    )
}
