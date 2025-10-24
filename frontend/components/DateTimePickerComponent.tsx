"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { IconChevronDown } from "@tabler/icons-react"

type DateTimePickerProps = {
    value: Date | null
    onChange: (date: Date | null) => void
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)

    // Split value into date + time
    const currentDate = value ?? undefined
    const currentTime = value
        ? value.toISOString().substring(11, 16) // "HH:MM"
        : ""

    // Handle date change
    const handleDateChange = (selected: Date | undefined) => {
        if (!selected) {
            onChange(null)
            return
        }
        // preserve old time if any
        let hours = value ? value.getHours() : 0
        let minutes = value ? value.getMinutes() : 0
        const newDate = new Date(selected)
        newDate.setHours(hours, minutes, 0, 0)
        onChange(newDate)
        setOpen(false)
    }

    // Handle time change
    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!value) return
        const [h, m] = e.target.value.split(":").map(Number)
        const newDate = new Date(value)
        newDate.setHours(h, m, 0, 0)
        onChange(newDate)
    }

    return (
        <div className="flex gap-4">
            <div className="flex flex-col gap-1">
                {/* <Label htmlFor="date-picker" className="px-1">
                    Date
                </Label> */}
                <div className="text-sm">Due date</div>

                <div className="flex gap-2">
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date-picker"
                                className="w-32 justify-between font-normal"
                            >
                                {/* {date ? date.toLocaleDateString() : "Select date"} */}
                                {currentDate
                                    ? currentDate.toLocaleDateString()
                                    : "Select date"}
                                <IconChevronDown />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={currentDate}
                                captionLayout="dropdown"
                                // onSelect={(date) => {
                                //     setDate(date)
                                //     setOpen(false)
                                // }}
                                onSelect={handleDateChange}
                            />
                        </PopoverContent>
                    </Popover>


                    <div className="flex flex-col gap-1">
                        {/* <Label htmlFor="time-picker" className="px-1">
                    Time
                </Label> */}
                        {/* <div className="text-sm">Time</div> */}
                        <Input
                            type="time"
                            id="time-picker"
                            value={currentTime}
                            // step="1"
                            // defaultValue="10:30:00"
                            onChange={handleTimeChange}
                            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}
