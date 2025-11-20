"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    IconCalendarStats,
    IconFilter,
    IconSwipeRight,
    IconTarget,
    IconUserStar,
} from "@tabler/icons-react"

interface TableFilterComponentProps {
    trigger: React.ReactNode
    onFilterSelect: (filterName: string) => void
}

export function TableFilterComponent({
    trigger,
    onFilterSelect,
}: TableFilterComponentProps) {
    const filters = [
        { name: "Status", icon: <IconTarget /> },
        { name: "Category", icon: <IconFilter /> },
        { name: "Source", icon: <IconSwipeRight /> },
        { name: "Owner", icon: <IconUserStar /> },
        { name: "Date range", icon: <IconCalendarStats /> },
    ]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="focus:ring-0 focus:ring-offset-0 focus:outline-none">
                {trigger}
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-42" align="start">
                <DropdownMenuGroup>
                    {filters.map((filter) => (
                        <DropdownMenuItem
                            key={filter.name}
                            onClick={() => onFilterSelect(filter.name)}
                        >
                            {filter.icon}
                            <span className="ml-2">{filter.name}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
