"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useEffect, useMemo, useState } from "react"
import { Lead, LeadCategory, LeadLostReason, LeadStatus } from "@/lib/types"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { leadCategory } from "@/app/constants/constants"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    // lead: Lead
    // statuses: LeadStatus[]
    // lostReasons: LeadLostReason[]
    // isSaving: boolean
    // onSubmit?: (data: { status: string; lostReason?: string }) => void
    // updateLeadMutation: any
}

export function TableFilterComponent({
    open,
    onOpenChange,
    // lead,
    // statuses,
    // lostReasons,
    // isSaving,
    // updateLeadMutation
}: Props) {

    // const [formData, setFormData] = useState<{ category: LeadCategory | "" }>({
    //     category: lead?.category || "",
    // })

    const [initialCategory, setInitialCategory] = useState("")

    // useEffect(() => {
    //     if (open) {
    //         const initialCategoryValue = lead?.category || ""
    //         setFormData({ category: initialCategoryValue })
    //         setInitialCategory(initialCategoryValue)
    //     }
    // }, [open, lead])

    // useEffect(() => {
    //     if (open) {
    //         // Reset when reopened with fresh data
    //         setFormData({
    //             category: lead?.category || "",
    //         })
    //     }
    // }, [open, lead])

    // const handleChange = (key: keyof typeof formData, value: "" | LeadCategory) => {
    //     setFormData((prev) => ({ ...prev, [key]: value }))
    // }


    // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     const formData = new FormData(e.currentTarget);
    //     const data = Object.fromEntries(formData.entries());

    //     // console.log("formData:", formData)
    //     console.log("data:", data)

    //     try {
    //         await updateLeadMutation.mutateAsync(data);
    //         toast.success('Lead updated successfully!');
    //         // setIsEditable(false);
    //         // console.log('Lead updated successfully');
    //         // ✅ Close the modal on success
    //         onOpenChange(false)
    //     } catch (error: any) {
    //         // console.error('Failed to update lead:', error);
    //         toast.error(error?.message || 'Failed to update lead');
    //     }
    // };

    // Disable Save button logic
    // const isButtonDisabled = useMemo(() => {
    //     const { category } = formData

    //     // If no category selected
    //     if (!category) return true

    //     // If values unchanged
    //     if (category === initialCategory) return true

    //     // If currently saving
    //     if (isSaving) return true

    //     return false
    // }, [formData, initialCategory, isSaving])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                    {/* <DialogDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </DialogDescription> */}
                </DialogHeader>

                {/* <form onSubmit={handleSubmit} className="grid gap-4"> */}
                <form className="grid gap-4">
                    {/* <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="username-1">Username</Label>
                        <Input id="username-1" name="username" defaultValue="@peduarte" />
                    </div> */}

                    {/* Status + Lost Reason Section */}
                    <div className="grid gap-2">
                        <div className="flex gap-2 items-center">
                            {/* Status field */}
                            <div className="flex flex-col flex-1 gap-2">
                                <Label htmlFor="category" className="text-gray-500">
                                    Category
                                </Label>
                                <Select
                                    name="category"
                                // value={formData.category}
                                // onValueChange={(val) => handleChange("category", val as LeadCategory)}
                                >
                                    <SelectTrigger id="status" className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {leadCategory.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {c}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        {/* <Button type="submit">Save changes</Button> */}
                        <Button
                            type="submit"
                            size="sm"
                        // disabled={isButtonDisabled}
                        >
                            {/* {isSaving ? (
                                <>
                                    <div className="flex items-center gap-1.5">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving
                                    </div>
                                </>
                            ) : (
                                "Save Changes"
                            )} */}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
