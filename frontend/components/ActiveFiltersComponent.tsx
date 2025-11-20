"use client"

import React, { useState } from "react"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover"

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
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filters, onRemove }) => {
    const entries = Object.entries(filters)
    const [openPopover, setOpenPopover] = useState<string | null>(null)

    if (entries.length === 0) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-2">
            {entries.map(([key, value]) => {
                let label = ""

                if (key === "createdAt" && typeof value === "object" && value !== null) {
                    const from = new Date(value.gte).toLocaleDateString()
                    const to = new Date(value.lte).toLocaleDateString()
                    label = `Date: ${from} - ${to}`
                } else if (key === "userId") {
                    label = `User: ${value}`
                } else if (key === "status") {
                    label = `Status: ${value}`
                } else {
                    label = `${key}: ${value}`
                }

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
                                        e.stopPropagation() // prevent opening popover on remove click
                                        onRemove(key)
                                    }}
                                    className="text-red-500 hover:text-red-700 font-bold"
                                >
                                    ✕
                                </button>
                            </div>
                        </PopoverTrigger>

                        <PopoverContent
                            className="w-64 p-3"
                            align="start"
                        >
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm capitalize">
                                    Edit {key} Filter
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                    You can customize or remove this filter below.
                                </p>

                                {/* Placeholder for future content */}
                                {key === "createdAt" ? (
                                    <div className="text-sm text-gray-700">📅 Date filter options here</div>
                                ) : key === "status" ? (
                                    <div className="text-sm text-gray-700">🟢 Status options here</div>
                                ) : (
                                    <div className="text-sm text-gray-700">⚙️ Other filter options</div>
                                )}

                                <button
                                    onClick={() => {
                                        onRemove(key)
                                        setOpenPopover(null)
                                    }}
                                    className="text-xs text-red-600 hover:underline"
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
