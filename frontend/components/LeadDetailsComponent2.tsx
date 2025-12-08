"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Lead, LeadLostReason, LeadStatus } from "@/lib/types"
import { Loader2, SquarePen } from "lucide-react"
import { useContext, useMemo, useState } from "react"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import toast from "react-hot-toast"
import { Badge } from "./ui/badge"
import { resolveLeadComputedFields } from "@/lib/leadResolution"
import { SessionContext } from "./SessionProvider"

type LeadDetailsFormProps = {
    lead: Lead
    statuses: LeadStatus[] // pass from API
    lostReasons: LeadLostReason[] // pass from API
    // handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    isSaving: boolean
    updateLeadMutation: any
}

export default function LeadDetailsForm({ lead, statuses, lostReasons, updateLeadMutation, isSaving }: LeadDetailsFormProps) {
    const [isEditable, setIsEditable] = useState(false)
    const { user } = useContext(SessionContext)

    console.log("user in leadsDeatisl:", user)

    // RESOLVE computed values
    const { resolvedStatus, resolvedCategory, resolvedAssignedToName, resolvedLeadLostReason } =
        resolveLeadComputedFields(lead, user) // If you have user, pass here



    // original values for dirty check
    const original = useMemo(() => ({
        name: lead?.customer?.name || "",
        email: lead?.customer?.email || "",
        phone: lead?.customer?.phone || "",
        // status: lead?.status?.name || "",
        status: resolvedStatus || "",
        lostReason: lead?.lostReason?.name || "",
        alternatePhone: lead?.customer?.alternatePhone || "",
        oldModel: lead?.oldModel || "",
        // location: lead?.customer?.location || "",
        city: lead?.customer?.city || "",
        testDrive: lead?.testDrive ? "Yes" : "No",
        finance: lead?.finance ? "Yes" : "No",
        occupation: lead?.occupation || "",
        budget: lead?.budget || ""
    }), [lead])

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
            await updateLeadMutation.mutateAsync(data);
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

            <div className="flex w-full border-b px-2.5 justify-between items-center">
                <div className="font-semibold p-2 border-b-2 border-white">Lead Details</div>
                {!isEditable && (user?.role?.name === "SUPER_ADMIN" || user?.role?.name === "ADMIN") && (
                    <SquarePen
                        className="w-5 h-5 cursor-pointer"
                        onClick={() => setIsEditable((prev) => !prev)}
                    />
                )}

            </div>

            <form
                id="leadDetailsForm"
                onSubmit={handleSubmit}
                // className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 p-4.5 overflow-y-auto"
                className="flex-1 h-full w-full overflow-y-auto"
            >
                {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4.5"> */}
                <div className="bg-blue-50 m-2">

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-blue-50 p-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-gray-500">Name</Label>
                            <div className="py-[6px]">{lead?.customer?.name}</div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email" className="text-gray-500">Email</Label>
                            <div className="py-[6px]">{lead?.customer?.email}</div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone" className="text-gray-500">Phone</Label>
                            <div className="py-[6px]">{lead?.customer?.phone}</div>
                        </div>


                        <div className="grid gap-2">
                            <div className="flex gap-2 items-center">
                                {/* Status field */}
                                <div className="flex flex-col flex-1 gap-2">
                                    <Label htmlFor="status" className="text-gray-500">Status</Label>
                                    {/* {isEditable ? */}
                                    {/* <Select
                                        name="status"
                                        disabled={!isEditable}
                                        // value={status}
                                        value={formData.status}
                                        // onValueChange={(val) => {
                                        //     setStatus(val)
                                        //     if (val !== "Lost") setLostReason("") // reset lost reason if not LOST
                                        // }}
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
                                    : */}
                                    <div className="flex gap-2 items-center">
                                        <div className="py-[6px] font-bold">{resolvedStatus}</div>
                                        {resolvedStatus === "Lost" && (
                                            <div>({resolvedLeadLostReason})</div>
                                        )}
                                    </div>
                                    {/* } */}

                                </div>


                            </div>


                        </div>

                        {/* <div className="grid gap-2">

                            {formData.status === "Lost" && (
                                <div className="flex flex-col flex-1 gap-2">
                                    <Label htmlFor="lostReason" className="text-gray-500">Lost Reason</Label>
                                    {isEditable ?
                                        <Select
                                            name="lostReason"
                                            disabled={!isEditable}
                                            // value={lostReason}
                                            value={formData.lostReason}
                                            // onValueChange={setLostReason}
                                            onValueChange={(val) => handleChange("lostReason", val)}
                                        >
                                            <SelectTrigger id="lostReason" className="w-full">
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {lostReasons.map((r) => (
                                                    <SelectItem key={r.id} value={r.name}>
                                                        {r.name.replace(/_/g, " ")}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        :
                                        <div className="py-[6px]">{lead?.lostReason?.name}</div>
                                    }
                                </div>
                            )}

                        </div> */}

                    </div>

                </div>

                {/* <div className="border-b-1 mx-4"></div> */}

                <div className="grid gap-2 pt-2 px-4 font-semibold">Other details</div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4.5">

                    <div className="grid gap-2">
                        <Label htmlFor="alternatePhone" className="text-gray-500">Alternate Phone</Label>
                        {isEditable ?
                            <Input
                                id="alternatePhone"
                                name="alternatePhone"
                                type="tel"
                                defaultValue={lead?.customer?.alternatePhone || ""}
                                onChange={(e) => handleChange("alternatePhone", e.target.value)}
                                disabled={!isEditable}
                            />
                            :
                            <div className="py-[6px]">{lead?.customer?.alternatePhone || "-"}</div>
                        }
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="oldModel" className="text-gray-500">Old Model</Label>
                        {isEditable ?
                            <Input
                                id="oldModel"
                                name="oldModel"
                                defaultValue={lead?.oldModel || ""}
                                onChange={(e) => handleChange("oldModel", e.target.value)}
                                disabled={!isEditable}
                            />
                            :
                            <div className="py-[6px]">{lead?.oldModel || "-"}</div>
                        }
                    </div>

                    {/* <div className="grid gap-2">
                        <Label htmlFor="location" className="text-gray-500">Location</Label>
                        {isEditable ?
                            <Input
                                id="location"
                                name="location"
                                defaultValue={lead?.location || ""}
                                onChange={(e) => handleChange("location", e.target.value)}
                                disabled={!isEditable}
                            />
                            :
                            <div className="py-[6px]">{lead?.location || "-"}</div>
                        }
                    </div> */}

                    <div className="grid gap-2">
                        <Label htmlFor="city" className="text-gray-500">City</Label>
                        {isEditable ?
                            <Input
                                id="city"
                                name="city"
                                defaultValue={lead?.customer?.city || ""}
                                onChange={(e) => handleChange("city", e.target.value)}
                                disabled={!isEditable}
                            />
                            :
                            <div className="py-[6px]">{lead?.customer?.city || "-"}</div>
                        }
                    </div>

                    <div className="grid gap-2">
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
                    </div>


                </div>

            </form >

            {(user?.role?.name === "SUPER_ADMIN" || user?.role?.name === "ADMIN") && (
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
            )}

        </div >
    )
}
