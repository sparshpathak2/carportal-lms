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

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddLeadComponent({ open, onOpenChange }: Props) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())
        console.log("Form Submitted:", data)
        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[800px]" side="right">
                <SheetHeader>
                    <SheetTitle>Add Lead</SheetTitle>
                    <SheetDescription>
                        Enter lead details below.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="grid sm:grid-cols-2 gap-6 px-4 flex-1 overflow-y-auto">
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
                            <Input id="phone" name="phone" type="tel" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="alternatePhone">Alternate Phone Number</Label>
                            <Input id="alternatePhone" name="alternatePhone" type="tel" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="oldModel">Old Model</Label>
                            <Input id="oldModel" name="oldModel" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" name="location" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" name="city" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="leadForwardedTo">Lead Forwarded To (comma separated)</Label>
                            <Input id="leadForwardedTo" name="leadForwardedTo" placeholder="e.g. Dealer A, Dealer B" />
                        </div>
                        <div className="grid gap-3">
                            <Label>Test Drive</Label>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="testDrive" name="testDrive" value="true" />
                                <Label htmlFor="testDrive">Yes</Label>
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Label>Finance</Label>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="finance" name="finance" value="true" />
                                <Label htmlFor="finance">Yes</Label>
                            </div>
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="callBack">Call Back</Label>
                            <Input id="callBack" name="callBack" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="occupation">Occupation</Label>
                            <Input id="occupation" name="occupation" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="budget">Budget</Label>
                            <Input id="budget" name="budget" type="number" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="budget">Budget</Label>
                            <Input id="budget" name="budget" type="number" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="budget">Budget</Label>
                            <Input id="budget" name="budget" type="number" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="budget">Budget</Label>
                            <Input id="budget" name="budget" type="number" />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="budget">Budget</Label>
                            <Input id="budget" name="budget" type="number" />
                        </div>

                    </div>

                    {/* <SheetFooter className="flex flex-row w-full justify-end">
                        <SheetClose asChild>
                            <Button variant="outline">Close</Button>
                        </SheetClose>
                    <Button type="submit">Save changes</Button>
                </SheetFooter> */}

                </form>

                {/* Sticky footer (not part of scrolling) */}
                <SheetFooter className="mt-4 border-t pt-4">
                    <Button type="submit" form="lead-form">Save changes</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet >
    )
}
