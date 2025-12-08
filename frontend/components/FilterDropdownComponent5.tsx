"use client"

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface FilterDropdownProps {
    label: string
    filterKey: string
    options: string[]
    selectedValues: string[]
    onChange: (newFilters: Record<string, string[]>) => void
}

export function FilterDropdownComponent({
    label,
    filterKey,
    options,
    selectedValues,
    onChange,
}: FilterDropdownProps) {
    const handleCheckboxChange = (value: string) => {
        const updated = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value]

        onChange({ [filterKey]: updated })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="sm"
                    variant="outline"
                    className={`rounded-full w-fit ${selectedValues.length > 0 ? "pr-1 pl-2" : "px-2"}`}
                >
                    {label} {selectedValues.length > 0 ? <div className="flex w-5 h-5 items-center justify-center rounded-full bg-blue-600 text-white">
                        {selectedValues.length}
                    </div> : ""}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                side="bottom"
                align="start"
                sideOffset={6}
                className="p-1 w-48"
            >
                {options?.map((option) => (
                    <div
                        key={option}
                        onClick={() => handleCheckboxChange(option)}
                        className="w-full flex items-center gap-2 px-2 py-1 rounded-md hover:bg-accent cursor-pointer text-left"
                    >
                        <Checkbox
                            checked={selectedValues.includes(option)}
                            onCheckedChange={() => handleCheckboxChange(option)}
                            onClick={(e) => e.stopPropagation()} // prevent double toggle
                        />
                        <span className="text-sm">{option}</span>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
