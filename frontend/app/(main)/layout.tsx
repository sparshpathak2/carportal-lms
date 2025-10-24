import { ReactNode } from "react"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
            <SidebarInset>
                {/* <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4"> */}
                <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
                    <div className="flex gap-2 items-center">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                    </div>
                    {/* <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb> */}
                    <div className="flex gap-4 items-center">
                        {/* <IconBell className="w-6 h-6" strokeWidth={1.5} /> */}
                        <NotificationBell />
                        <NavUser />
                    </div>
                </header>
                {/* <div className="flex flex-1 flex-col gap-4 p-4">{children}</div> */}
                <div className="bg-neutral-50 h-full">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}
