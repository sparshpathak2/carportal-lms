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
                <Button variant="outline" className="rounded-full w-fit" size="sm">{label}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="bottom"
                align="start"
                className="p-2 w-48"
            >
                {options.map((option) => (
                    <div key={option} className="flex items-center gap-2 py-1">
                        <Checkbox
                            id={`${filterKey}-${option}`}
                            checked={selectedValues.includes(option)}
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
