"use client";

import * as React from "react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils"; // optional: if you use cn() helper from Shadcn

export function CalendarRangeComponent({
    onApply,
}: {
    onApply?: (range: DateRange | undefined) => void;
}) {
    const [open, setOpen] = React.useState(false);
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>();

    const handleApply = () => {
        onApply?.(dateRange);
        setOpen(false);
    };

    const displayValue = dateRange?.from
        ? dateRange.to
            ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`
            : `${format(dateRange.from, "MMM d, yyyy")}`
        : "";

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="relative w-[250px]">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <input
                        type="text"
                        readOnly
                        onClick={() => setOpen(true)}
                        value={displayValue}
                        placeholder="Filter by Date"
                        className={cn(
                            "w-full rounded-full border border-gray-300 pl-9 pr-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        )}
                    />
                </div>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-4" align="start">
                <div className="flex flex-col gap-4">
                    <Calendar
                        mode="range"
                        numberOfMonths={2}
                        selected={dateRange}
                        onSelect={setDateRange}
                        className="rounded-lg border shadow-sm"
                    />

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setDateRange(undefined);
                                onApply?.(undefined);
                                setOpen(false);
                            }}
                        >
                            Clear
                        </Button>
                        <Button size="sm" onClick={handleApply}>
                            Apply
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
