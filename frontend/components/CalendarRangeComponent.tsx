"use client";

import * as React from "react";
import { type DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="flex items-center justify-between rounded-full"
                    size="sm"
                >
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {dateRange?.from ? (
                            dateRange.to ? (
                                <span>
                                    {format(dateRange.from, "MMM d, yyyy")} -{" "}
                                    {format(dateRange.to, "MMM d, yyyy")}
                                </span>
                            ) : (
                                <span>{format(dateRange.from, "MMM d, yyyy")}</span>
                            )
                        ) : (
                            <span>Filter by Date</span>
                        )}
                    </div>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-4" align="start">
                <div className="flex flex-col gap-4">
                    <Calendar
                        mode="range"
                        numberOfMonths={2}
                        selected={dateRange}
                        onSelect={setDateRange}
                        className="rounded-lg border"
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
