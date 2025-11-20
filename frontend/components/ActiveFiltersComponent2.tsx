"use client"

import React, { useState } from "react"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CalendarRangeComponent } from "@/components/CalendarRangeComponent"

type DateRange = {
    gte: string | Date
    lte: string | Date
}

type Filters = {
    [key: string]: string | number | DateRange
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

    if (entries.length === 0) return null

    return (
        <div className="flex flex-wrap gap-2">
            {entries.map(([key, value]) => {
                let label = ""

                if (key === "createdAt" && typeof value === "object" && value !== null) {
                    const from = new Date(value.gte).toLocaleDateString()
                    const to = new Date(value.lte).toLocaleDateString()
                    label = `Date: ${from} - ${to}`
                } else {
                    label = `${key}: ${String(value)}`
                }

                const options = dropdownOptions[key]

                return (
                    <Popover
                        key={key}
                        open={openPopover === key}
                        onOpenChange={(isOpen) => setOpenPopover(isOpen ? key : null)}
                    >
                        <PopoverTrigger asChild>
                            <div
                                className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm border cursor-pointer hover:bg-gray-200"
                            >
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

                        <PopoverContent className="w-64 p-3" align="start">
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm capitalize">
                                    Edit {key} Filter
                                </h4>

                                {key === "createdAt" ? (
                                    <CalendarRangeComponent
                                        onApply={(range) => {
                                            onUpdate(key, {
                                                gte: range?.from ?? "",
                                                lte: range?.to ?? "",
                                            })
                                            setOpenPopover(null)
                                        }}
                                    />
                                ) : options ? (
                                    <div className="flex flex-col gap-2">
                                        {options.map((opt) => (
                                            <Label
                                                key={opt}
                                                className="flex items-center gap-2 cursor-pointer"
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
                                                {opt}
                                            </Label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        No custom options for this filter.
                                    </p>
                                )}

                                <button
                                    onClick={() => {
                                        onRemove(key)
                                        setOpenPopover(null)
                                    }}
                                    className="text-xs text-red-600 hover:underline mt-2"
                                >
                                    Remove Filter
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                )
            })}
        </div>
    )
}

export default ActiveFilters
