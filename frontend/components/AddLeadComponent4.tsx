"use client"

import * as React from "react"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { createLead } from "@/features/leads/api/lead"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { TimePickerComponent } from "./TimePickerComponent"
import { useForm, Controller } from "react-hook-form"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface FormValues {
    name: string
    email?: string
    phone: string
    alternatePhone?: string
    oldModel?: string
    city?: string
    testDrive?: string
    finance?: string
    occupation?: string
    budget?: number
    createdAt?: string
}

export function AddLeadComponent({ open, onOpenChange }: Props) {
    const queryClient = useQueryClient()

    const [createdDate, setCreatedDate] = React.useState<Date | undefined>(undefined)
    const [createdTime, setCreatedTime] = React.useState<string | undefined>(undefined)

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<FormValues>()

    const { mutate, isPending } = useMutation({
        mutationFn: createLead,
        onSuccess: () => {
            toast.success("Lead added successfully")
            onOpenChange(false)
            queryClient.invalidateQueries({ queryKey: ["leads"] })
        },
        onError: (err) => {
            console.error("Error creating lead:", err)
            toast.error("Failed to create lead")
        },
    })

    const onSubmit = (data: FormValues) => {
        // Combine date + time into ISO
        let createdAt: string | undefined
        if (createdDate && createdTime) {
            const [hours, minutes, seconds] = createdTime.split(":")
            const finalDate = new Date(createdDate)
            finalDate.setHours(Number(hours))
            finalDate.setMinutes(Number(minutes))
            finalDate.setSeconds(Number(seconds))
            createdAt = finalDate.toISOString()
        }

        const payload = {
            ...data,
            testDrive: data.testDrive === "Yes",
            finance: data.finance === "Yes",
            ...(createdAt ? { createdAt } : {}),
        }

        // mutate(payload)
        mutate(payload, {
            onSuccess: () => {
                // Clear only phone field
                reset();
                onOpenChange(false);
                queryClient.invalidateQueries({ queryKey: ["leads"] });
            },
        });
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[720px]" side="right">
                <SheetHeader>
                    <SheetTitle>Add Lead</SheetTitle>
                    <SheetDescription>Click Save after filling all the required details.</SheetDescription>
                </SheetHeader>

                <div className="flex flex-col flex-1 overflow-y-auto px-6 gap-6">
                    <form id="lead-form" onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-6">

                        {/* Name */}
                        <div className="grid gap-3">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                {...register("name", { required: "Name is required" })}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>

                        {/* Email */}
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" {...register("email")} />
                        </div>

                        {/* Phone */}
                        <div className="grid gap-3">
                            <Label htmlFor="phone">Phone Number</Label>
                            {/* <Input
                                id="phone"
                                {...register("phone", { required: "Phone number is required" })}
                            /> */}
                            <Input
                                type="tel"
                                inputMode="numeric"
                                {...register("phone", {
                                    required: "Phone number is required",
                                    pattern: {
                                        value: /^\+?\d{8,15}$/,
                                        message: "Enter a valid phone number (8-15 digits, optional +)"
                                    }
                                })}
                            />

                            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                        </div>


                        {/* Alternate Phone */}
                        <div className="grid gap-3">
                            <Label htmlFor="alternatePhone">Alternate Phone Number</Label>
                            <Input id="alternatePhone" {...register("alternatePhone")} />
                        </div>

                        {/* Old Model */}
                        <div className="grid gap-3">
                            <Label htmlFor="oldModel">Old Model</Label>
                            <Input id="oldModel" {...register("oldModel")} />
                        </div>

                        {/* City */}
                        <div className="grid gap-3">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" {...register("city")} />
                        </div>

                        {/* Test Drive */}
                        <div className="grid gap-3">
                            <Label>Test Drive</Label>
                            <Controller
                                control={control}
                                name="testDrive"
                                render={({ field }) => (
                                    <Select {...field}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Finance */}
                        <div className="grid gap-3">
                            <Label>Finance</Label>
                            <Controller
                                control={control}
                                name="finance"
                                render={({ field }) => (
                                    <Select {...field}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Occupation */}
                        <div className="grid gap-3">
                            <Label htmlFor="occupation">Occupation</Label>
                            <Input id="occupation" {...register("occupation")} />
                        </div>

                        {/* Budget */}
                        <div className="grid gap-3">
                            <Label htmlFor="budget">Budget</Label>
                            <Input id="budget" type="number" {...register("budget", { valueAsNumber: true })} />
                        </div>

                        {/* Date & Time */}
                        <TimePickerComponent
                            date={createdDate}
                            time={createdTime}
                            setDate={setCreatedDate}
                            setTime={setCreatedTime}
                        />

                    </form>
                </div>

                <SheetFooter className="mt-4 border-t pt-4">
                    <Button type="submit" form="lead-form">{isPending ? "Saving..." : "Save"}</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
