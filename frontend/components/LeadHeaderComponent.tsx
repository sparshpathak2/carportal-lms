"use client"

import { leadCategoryColors, leadStatusColors } from "@/app/constants/constants"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dealer, Lead, LeadAssignment, LeadCategory, LeadLostReason, LeadStatus, User } from "@/lib/types"
import { renderCategoryIcon } from "@/lib/utils"
import { IconCalendarPlus, IconFilter, IconPhone, IconTarget, IconUserStar } from "@tabler/icons-react"
import { Button } from "./ui/button"
import { useContext, useState } from "react"
import { LeadOwnerModalComponent } from "./LeadOwnerModalComponent"
import { LeadStatusModalComponent } from "./LeadStatusModalComponent"
import { LeadCategoryModalComponent } from "./LeadCategoryModalComponent"
import { SessionContext } from "./SessionProvider"
import { resolveLeadComputedFields } from "@/lib/leadResolution"

type LeadHeaderProps = {
    lead: Lead
    bgColor: string
    firstLetter: string
    statuses: LeadStatus[] // pass from API
    lostReasons: LeadLostReason[] // pass from API
    // handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    isSaving: boolean
    updateLeadMutation: any
    users?: User[]
    dealers?: Dealer[]
}

export default function LeadHeader({ lead, bgColor, firstLetter, statuses, lostReasons, updateLeadMutation, users, dealers }: LeadHeaderProps) {
    const { user, loading, refreshSession } = useContext(SessionContext)

    // ✅ Compute resolved values once
    const {
        resolvedStatus,
        resolvedCategory,
        resolvedAssignedToName,
        resolvedDateCreated
    } = resolveLeadComputedFields(lead, user)

    console.log("resolvedDateCreated:", resolvedDateCreated)

    const [isOwnerModalOpen, setOwnerModalOpen] = useState(false)
    const [isStatusModalOpen, setStatusModalOpen] = useState(false)
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false)

    const leadStatusClass = leadStatusColors[resolvedStatus] || "bg-gray-100 text-gray-800 border border-gray-300"
    const categoryClass = leadCategoryColors[resolvedCategory] || "bg-gray-100 text-gray-800 border border-gray-300"

    return (
        <>
            <div className="flex gap-4 border p-4 bg-white">
                {/* Avatar */}
                <div className="flex items-center">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback className={`${bgColor} text-white text-2xl`}>
                            {firstLetter}
                        </AvatarFallback>
                    </Avatar>
                </div>

                {/* Lead Info */}
                <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-4">
                        <div className="font-semibold text-xl">{lead?.customer?.name}</div>
                        <Badge className={categoryClass}>
                            {renderCategoryIcon(resolvedCategory)}
                            {/* {lead?.category || "NA"} */}
                            {resolvedCategory || "COLD"}
                        </Badge>
                    </div>

                    <div className="flex justify-between items-center w-full">

                        <div className="flex gap-4 items-center">
                            {/* <Badge className={leadStatusClass}>{status || "NA"}</Badge> */}
                            <Badge className={leadStatusClass}>{resolvedStatus || "New"}</Badge>

                            <div className="flex gap-1 items-center">
                                <IconPhone className="w-4 h-4" />
                                <div>{lead?.customer?.phone || "NA"}</div>
                            </div>

                            <div className="flex gap-1 items-center">
                                <IconCalendarPlus className="w-4 h-4" />
                                {/* <div>
                                    {lead?.createdAt
                                        ? new Date(lead.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })
                                        : "NA"}
                                </div> */}
                                <div>
                                    {resolvedDateCreated
                                        ? new Date(resolvedDateCreated).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })
                                        : "NA"}
                                </div>
                            </div>

                            <div className="flex gap-1 items-center">
                                <IconUserStar className="w-4 h-4" />
                                <div>{resolvedAssignedToName || "NA"}</div>
                            </div>
                        </div>

                        <div className="flex gap-[-1px]">

                            {/* <div className="flex gap-[-1px]"> */}
                            <Button
                                size="sm"
                                onClick={() => setStatusModalOpen(true)}
                                className="rounded-r-none"
                            >
                                <IconFilter className="text-white" />
                                Status
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setCategoryModalOpen(true)}
                                // className="rounded-r-none bg-white text-blue-600 border border-blue-600"
                                className="rounded-none border-x-1 border-l-white"
                            >
                                <IconTarget className="text-white" />
                                Category
                            </Button>
                            {/* </div> */}

                            <Button
                                size="sm"
                                onClick={() => setOwnerModalOpen(true)}
                                // className="rounded-r-none bg-white text-blue-600 border border-blue-600"
                                className="rounded-l-none"
                            >
                                <IconUserStar className="text-white" />
                                Owner
                            </Button>

                        </div>
                    </div>
                </div>
            </div>
            <LeadOwnerModalComponent
                open={isOwnerModalOpen}
                onOpenChange={setOwnerModalOpen}
                users={users}
                dealers={dealers}
                lead={lead}
                isSaving={updateLeadMutation.isPending}
                updateLeadMutation={updateLeadMutation}
            />
            <LeadStatusModalComponent
                open={isStatusModalOpen}
                onOpenChange={setStatusModalOpen}
                lead={lead}
                statuses={statuses}
                lostReasons={lostReasons}
                isSaving={updateLeadMutation.isPending}
                updateLeadMutation={updateLeadMutation}
            />
            <LeadCategoryModalComponent
                open={isCategoryModalOpen}
                onOpenChange={setCategoryModalOpen}
                lead={lead}
                statuses={statuses}
                lostReasons={lostReasons}
                isSaving={updateLeadMutation.isPending}
                updateLeadMutation={updateLeadMutation}
            />
        </>
    )
}
