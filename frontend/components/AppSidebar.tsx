'use client'

import * as React from "react"

import { SearchForm } from "@/components/SearchForm"
import { VersionSwitcher } from "@/components/VersionSwitcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { NavUser } from "./NavUser"
import { usePathname } from "next/navigation"

// This is sample data.
const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
    navMain: [
        {
            title: "Overview",
            url: "#",
            items: [
                {
                    title: "Home",
                    url: "#",
                },
            ],
        },
        {
            title: "Leads Management",
            url: "#",
            items: [
                {
                    title: "Dashboard",
                    url: "/leads/dashboard",
                    exact: true
                },
                {
                    title: "All Leads",
                    url: "/leads",
                    parentMatch: true
                }
            ],
        },
        {
            title: "User Management",
            url: "#",
            items: [
                {
                    title: "All Users",
                    url: "/users",
                },
                {
                    title: "Dealers",
                    url: "/dealers",
                },
                {
                    title: "Packs",
                    url: "#",
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname() // ✅ current URL

    // Determine if an item is active
    const getIsActive = (group: any, item: any) => {
        if (item.exact) return pathname === item.url

        if (item.parentMatch) {
            // Only match parent if no exact match exists in this group
            const hasExactMatch = group.items.some((i: any) => i.exact && pathname === i.url)
            if (hasExactMatch) return false
            return pathname === item.url || pathname.startsWith(item.url + "/")
        }

        return pathname.startsWith(item.url)
    }


    return (
        <Sidebar {...props}>
            <SidebarHeader>
                {/* <VersionSwitcher
                    versions={data.versions}
                    defaultVersion={data.versions[0]}
                /> */}
                {/* <div className="flex w-full p-2 items-center gap-2"> */}
                <div className="flex w-full p-2 items-center gap-2">
                    {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <GalleryVerticalEnd className="size-4" />
                    </div> */}
                    <img
                        src="/logo-14-favicon.svg"
                        alt="LMS Supreme Logo"
                        // className="h-12 rounded-lg"
                        className="h-10"
                    />
                    {/* <div className="font-semibold">LMS Supreme</div> */}
                </div>
                {/* <SearchForm /> */}
            </SidebarHeader>
            <SidebarContent>
                {/* We create a SidebarGroup for each parent. */}
                {data.navMain.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    // const isActive = pathname === item.url

                                    // const isActive =
                                    //     pathname === item.url || (item.url !== "#" && pathname.startsWith(item.url))

                                    // const isActive = item.exact
                                    //     ? pathname === item.url
                                    //     : item.parentMatch
                                    //         ? pathname === item.url || pathname.startsWith(item.url + "/")
                                    //         : pathname.startsWith(item.url)

                                    // const isActive = (() => {
                                    //     if (item.exact) return pathname === item.url
                                    //     if (item.parentMatch) return pathname === item.url || pathname.startsWith(item.url + "/")
                                    //     return pathname.startsWith(item.url)
                                    // })()

                                    const isActive = getIsActive(group, item)

                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            {/* <SidebarMenuButton asChild isActive={item.isActive}> */}
                                            <SidebarMenuButton asChild isActive={isActive}>
                                                <a href={item.url}>{item.title}</a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            {/* <SidebarFooter>
                <NavUser />
            </SidebarFooter> */}
            <SidebarRail />
        </Sidebar >
    )
}
