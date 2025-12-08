import { ReactNode } from "react"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { NavUser } from "@/components/NavUser2"
import { IconBell } from "@tabler/icons-react"
import NotificationBell from "@/components/NotificationBell"

interface DashboardLayoutProps {
    children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <SidebarProvider>
            <AppSidebar />
            {/* <SidebarInset */}
            <SidebarInset className="w-full flex-1 min-w-0 overflow-x-hidden overflow-y-visible">
                {/* <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4"> */}
                <header className="bg-white sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between z-30 w-full overflow-x-hidden">
                    <div className="flex gap-2 items-center">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </div>
                    <div className="flex gap-4 items-center">
                        {/* <IconBell className="w-6 h-6" strokeWidth={1.5} /> */}
                        {/* <NotificationBell /> */}
                        <NavUser />
                    </div>
                </header>
                {/* <div className="flex flex-1 flex-col gap-4 p-4">{children}</div> */}
                <div className="bg-neutral-50 h-full overflow-x-auto">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}
