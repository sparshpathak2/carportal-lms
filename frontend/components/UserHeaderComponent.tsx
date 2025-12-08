"use client"

import { leadCategoryColors, leadStatusColors } from "@/app/constants/constants"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dealer, Lead, LeadLostReason, LeadStatus, User } from "@/lib/types"
import { renderCategoryIcon } from "@/lib/utils"
import { IconCalendarPlus, IconFilter, IconPhone, IconTarget, IconUserStar } from "@tabler/icons-react"
import { Button } from "./ui/button"
import { useState } from "react"
import { LeadOwnerModalComponent } from "./LeadOwnerModalComponent"
import { LeadStatusModalComponent } from "./LeadStatusModalComponent"
import { LeadCategoryModalComponent } from "./LeadCategoryModalComponent"

type Props = {
    user: User
    bgColor: string
    firstLetter: string
    statuses: LeadStatus[] // pass from API
    lostReasons: LeadLostReason[] // pass from API
    // handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    isSaving: boolean
    updateUserMutation: any
    users?: User[]
    dealers?: Dealer[]
}

export default function UserHeader({ user, bgColor, firstLetter, statuses, lostReasons, updateUserMutation, users, dealers }: Props) {
    const [isOwnerModalOpen, setOwnerModalOpen] = useState(false)
    const [isStatusModalOpen, setStatusModalOpen] = useState(false)
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false)

    // const status = user?.status?.name || "NA"
    // const leadStatusClass = leadStatusColors[status] || "bg-gray-100 text-gray-800 border border-gray-300"
    // const categoryClass = leadCategoryColors[user?.category] || "bg-gray-100 text-gray-800 border border-gray-300"
    // console.log("lead category:", lead?.category)

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
                        <div className="font-semibold text-xl">{user?.name}</div>
                        {/* <Badge className={categoryClass}>
                            {renderCategoryIcon(lead)}
                            {lead?.category || "NA"}
                        </Badge> */}
                    </div>

                    <div className="flex justify-between items-center w-full">

                        <div className="flex gap-4 items-center">
                            {/* <Badge className={leadStatusClass}>{status || "NA"}</Badge> */}

                            <div className="flex gap-1 items-center">
                                <IconPhone className="w-4 h-4" />
                                <div>{user?.phone || "NA"}</div>
                            </div>

                            <div className="flex gap-1 items-center">
                                <IconCalendarPlus className="w-4 h-4" />
                                <div>
                                    {user?.createdAt
                                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })
                                        : "NA"}
                                </div>
                            </div>

                            <div className="flex gap-1 items-center">
                                <IconUserStar className="w-4 h-4" />
                                <div>{user?.dealerId || "NA"}</div>
                            </div>
                        </div>

                        {/* <div className="flex gap-[-1px]">

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
                                className="rounded-none border-x-1 border-l-white"
                            >
                                <IconTarget className="text-white" />
                                Category
                            </Button>

                            <Button
                                size="sm"
                                onClick={() => setOwnerModalOpen(true)}
                                className="rounded-l-none"
                            >
                                <IconUserStar className="text-white" />
                                Owner
                            </Button>

                        </div> */}

                    </div>
                </div>
            </div>
            {/* <LeadOwnerModalComponent
                open={isOwnerModalOpen}
                onOpenChange={setOwnerModalOpen}
                users={users}
                dealers={dealers}
                lead={lead}
                isSaving={updateUserMutation.isPending}
                updateLeadMutation={updateUserMutation}
            /> */}
            {/* <LeadStatusModalComponent
                open={isStatusModalOpen}
                onOpenChange={setStatusModalOpen}
                lead={lead}
                statuses={statuses}
                lostReasons={lostReasons}
                isSaving={updateUserMutation.isPending}
                updateLeadMutation={updateUserMutation}
            /> */}
            {/* <LeadCategoryModalComponent
                open={isCategoryModalOpen}
                onOpenChange={setCategoryModalOpen}
                lead={lead}
                statuses={statuses}
                lostReasons={lostReasons}
                isSaving={updateUserMutation.isPending}
                updateLeadMutation={updateUserMutation}
            /> */}
        </>
    )
}
