// "use client"

// import { Button } from "@/components/ui/button"
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuGroup,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuPortal,
//     DropdownMenuSeparator,
//     DropdownMenuShortcut,
//     DropdownMenuSub,
//     DropdownMenuSubContent,
//     DropdownMenuSubTrigger,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

// export function TableFilterComponent() {
//     return (
//         <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//                 <Button variant="outline">Open</Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent className="w-56" align="start">
//                 <DropdownMenuLabel>My Account</DropdownMenuLabel>
//                 <DropdownMenuGroup>
//                     <DropdownMenuItem>
//                         Profile
//                         <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
//                     </DropdownMenuItem>
//                     <DropdownMenuItem>
//                         Billing
//                         <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
//                     </DropdownMenuItem>
//                     <DropdownMenuItem>
//                         Settings
//                         <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
//                     </DropdownMenuItem>
//                     <DropdownMenuItem>
//                         Keyboard shortcuts
//                         <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
//                     </DropdownMenuItem>
//                 </DropdownMenuGroup>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuGroup>
//                     <DropdownMenuItem>Team</DropdownMenuItem>
//                     <DropdownMenuSub>
//                         <DropdownMenuSubTrigger>Invite users</DropdownMenuSubTrigger>
//                         <DropdownMenuPortal>
//                             <DropdownMenuSubContent>
//                                 <DropdownMenuItem>Email</DropdownMenuItem>
//                                 <DropdownMenuItem>Message</DropdownMenuItem>
//                                 <DropdownMenuSeparator />
//                                 <DropdownMenuItem>More...</DropdownMenuItem>
//                             </DropdownMenuSubContent>
//                         </DropdownMenuPortal>
//                     </DropdownMenuSub>
//                     <DropdownMenuItem>
//                         New Team
//                         <DropdownMenuShortcut>⌘+T</DropdownMenuShortcut>
//                     </DropdownMenuItem>
//                 </DropdownMenuGroup>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>GitHub</DropdownMenuItem>
//                 <DropdownMenuItem>Support</DropdownMenuItem>
//                 <DropdownMenuItem disabled>API</DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem>
//                     Log out
//                     <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
//                 </DropdownMenuItem>
//             </DropdownMenuContent>
//         </DropdownMenu>
//     )
// }


"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconCalendarStats, IconFilter, IconSwipeRight, IconTarget, IconUserStar } from "@tabler/icons-react"

interface TableFilterComponentProps {
    trigger: React.ReactNode
}

export function TableFilterComponent({ trigger }: TableFilterComponentProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="focus:ring-0 focus:ring-offset-0 focus:outline-none">
                {trigger}
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-42" align="start">
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <IconTarget />
                        Status
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <IconFilter />
                        Category
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <IconSwipeRight />
                        Source
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <IconUserStar />
                        Owner
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <IconCalendarStats />
                        Date range
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
