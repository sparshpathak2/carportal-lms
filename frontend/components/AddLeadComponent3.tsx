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
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { createLead } from "@/features/leads/api/lead"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { TimePickerComponent } from "./TimePickerComponent"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddLeadComponent({ open, onOpenChange }: Props) {
    const queryClient = useQueryClient()

    const [createdDate, setCreatedDate] = useState<Date | undefined>(undefined)
    // const [createdTime, setCreatedTime] = useState("10:30:00")
    const [createdTime, setCreatedTime] = useState<string | undefined>(undefined)
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");

    // --- Combine date + time into ISO string ---
    let createdAt: string | undefined = undefined

    if (createdDate && createdTime) {
        const [hours, minutes, seconds] = createdTime.split(":")
        const finalDate = new Date(createdDate)

        finalDate.setHours(Number(hours))
        finalDate.setMinutes(Number(minutes))
        finalDate.setSeconds(Number(seconds))

        createdAt = finalDate.toISOString()
    }


    // --- Mutation for creating a lead ---
    const { mutate, isPending } = useMutation({
        mutationFn: createLead,
        onSuccess: () => {
            toast.success("Lead added successfully")
            // ✅ close drawer
            onOpenChange(false)

            // ✅ refetch leads list
            queryClient.invalidateQueries({ queryKey: ["leads"] })
        },
        onError: (err) => {
            console.error("Error creating lead:", err)
            toast.error("Failed to create lead")
            // You can add a toast/notification here
        },
    })

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!phone.trim()) {
            setPhoneError("Phone number is required");
            return;
        }
        setPhoneError(""); // clear error

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        // 🔹 Transform values into correct types
        const payload = {
            name: data.name as string,
            email: (data.email as string) || undefined,
            phone: (data.phone as string) || undefined,
            alternatePhone: (data.alternatePhone as string) || undefined,
            oldModel: (data.oldModel as string) || undefined,
            // location: (data.location as string) || undefined,
            city: (data.city as string) || undefined,
            testDrive: data.testDrive === "Yes",
            finance: data.finance === "Yes",
            occupation: (data.occupation as string) || undefined,
            budget: data.budget ? Number(data.budget) : undefined,
            ...(createdAt ? { createdAt } : {})
        }

        mutate(payload)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {/* <SheetContent className="flex flex-col w-full sm:w-[600px] max-w-[90vw]"> */}
            <SheetContent className="w-full sm:max-w-[720px]" side="right">
                <SheetHeader>
                    <SheetTitle>Add Lead</SheetTitle>
                    <SheetDescription>
                        Click Save after filling all the required deatails.
                    </SheetDescription>
                </SheetHeader>



                {/* Scrollable body */}
                <div className="flex flex-col flex-1 overflow-y-auto px-6 gap-6">

                    <form
                        id="lead-form"
                        onSubmit={handleSubmit}
                        className="grid sm:grid-cols-2 gap-6"
                    >
                        <div className="grid gap-3">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" required />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="phone">Phone Number</Label>
                            {/* <Input id="phone" name="phone" type="tel" /> */}
                            <Input
                                value={phone}
                                name="phone"
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    if (phoneError) setPhoneError("");
                                }}
                                className={phoneError ? "border-red-500" : ""}
                            />

                            {phoneError && (
                                <p className="text-red-500 text-sm px-1">{phoneError}</p>
                            )}
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="alternatePhone">Alternate Phone Number</Label>
                            <Input id="alternatePhone" name="alternatePhone" type="tel" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="oldModel">Old Model</Label>
                            <Input id="oldModel" name="oldModel" />
                        </div>
                        {/* <div className="grid gap-3">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" name="location" />
                        </div> */}
                        <div className="grid gap-3">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" />
                        </div>
                        {/* <div className="grid gap-3">
                            <Label htmlFor="leadForwardedTo">Lead Forwarded To (comma separated)</Label>
                            <Input id="leadForwardedTo" name="leadForwardedTo" placeholder="e.g. Dealer A, Dealer B" />
                        </div> */}
                        <div className="grid gap-3">
                            <Label>Test Drive</Label>
                            <div className="flex items-center gap-2">
                                <Select
                                    name="testDrive"
                                >
                                    <SelectTrigger id="testDrive" className="w-full">
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Yes">Yes</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Label>Finance</Label>
                            <div className="flex items-center gap-2">
                                <Select
                                    name="finance"
                                >
                                    <SelectTrigger id="finance" className="w-full">
                                        <SelectValue placeholder="Select option" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Yes">Yes</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>

                            </div>
                        </div>
                        {/* <div className="grid gap-3">
                            <Label htmlFor="callBack">Call Back</Label>
                            <Input id="callBack" name="callBack" />
                        </div> */}
                        <div className="grid gap-3">
                            <Label htmlFor="occupation">Occupation</Label>
                            <Input id="occupation" name="occupation" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="budget">Budget</Label>
                            <Input id="budget" name="budget" type="number" />
                        </div>

                        <TimePickerComponent
                            date={createdDate}
                            time={createdTime}
                            setDate={setCreatedDate}
                            setTime={setCreatedTime}
                        />
                        {/* <div className="grid gap-3 sm:col-span-2">
                            <Label htmlFor="remark">Remark</Label>
                            <textarea
                                id="remark"
                                name="remark"
                                rows={4}
                                className="border border-gray-300 rounded-md p-2 text-sm"
                                placeholder="Enter your remarks here..."
                            />
                        </div> */}

                    </form>

                </div>

                {/* Sticky footer (not part of scrolling) */}
                <SheetFooter className="mt-4 border-t pt-4">
                    <Button
                        type="submit"
                        form="lead-form"
                    // className="flex w-full items-center gap-1.5"
                    >
                        {isPending ? "Saving..." : "Save"}
                    </Button>
                    {/* <div className="flex items-center gap-1.5">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving
                    </div> */}
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet >
    )
}
