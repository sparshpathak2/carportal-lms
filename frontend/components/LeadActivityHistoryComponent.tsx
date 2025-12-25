"use client";

import React from "react";
import { useParams } from "next/navigation";
import { getActivitiesByLeadId } from "@/features/leads/api/lead";
import { IconCreditCard, IconFilter, IconSteeringWheel, IconMessage, IconExclamationMark, IconMailForward, IconPhoneOutgoing, IconUserCheck, IconCalendarTime, IconPhoneDone, IconUser, IconAlertCircle, IconUserPlus, IconTarget } from "@tabler/icons-react";
import { Lead, LeadActivity } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { activityTypeColors } from "@/app/constants/constants";

type Props = {
    lead: Lead
}

const activityIcons: Record<string, React.ElementType> = {
    LEAD_ADDED: IconUserPlus,
    COMMENT: IconMessage,
    CALL: IconPhoneDone,
    MEETING: IconCalendarTime,
    TEST_DRIVE: IconSteeringWheel,
    STATUS_UPDATE: IconFilter,
    CATEGORY_UPDATE: IconTarget,
    ASSIGNMENT: IconUserCheck,
    CALLBACK: IconPhoneOutgoing,
    FINANCE: IconCreditCard,
    EMAIL: IconMailForward,
    OTHER: IconExclamationMark,
};

export default function LeadActivityHistoryComponent({ lead }: Props) {
    const { leadId } = useParams<{ leadId: string }>();

    console.log("lead at leadactivitycomponent:", lead.leadActivity)

    const activities = lead?.leadActivity

    // --- React Query ---
    // const { data: activities = [], isLoading, isError } = useQuery<LeadActivity[]>({
    //     queryKey: ["leadActivities", leadId],
    //     queryFn: async () => {
    //         if (!leadId) return [];
    //         const res = await getActivitiesByLeadId(leadId);
    //         return res.data; // assuming API returns { success, data }
    //     },
    //     enabled: !!leadId,
    //     staleTime: 1000 * 60 * 5,
    // });

    // const activities = lead.

    // if (isLoading) return <div>Loading activities...</div>;

    if (activities.length === 0) return (
        // <div className="flex w-full justify-center mt-[10%]">
        <div className="flex w-full h-full justify-center items-center border-dotted border-2">
            <div className="flex flex-col gap-3 items-center">
                <IconAlertCircle className="w-8 h-8" />
                <div className="flex flex-col items-center gap-1">
                    <div>Activity history not found</div>
                    {/* <div className="text-sm">The lead could not be found</div> */}
                </div>
            </div>
        </div>
    )

    // if (isError) return (
    //     // <div className="flex w-full justify-center mt-[10%]">
    //     <div className="flex w-full h-full justify-center items-center border-dotted border-2">
    //         <div className="flex flex-col gap-3 items-center">
    //             <IconAlertCircle className="w-8 h-8" />
    //             <div className="flex flex-col items-center gap-1">
    //                 <div>Error getting the lead activity</div>
    //                 {/* <div className="text-sm">The lead could not be found</div> */}
    //             </div>
    //         </div>
    //     </div>
    // )

    // --- Group by month (in descending order) ---
    const grouped = activities.reduce((acc: Record<string, LeadActivity[]>, activity) => {
        const date = new Date(activity.createdAt);
        const monthKey = date.toLocaleString("default", { month: "short", year: "numeric" }); // e.g. "September 2025"
        if (!acc[monthKey]) acc[monthKey] = [];
        acc[monthKey].push(activity);
        return acc;
    }, {});

    // Ensure months are sorted descending
    const sortedMonths = Object.keys(grouped).sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    return (
        <div className="space-y-6">
            {sortedMonths.map((month) => (
                <div key={month}>
                    <p className="text-sm font-semibold mb-3">{month}</p>
                    <div className="space-y-4">
                        {grouped[month].map((activity) => {
                            const activityDate = new Date(activity.createdAt);
                            const formattedDate = activityDate.toLocaleDateString("en-US", {
                                day: "2-digit",
                                month: "short",
                            }); // e.g., "12 Sep"
                            const formattedTime = activityDate.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            }); // e.g., "04:00 PM"

                            return (
                                <div
                                    key={activity.id}
                                    className="flex border rounded bg-white"
                                >
                                    {/* <div className="text-sm font-semibold">{activity.type}</div> */}
                                    <div className="w-24 flex flex-col gap-1 py-3 pl-3">
                                        <span>{formattedDate}</span>
                                        <span>{formattedTime}</span>
                                    </div>
                                    {/* Timeline Icon + Line */}
                                    <div className="w-16 flex flex-col items-center relative">
                                        {/* Vertical line */}
                                        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gray-200 -translate-x-1/2" />
                                        {/* Icon */}
                                        {/* <div className="z-10 bg-white rounded-full relative top-4">
                                            <div className="border-1 rounded-full p-2">
                                                <IconUser className="w-4 h-4 text-blue-500" />
                                                {
                                                    React.createElement(
                                                        activityIcons[activity.type] || activityIcons.OTHER,
                                                        { className: "w-5 h-5 text-blue-500" }
                                                    )
                                                }
                                            </div>
                                        </div> */}
                                        <div className="z-10 bg-white rounded-full relative top-4">
                                            <div
                                                className={`rounded-full p-2 ${activityTypeColors[activity.type] || activityTypeColors.OTHER}`}
                                            >
                                                {React.createElement(
                                                    activityIcons[activity.type] || activityIcons.OTHER,
                                                    { className: "w-5 h-5" }
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1 flex-col pr-3 py-3">
                                        {activity.description && (
                                            <div className="mb-2">{activity.description}</div>
                                        )}
                                        <div className="flex gap-1 items-center text-sm">
                                            <IconUser className="w-4 h-4" />
                                            {activity.performedByName}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

        </div>
    );
}
