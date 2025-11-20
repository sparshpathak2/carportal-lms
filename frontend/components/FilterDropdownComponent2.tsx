import { useState, useEffect } from "react"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface FilterDropdownProps {
    label: string
    filterKey: string
    options: string[]
    selectedValues: string[]
    onChange: (newFilters: Record<string, any>) => void
}

export function FilterDropdownComponent({
    label,
    filterKey,
    options,
    selectedValues,
    onChange,
}: FilterDropdownProps) {
    const [localSelected, setLocalSelected] = useState<string[]>(selectedValues || [])

    // Keep local state in sync if parent updates it
    useEffect(() => {
        setLocalSelected(selectedValues || [])
    }, [selectedValues])

    const handleCheckboxChange = (value: string) => {
        const updated = localSelected.includes(value)
            ? localSelected.filter((v) => v !== value)
            : [...localSelected, value]

        setLocalSelected(updated)
        onChange({ [filterKey]: updated })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    {label}
                    {localSelected.length > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground">
                            ({localSelected.length})
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="p-2 w-48">
                {options.map((option) => (
                    <div key={option} className="flex items-center gap-2 py-1">
                        <Checkbox
                            id={`${filterKey}-${option}`}
                            checked={localSelected.includes(option)}
                            onCheckedChange={() => handleCheckboxChange(option)}
                        />
                        <label
                            htmlFor={`${filterKey}-${option}`}
                            className="text-sm cursor-pointer"
                        >
                            {option}
                        </label>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
