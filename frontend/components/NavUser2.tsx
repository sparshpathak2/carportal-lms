"use client"

import {
    BadgeCheck,
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Sparkles,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useContext } from "react"
import { SessionContext } from "./SessionProvider"
import { IconSelector, IconUser } from "@tabler/icons-react"
import { axiosInstance } from "@/lib/axios"
import { useRouter } from "next/navigation"

export function NavUser() {
    const { user, loading, refreshSession } = useContext(SessionContext)
    const { isMobile } = useSidebar()
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/user/auth/logout", {}, { withCredentials: true })

            // Clear localStorage
            localStorage.clear()

            // Immediately clear user from context (prevents flash)
            await refreshSession() // or setUser(null) if exposed from context (THIS FIXES THE FLASHING ON LOGOUT ISSUE)

            router.replace("/login")
        } catch (err) {
            console.error("Logout failed", err)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger className="flex gap-1 items-center border-1 rounded-2xl p-1 focus:ring-0 focus:ring-offset-0 focus:outline-none">
                    <Avatar className="h-8 w-8 rounded-full">
                        <AvatarFallback className="rounded-lg">
                            {user?.name ? (
                                <AvatarFallback className="rounded-lg bg-neutral-200">
                                    {/* {user.name.slice(0, 2).toUpperCase()} */}
                                    {user?.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            ) : (
                                <AvatarFallback className="rounded-lg bg-neutral-200">
                                    <IconUser size={16} />
                                </AvatarFallback>
                            )}
                        </AvatarFallback>
                    </Avatar>
                    <IconSelector className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    // side={isMobile ? "bottom" : "right"}
                    side="bottom"
                    align="end"
                    sideOffset={4}
                >
                    <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                            <Avatar className="h-8 w-8 rounded-lg">
                                {/* <AvatarImage src={user?.avatar} alt={user?.name} /> */}
                                <AvatarFallback className="rounded-lg">
                                    {/* {user?.name?.charAt(0).toUpperCase() || "?"} */}
                                    {user?.name ? (
                                        <AvatarFallback className="rounded-lg bg-neutral-200">
                                            {/* {user.name.slice(0, 2).toUpperCase()} */}
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    ) : (
                                        <AvatarFallback className="rounded-lg bg-neutral-200">
                                            <IconUser size={16} />
                                        </AvatarFallback>
                                    )}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user?.name}</span>
                                <span className="truncate text-xs">{user?.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {/* <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <Sparkles />
                            Upgrade to Pro
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <BadgeCheck />
                            Account
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <CreditCard />
                            Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Bell />
                            Notifications
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator /> */}
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut />
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
