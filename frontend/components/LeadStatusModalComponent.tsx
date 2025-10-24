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
import { Lead, LeadLostReason, LeadStatus } from "@/lib/types"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    lead: Lead
    statuses: LeadStatus[]
    lostReasons: LeadLostReason[]
    isSaving: boolean
    onSubmit?: (data: { status: string; lostReason?: string }) => void
    updateLeadMutation: any
}

export function LeadStatusModalComponent({
    open,
    onOpenChange,
    lead,
    statuses,
    lostReasons,
    isSaving,
    updateLeadMutation
}: Props) {

    const [formData, setFormData] = useState({
        status: lead?.status?.name || "",
        lostReason: lead?.lostReason?.name || "",
    })

    // Track initial values for change detection
    const [initialStatus, setInitialStatus] = useState("")
    const [initialLostReason, setInitialLostReason] = useState("")

    useEffect(() => {
        if (open) {
            const initialStatusValue = lead?.status?.name || ""
            const initialLostReasonValue = lead?.lostReason?.name || ""
            setFormData({ status: initialStatusValue, lostReason: initialLostReasonValue })
            setInitialStatus(initialStatusValue)
            setInitialLostReason(initialLostReasonValue)
        }
    }, [open, lead])

    useEffect(() => {
        if (open) {
            // Reset when reopened with fresh data
            setFormData({
                status: lead?.status?.name || "",
                lostReason: lead?.lostReason?.name || "",
            })
        }
    }, [open, lead])

    const handleChange = (key: "status" | "lostReason", value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            await updateLeadMutation.mutateAsync(data);
            toast.success('Lead updated successfully!');
            // setIsEditable(false);
            // console.log('Lead updated successfully');
            // ✅ Close the modal on success
            onOpenChange(false)
        } catch (error: any) {
            // console.error('Failed to update lead:', error);
            toast.error(error?.message || 'Failed to update lead');
        }
    };

    // Disable Save button logic
    const isButtonDisabled = useMemo(() => {
        const { status, lostReason } = formData

        // If no status selected
        if (!status) return true

        // If Lost selected but no reason
        if (status === "Lost" && !lostReason) return true

        // If values unchanged
        if (status === initialStatus && lostReason === initialLostReason) return true

        // If currently saving
        if (isSaving) return true

        return false
    }, [formData, initialStatus, initialLostReason, isSaving])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Change Lead Status</DialogTitle>
                    {/* <DialogDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </DialogDescription> */}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4">
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
                                <Label htmlFor="status" className="text-gray-500">
                                    Status
                                </Label>
                                <Select
                                    name="status"
                                    value={formData.status}
                                    onValueChange={(val) => {
                                        handleChange("status", val)
                                        if (val !== "Lost") handleChange("lostReason", "")
                                    }}
                                >
                                    <SelectTrigger id="status" className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((s) => (
                                            <SelectItem key={s.id} value={s.name}>
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Lost Reason field: only show when status is LOST */}
                            {formData.status === "Lost" && (
                                <div className="flex flex-col flex-1 gap-2">
                                    <Label htmlFor="lostReason" className="text-gray-500">
                                        Lost Reason
                                    </Label>
                                    <Select
                                        name="lostReason"
                                        value={formData.lostReason}
                                        onValueChange={(val) => handleChange("lostReason", val)}
                                    >
                                        <SelectTrigger id="lostReason" className="w-full">
                                            <SelectValue placeholder="Select reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {lostReasons.map((r) => (
                                                <SelectItem key={r.id} value={r.name}>
                                                    {r.name.replace(/_/g, " ")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        {/* <Button type="submit">Save changes</Button> */}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isButtonDisabled}
                        >
                            {isSaving ? (
                                <>
                                    <div className="flex items-center gap-1.5">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving
                                    </div>
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
