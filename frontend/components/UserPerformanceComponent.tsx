"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Lead, LeadLostReason, LeadStatus, User } from "@/lib/types"
import { Info, Loader2, SquarePen } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import toast from "react-hot-toast"
import { Badge } from "./ui/badge"
import { DealersAssignedTableComponent } from "./DealersAssignedTableComponent"
import { IconCirclePlus, IconExclamationCircle, IconFilter2, IconPlus } from "@tabler/icons-react"
import { UserPerformanceTableComponent } from "./UserPerformanceTableComponent2"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

type Props = {
    user: User
    // statuses: LeadStatus[] // pass from API
    // lostReasons: LeadLostReason[] // pass from API
    // handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    isSaving: boolean
    updateUserMutation: any
}

export default function UserPerformanceComponent({ user, updateUserMutation, isSaving }: Props) {
    const [isEditable, setIsEditable] = useState(false)

    // original values for dirty checks
    const original = useMemo(() => ({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        alternatePhone: user?.alternatePhone || "",
        location: user?.location || "",
        city: user?.city || "",
    }), [user])

    const [formData, setFormData] = useState(original)

    // check if data changed
    const isDirty = JSON.stringify(formData) !== JSON.stringify(original)

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            await updateUserMutation.mutateAsync(data);
            toast.success('Lead updated successfully!');
            setIsEditable(false);
            // console.log('Lead updated successfully');
        } catch (error: any) {
            // console.error('Failed to update lead:', error);
            toast.error(error?.message || 'Failed to update lead');
        }
    };

    return (
        <div className="flex flex-col border h-full w-full bg-white">
            <div className="flex w-full border-b px-4 py-2 justify-between items-center">
                <div className="font-semibold border-b-2 border-white text-gray-600">User Performance</div>
                {/* {!isEditable &&
                    <SquarePen
                        className="w-5 h-5 cursor-pointer"
                        onClick={() => setIsEditable((prev) => !prev)}
                    />
                } */}
            </div>

            <div className="flex-1 h-full w-full overflow-y-auto">

                {/* Dealers Assigned */}
                <div className="flex gap-2 px-4 py-2 justify-between items-center">
                    <div className="font-semibold">Dealers Assigned</div>
                    {/* <IconCirclePlus
                        className="w-5 h-5 cursor-pointer"
                        onClick={() => setIsEditable((prev) => !prev)}
                    /> */}

                    {/* <Button
                        size='xs'
                        onClick={() => setIsEditable((prev) => !prev)}
                    >
                        Add
                        <IconPlus />
                    </Button> */}
                </div>

                <div className="border-y-1">
                    <UserPerformanceTableComponent
                        user={user}
                    />
                </div>

                <div className="flex gap-2 px-4 py-2 justify-between items-center">
                    <div className="font-semibold">Performance Metrics</div>
                    {/* <SquarePen
                        className="w-5 h-5 cursor-pointer"
                        onClick={() => setIsEditable((prev) => !prev)}
                    /> */}
                    <Button
                        size='xs'
                        variant='outline'
                        onClick={() => setIsEditable((prev) => !prev)}
                    >
                        <IconFilter2 />
                        Filter
                    </Button>
                </div>


                <div className="flex flex-col bg-gray-50 border-y-1 text-sm">
                    <div className="flex w-full justify-between py-2 px-4 border-b-1">
                        <div className="flex gap-2">
                            <div className="font-semibold">Leads Assigned</div>
                            {/* <Popover>
                                <PopoverTrigger><Info size={18} /></PopoverTrigger>
                                <PopoverContent>Place content for the popover here.</PopoverContent>
                            </Popover> */}
                        </div>
                        <div>Value 1</div>
                    </div>
                    <div className="flex w-full justify-between py-2 px-4 border-b-1">
                        <div className="font-semibold">Leads Unattended</div>
                        <div>Value 1</div>
                    </div>
                    <div className="flex w-full justify-between py-2 px-4 border-b-1">
                        <div className="font-semibold">Pending Followups</div>
                        <div>Value 1</div>
                    </div>
                    <div className="flex w-full justify-between py-2 px-4">
                        <div className="font-semibold">Leads Converted</div>
                        <div>Value 1</div>
                    </div>
                    <div className="flex w-full justify-between py-2 px-4">
                        <div className="font-semibold">Average Response Time</div>
                        <div>Value 1</div>
                    </div>
                </div>

            </div>

            <div className="flex justify-end gap-2 px-4.5 py-3 border-t sticky bottom-0 bg-white">

                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    // onClick={() => setIsEditable(false)}
                    onClick={() => {
                        setFormData(original)
                        setIsEditable(false)
                    }}
                    disabled={!isEditable}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="leadDetailsForm"
                    size="sm"
                    disabled={!isEditable || !isDirty || isSaving}
                >
                    {isSaving ? (
                        <>
                            <div className="flex items-center gap-1.5">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving
                            </div>
                        </>
                    ) : (
                        "Save"
                    )}
                </Button>
            </div>

        </div >
    )
}
