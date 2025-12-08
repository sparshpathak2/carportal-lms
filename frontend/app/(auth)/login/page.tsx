'use client'

import { LoginForm } from "@/components/LoginForm"
import { useRouter } from "next/navigation"
import { useContext, useEffect } from "react"
import { SessionContext } from "@/components/SessionProvider"

export default function LoginPage() {

    const { user, loading } = useContext(SessionContext)
    const router = useRouter()

    useEffect(() => {
        if (!loading && user) {
            router.replace("/leads") // redirect logged-in users
        }
    }, [user, loading, router])

    if (loading) {
        return null // or a spinner if you want
    }
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-10">
                {/* <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    Acme Inc.
                </a> */}
                {/* <img
                    // src="/logo-14.svg"
                    src="/carportal-logo-blue.png"
                    // alt="LMS Supreme Logo"
                    alt="Carportal Logo"
                    // className="h-14 rounded-lg"
                    className="h-14 w-fit text-center rounded-lg"
                /> */}
                <LoginForm />
            </div>
        </div>
    )
}
