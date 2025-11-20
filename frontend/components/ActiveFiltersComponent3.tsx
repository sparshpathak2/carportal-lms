"use client"

import React, { useState } from "react"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CalendarRangeComponent } from "@/components/CalendarRangeComponent"

type DateRange = {
    gte: string | Date
    lte: string | Date
}

type Filters = {
    [key: string]: string | string[] | number | DateRange
}

interface ActiveFiltersProps {
    filters: Filters
    onRemove: (key: string) => void
    onUpdate: (key: string, value: any) => void
}

const dropdownOptions: Record<string, string[]> = {
    status: ["Active", "Inactive", "Pending"],
    owner: ["Alice", "Bob", "Charlie"],
    category: ["Gold", "Silver", "Bronze"],
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
    filters,
    onRemove,
    onUpdate,
}) => {
    const entries = Object.entries(filters)
    const [openPopover, setOpenPopover] = useState<string | null>(null)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)

    if (entries.length === 0) return null

    return (
        <div className="flex flex-wrap gap-2">
            {entries.map(([key, value]) => {
                let label = ""

                if (key === "createdAt" && typeof value === "object" && !Array.isArray(value) && value !== null && "gte" in value) {
                    const from = new Date(value.gte).toLocaleDateString();
                    const to = new Date(value.lte).toLocaleDateString();
                    label = `Date: ${from} - ${to}`;
                } else {
                    label = `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)
                        }`
                }


                const options = dropdownOptions[key]

                // 🟢 Use Dropdown for "status", "owner", "category"
                if (options) {
                    return (
                        <DropdownMenu
                            key={key}
                            open={openDropdown === key}
                            onOpenChange={(isOpen) => setOpenDropdown(isOpen ? key : null)}
                        >
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border cursor-pointer hover:bg-gray-200">
                                    <span>{label}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onRemove(key)
                                        }}
                                        className="text-red-500 hover:text-red-700 font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-48 p-2">
                                <h4 className="font-medium text-sm mb-1 capitalize">
                                    Edit {key}
                                </h4>
                                {options.map((opt) => (
                                    <DropdownMenuItem
                                        key={opt}
                                        className="flex items-center gap-2"
                                        onSelect={(e) => e.preventDefault()} // prevent closing
                                    >
                                        <Checkbox
                                            checked={
                                                Array.isArray(value)
                                                    ? value.includes(opt)
                                                    : value === opt
                                            }
                                            onCheckedChange={(checked) => {
                                                let newValue
                                                if (Array.isArray(value)) {
                                                    newValue = checked
                                                        ? [...value, opt]
                                                        : value.filter((v) => v !== opt)
                                                } else {
                                                    newValue = checked ? [opt] : []
                                                }
                                                onUpdate(key, newValue)
                                            }}
                                        />
                                        <Label className="text-sm cursor-pointer">{opt}</Label>
                                    </DropdownMenuItem>
                                ))}

                                <button
                                    onClick={() => {
                                        onRemove(key)
                                        setOpenDropdown(null)
                                    }}
                                    className="text-xs text-red-600 hover:underline mt-2 ml-2"
                                >
                                    Remove Filter
                                </button>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                }

                // 📅 Use Popover for "date range"
                if (key === "createdAt") {
                    return (
                        <Popover
                            key={key}
                            open={openPopover === key}
                            onOpenChange={(isOpen) => setOpenPopover(isOpen ? key : null)}
                        >
                            <PopoverTrigger asChild>
                                <div className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border cursor-pointer hover:bg-gray-200">
                                    <span>{label}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onRemove(key)
                                        }}
                                        className="text-red-500 hover:text-red-700 font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </PopoverTrigger>

                            <PopoverContent className="w-72 p-4" align="start">
                                <h4 className="font-medium text-sm mb-2 capitalize">
                                    Edit Date Range
                                </h4>
                                <CalendarRangeComponent
                                    onApply={(range) => {
                                        onUpdate(key, {
                                            gte: range?.from ?? "",
                                            lte: range?.to ?? "",
                                        })
                                        setOpenPopover(null)
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        onRemove(key)
                                        setOpenPopover(null)
                                    }}
                                    className="text-xs text-red-600 hover:underline mt-2"
                                >
                                    Remove Filter
                                </button>
                            </PopoverContent>
                        </Popover>
                    )
                }

                // ⚙️ Default fallback
                return (
                    <div
                        key={key}
                        className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border"
                    >
                        <span>{label}</span>
                        <button
                            onClick={() => onRemove(key)}
                            className="text-red-500 hover:text-red-700 font-bold"
                        >
                            ✕
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export default ActiveFilters
