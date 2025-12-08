"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import {
    IconCalendarStats,
    IconFilter,
    IconFilter2,
    IconSwipeRight,
    IconTarget,
    IconUserStar,
    IconX,
} from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "./ui/button"
import { FilterButton } from "./FilterButtonComponent"

interface TableFilterComponentProps {
    // trigger: React.ReactNode
    onFilterSelect: (filterName: string) => void
    activeFilters?: string[]
}

export function TableFilterComponent({
    // trigger,
    onFilterSelect,
    activeFilters = [],
}: TableFilterComponentProps) {
    const filters = [
        { name: "Status", icon: <IconTarget size={18} /> },
        { name: "Category", icon: <IconFilter size={18} /> },
        { name: "Source", icon: <IconSwipeRight size={18} /> },
        // { name: "Owner", icon: <IconUserStar size={18} /> },
        // { name: "Date range", icon: <IconCalendarStats size={18} /> },
    ]

    const [selectedFilters, setSelectedFilters] = useState<string[]>(activeFilters)
    const [hovered, setHovered] = useState(false)

    const handleCheckboxChange = (filterName: string) => {
        const updated = selectedFilters.includes(filterName)
            ? selectedFilters.filter((f) => f !== filterName)
            : [...selectedFilters, filterName]

        setSelectedFilters(updated)
        onFilterSelect(filterName)
    }

    // ✅ Clears all selected filters
    const clearAllFilters = () => {
        setSelectedFilters([])
        // Optionally inform parent if needed
        filters.forEach((f) => onFilterSelect(f.name))
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className="focus:ring-0 focus:ring-offset-0 focus:outline-none">
                {/* {trigger} */}
                <Button
                    size="sm"
                    variant="outline"
                    className={`rounded-full w-fit ${selectedFilters.length > 0 ? "!pr-1 !pl-2" : "!px-2"}`}
                >
                    <IconFilter2 />
                    Filter {selectedFilters.length > 0 ? <div className="flex w-5 h-5 items-center justify-center rounded-full bg-blue-600 text-white">
                        {selectedFilters.length}
                    </div> : ""}
                </Button>

            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48 p-1" align="start" sideOffset={6}>
                <DropdownMenuGroup>
                    {filters.map((filter) => (
                        <div
                            key={filter.name}
                            onClick={() => handleCheckboxChange(filter.name)}
                            className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent cursor-pointer text-left"
                        >
                            <Checkbox
                                checked={selectedFilters.includes(filter.name)}
                                onCheckedChange={() => handleCheckboxChange(filter.name)}
                                onClick={(e) => e.stopPropagation()} // prevent double firing
                            />
                            <div className="flex items-center gap-2">
                                {/* {filter.icon} */}
                                <span className="text-sm">{filter.name}</span>
                            </div>
                        </div>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
