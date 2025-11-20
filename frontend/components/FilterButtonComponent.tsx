'use client'

import { Button } from "@/components/ui/button"
import { IconFilter2, IconX } from "@tabler/icons-react"
import { useState } from "react"

export function FilterButton({ selectedFilters, onClear }: { selectedFilters: string[]; onClear: () => void }) {
    const [hovered, setHovered] = useState(false)

    return (
        // <Button
        //     size="sm"
        //     variant="outline"
        //     onMouseEnter={() => setHovered(true)}
        //     onMouseLeave={() => setHovered(false)}
        //     className={`rounded-full w-fit flex items-center gap-1 transition-all ${selectedFilters.length > 0 ? "!pr-1 !pl-2" : "!px-2"
        //         }`}
        // >
        //     <IconFilter2 size={16} />
        //     <span>Filter</span>

        //     {selectedFilters.length > 0 && (
        //         <div
        //             className="flex w-5 h-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs transition-all cursor-pointer hover:bg-red-600"
        //             onClick={(e) => {
        //                 e.stopPropagation()
        //                 onClear()
        //             }}
        //         >
        //             {hovered ? <IconX size={12} /> : selectedFilters.length}
        //         </div>
        //     )}
        // </Button>
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
    )
}
