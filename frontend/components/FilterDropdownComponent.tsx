import { useState } from "react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"
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

    const handleCheckboxChange = (value: string) => {
        const updated = localSelected.includes(value)
            ? localSelected.filter((v) => v !== value)
            : [...localSelected, value]

        setLocalSelected(updated)

        // Notify parent in a controlled way
        onChange({ [filterKey]: updated })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">{label}</Button>
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
