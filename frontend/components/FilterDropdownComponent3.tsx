import { useState, useEffect } from "react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface FilterDropdownProps {
    label: string
    filterKey: string
    options: string[]
    selectedValues?: string[]
    onChange: (newFilters: Record<string, string[]>) => void
}

export function FilterDropdownComponent({
    label,
    filterKey,
    options,
    selectedValues = [],
    onChange,
}: FilterDropdownProps) {
    const [localSelected, setLocalSelected] = useState<string[]>(selectedValues)

    // keep local state in sync with parent prop
    useEffect(() => {
        setLocalSelected(Array.isArray(selectedValues) ? selectedValues : [])
    }, [selectedValues])

    const handleCheckboxChange = (option: string) => {
        const currentValues = Array.isArray(localSelected) ? localSelected : []
        const updated = currentValues.includes(option)
            ? currentValues.filter((v) => v !== option)
            : [...currentValues, option]

        setLocalSelected(updated)
        onChange({ [filterKey]: updated })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-md">
                    {label} {localSelected.length > 0 && `(${localSelected.length})`}
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
                        <label htmlFor={`${filterKey}-${option}`} className="text-sm cursor-pointer">
                            {option}
                        </label>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
