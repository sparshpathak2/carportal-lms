"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Lead, LeadLostReason, LeadStatus, User } from "@/lib/types"
import { Loader2, SquarePen } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import toast from "react-hot-toast"
import { Badge } from "./ui/badge"
import { DealersAssignedTableComponent } from "./DealersAssignedTableComponent"
import { IconCirclePlus, IconPencil, IconPlus } from "@tabler/icons-react"

type Props = {
    user: User
    // statuses: LeadStatus[] // pass from API
    // lostReasons: LeadLostReason[] // pass from API
    // handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    isSaving: boolean
    updateUserMutation: any
}

export default function UserDetailsForm({ user, updateUserMutation, isSaving }: Props) {
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
                <div className="font-semibold border-b-2 border-white text-gray-600">User Details</div>
                {/* {!isEditable &&
                    <SquarePen
                        className="w-5 h-5 cursor-pointer"
                        onClick={() => setIsEditable((prev) => !prev)}
                    />
                } */}
            </div>

            <div className="flex-1 h-full w-full overflow-y-auto">

                {/* Dealers Assigned */}
                {/* <div className="flex gap-2 px-4 py-2 justify-between items-center">
                    <div className="font-semibold">Dealers Assigned</div>
                    <IconCirclePlus
                        className="w-5 h-5 cursor-pointer"
                        onClick={() => setIsEditable((prev) => !prev)}
                    />

                    <Button
                        size='xs'
                        onClick={() => setIsEditable((prev) => !prev)}
                    >
                        <IconPlus />
                        Add
                    </Button>

                    <button className="underline">Add</button>
                </div> */}

                {/* <div className="border-y-1">
                    <DealersAssignedTableComponent
                        user={user}
                    />
                </div> */}

                <div className="flex gap-2 px-4 py-2 justify-between items-center">
                    <div className="font-semibold">Personal Details</div>
                    <SquarePen
                        className="w-5 h-5 cursor-pointer"
                        onClick={() => setIsEditable((prev) => !prev)}
                    />
                    {/* <Button
                        size='xs'
                        onClick={() => setIsEditable((prev) => !prev)}
                    >
                        <IconPencil />
                        Edit
                    </Button> */}
                </div>

                <form
                    id="leadDetailsForm"
                    onSubmit={handleSubmit}
                    // className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 p-4.5 overflow-y-auto"
                    className="flex-1 w-full overflow-y-auto"
                >
                    {/* Dealers Assigned */}
                    {/* <div className="flex gap-2 px-4 py-2 justify-between items-center">
                        <div className="font-semibold">Dealers Assigned</div>
                        <SquarePen
                            className="w-5 h-5 cursor-pointer"
                            onClick={() => setIsEditable((prev) => !prev)}
                        />
                    </div>

                    <div className="border-y-1">
                        <DealersAssignedTableComponent
                            user={user}
                        />
                    </div> */}


                    {/* Other Details */}
                    {/* <div className="flex gap-2 px-4 py-2 justify-between items-center">
                        <div className="font-semibold">Personal Details</div>
                        <SquarePen
                            className="w-5 h-5 cursor-pointer"
                            onClick={() => setIsEditable((prev) => !prev)}
                        />
                    </div> */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4.5 bg-gray-50 border-y-1">

                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-gray-500">Name</Label>
                            {isEditable ?
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={user?.name || ""}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    disabled={!isEditable}
                                />
                                :
                                <div className="py-[6px]">{user?.name || "-"}</div>
                            }
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-gray-500">Email</Label>
                            {isEditable ?
                                <Input
                                    id="email"
                                    name="email"
                                    defaultValue={user?.email || ""}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                    disabled={!isEditable}
                                />
                                :
                                <div className="py-[6px]">{user?.email || "-"}</div>
                            }
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone" className="text-gray-500">Phone</Label>
                            {isEditable ?
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    defaultValue={user?.phone || ""}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                    disabled={!isEditable}
                                />
                                :
                                <div className="py-[6px]">{user?.phone || "-"}</div>
                            }
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="alternatePhone" className="text-gray-500">Alternate Phone</Label>
                            {isEditable ?
                                <Input
                                    id="alternatePhone"
                                    name="alternatePhone"
                                    type="tel"
                                    defaultValue={user?.alternatePhone || ""}
                                    onChange={(e) => handleChange("alternatePhone", e.target.value)}
                                    disabled={!isEditable}
                                />
                                :
                                <div className="py-[6px]">{user?.alternatePhone || "-"}</div>
                            }
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location" className="text-gray-500">Location</Label>
                            {isEditable ?
                                <Input
                                    id="location"
                                    name="location"
                                    defaultValue={user?.location || ""}
                                    onChange={(e) => handleChange("location", e.target.value)}
                                    disabled={!isEditable}
                                />
                                :
                                <div className="py-[6px]">{user?.location || "-"}</div>
                            }
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="city" className="text-gray-500">City</Label>
                            {isEditable ?
                                <Input
                                    id="city"
                                    name="city"
                                    defaultValue={user?.city || ""}
                                    onChange={(e) => handleChange("city", e.target.value)}
                                    disabled={!isEditable}
                                />
                                :
                                <div className="py-[6px]">{user?.city || "-"}</div>
                            }
                        </div>

                        {/* <div className="grid gap-2">
                        <Label htmlFor="testDrive" className="text-gray-500">Test Drive</Label>
                        {isEditable ?
                            <Select
                                name="testDrive"
                                disabled={!isEditable}
                                // value={testDrive}
                                value={formData.testDrive}
                                // onValueChange={setTestDrive}
                                onValueChange={(val) => handleChange("testDrive", val)}
                            >
                                <SelectTrigger id="testDrive" className="w-full">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Yes">Yes</SelectItem>
                                    <SelectItem value="No">No</SelectItem>
                                </SelectContent>
                            </Select>
                            :
                            <div className="py-[6px]">{lead?.testDrive || "-"}</div>
                        }
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="finance" className="text-gray-500">Finance</Label>
                        {isEditable ?
                            <Select
                                name="finance"
                                disabled={!isEditable}
                                // value={finance}
                                value={formData.finance}
                                // onValueChange={setFinance}
                                onValueChange={(val) => handleChange("finance", val)}
                            >
                                <SelectTrigger id="finance" className="w-full">
                                    <SelectValue placeholder="Select option" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Yes">Yes</SelectItem>
                                    <SelectItem value="No">No</SelectItem>
                                </SelectContent>
                            </Select>
                            :
                            <div className="py-[6px]">{lead?.finance || "-"}</div>
                        }
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="occupation" className="text-gray-500">Occupation</Label>
                        {isEditable ?
                            <Input
                                id="occupation"
                                name="occupation"
                                defaultValue={lead?.occupation || ""}
                                onChange={(e) => handleChange("occupation", e.target.value)}
                                disabled={!isEditable}
                            />
                            :
                            <div className="py-[6px]">{lead?.occupation || "-"}</div>
                        }
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="budget" className="text-gray-500">Budget</Label>
                        {isEditable ?
                            <Input
                                id="budget"
                                name="budget"
                                type="number"
                                defaultValue={lead?.budget || ""}
                                onChange={(e) => handleChange("budget", e.target.value)}
                                disabled={!isEditable}
                            />
                            :
                            <div className="py-[6px]">{lead?.budget || "-"}</div>
                        }
                    </div> */}


                    </div>



                </form >

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
