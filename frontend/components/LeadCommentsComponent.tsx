'use client'

import React, { useContext, useEffect, useState } from "react"
import { Badge } from "./ui/badge"
import { activityTypeColors, avatarBgColors } from "@/app/constants/constants"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { LeadActivityType, Comment, Lead } from "@/lib/types"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { DateTimePicker } from "./DateTimePickerComponent2"
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query"
import { createComment, getCommentsByLeadId } from "@/features/leads/api/lead"
import { IconAlertCircle, IconUser } from "@tabler/icons-react"
import toast from "react-hot-toast"
import { SessionContext } from "./SessionProvider"

type Props = {
    lead: Lead
}

const activityTypes: LeadActivityType[] = [
    "LEAD_ADDED",
    "COMMENT",
    "CALL",
    "MEETING",
    "TEST_DRIVE",
    "STATUS_UPDATE",
    "ASSIGNMENT",
    "CALLBACK",
    "FINANCE",
    "EMAIL",
    "OTHER",
];

type CommentsResponse = {
    success: boolean
    data: Comment[]
}

// export type DealerCommentGroup = {
//     dealerAssignmentId: string;
//     dealerId: string;
//     dealerName: string;
//     comments: Comment[];
// };

// export type CommentsResponse = {
//     success: boolean;
//     data: DealerCommentGroup[];
// };


function stringToColorIndex(str: string) {
    let hash = 0
    for (let i = 0; i < str?.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash) % avatarBgColors.length
}

export default function LeadCommentsComponent({ lead }: Props) {
    // const [comments, setComments] = useState(mockComments)
    const { user, loading, refreshSession } = useContext(SessionContext)
    const [showTextarea, setShowTextarea] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [activityType, setActivityType] = useState<LeadActivityType | "">("")
    const [dueDate, setDueDate] = useState<Date | null>(null)

    const userDealerId = user?.dealerId

    const queryClient = useQueryClient()

    const bgColor = avatarBgColors[stringToColorIndex(lead?.customer?.name || lead?.id)]
    const firstLetter = lead?.customer?.name ? lead.customer.name.charAt(0).toUpperCase() : '?'

    // ✅ Fetch comments without onError/onSuccess
    const { data, isLoading, isError, error } = useQuery<CommentsResponse, Error>({
        queryKey: ["comments", lead.id],
        queryFn: () => getCommentsByLeadId(lead.id),
        enabled: !!lead.id,
    });

    useEffect(() => {
        if (isError && error) {
            toast.error("Failed to fetch comments");
            console.error(error);
        }
    }, [isError, error]);


    // ✅ Mutation for adding a comment
    const mutation = useMutation({
        mutationFn: (payload: any) => createComment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", lead.id] })
            queryClient.invalidateQueries({ queryKey: ["leadActivities", lead.id] })
        },
    })

    const comments = data?.data ?? [] // API returns { success, data }

    console.log("lead at comments section:", lead)

    // const handleAddComment = async () => {
    //     if (!newComment.trim() || !activityType) return

    //     const payload = {
    //         leadId: lead.id,
    //         type: activityType,
    //         description: newComment,
    //         dueDate: dueDate ? dueDate.toISOString() : undefined,
    //     }

    //     mutation.mutate(payload)

    //     setNewComment("")
    //     setActivityType("")
    //     setDueDate(null)
    //     setShowTextarea(false)
    // }

    // const handleAddComment = async () => {
    //     // if (!newComment.trim() || !activityType) return;
    //     if (!newComment.trim()) return;

    //     const payload = {
    //         leadId: lead.id,
    //         dealerAssignmentId: lead.assignments.id, // ✅ IMPORTANT (new requirement)
    //         type: activityType,
    //         description: newComment,
    //         dueDate: dueDate ? dueDate.toISOString() : undefined,
    //     };

    //     mutation.mutate(payload);

    //     setNewComment("");
    //     setActivityType("");
    //     setDueDate(null);
    //     setShowTextarea(false);
    // };

    // const handleAddComment = async () => {
    //     if (!newComment.trim()) return;

    //     // 1️⃣ Find assignment that matches logged-in user's dealerId
    //     const matchingAssignment = lead.leadAssignments?.find(
    //         (a) => a.dealerId === userDealerId
    //     );

    //     // 2️⃣ If no matching assignment, stop
    //     if (!matchingAssignment) {
    //         toast.error("Failed to fetch comments");
    //         return;
    //     }

    //     // 3️⃣ Build payload
    //     const payload = {
    //         leadId: lead.id,
    //         dealerAssignmentId: matchingAssignment.id, // ✔️ correct assignment id
    //         type: activityType,
    //         description: newComment,
    //         dueDate: dueDate ? dueDate.toISOString() : undefined,
    //     };

    //     // 4️⃣ Trigger mutation
    //     mutation.mutate(payload);

    //     // 5️⃣ Reset UI
    //     setNewComment("");
    //     setActivityType("");
    //     setDueDate(null);
    //     setShowTextarea(false);
    // };


    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        // 1️⃣ Extract the active assignment
        const activeAssignment = lead.leadAssignments?.find(a => a.isActive);

        // 2️⃣ Determine role permissions
        // const canCommentWithoutAssignment =
        //     roleName === "ADMIN" ||
        //     roleName === "MANAGER" ||
        //     roleName === "CRM";

        // 3️⃣ Decide leadAssignmentId
        const leadAssignmentId = activeAssignment?.id || undefined;

        // 4️⃣ If assignment required but missing
        // if (!leadAssignmentId && !canCommentWithoutAssignment) {
        //     toast.error("You are not assigned to this lead");
        //     return;
        // }

        // 5️⃣ Build payload
        const payload = {
            leadId: lead.id,
            leadAssignmentId,   // ⬅️ Correct key name
            type: activityType,
            description: newComment,
            dueDate: dueDate ? dueDate.toISOString() : undefined,
        };

        mutation.mutate(payload);

        // 6️⃣ Reset UI
        setNewComment("");
        setActivityType("");
        setDueDate(null);
        setShowTextarea(false);
    };



    if (isLoading) return <div>Loading comments...</div>;

    return (
        <div className="flex flex-col h-full">
            {/* Header with Add Comment button */}
            {!showTextarea &&
                <div className="flex justify-between items-end mb-4">
                    <div>{comments.length} comment(s)</div>
                    <Button size="sm" onClick={() => setShowTextarea(true)}>Add Comment</Button>
                </div>
            }

            {comments.length === 0 && showTextarea === false &&
                <div className="flex w-full h-full justify-center items-center border-dotted border-2">
                    <div className="flex flex-col gap-3 items-center">
                        <IconAlertCircle className="w-8 h-8" />
                        <div className="flex flex-col items-center gap-1">
                            <div>Comment not found</div>
                        </div>
                    </div>
                </div>
            }

            {isError &&
                <div className="flex w-full justify-center my-[16px]">
                    <div className="flex flex-col gap-3 items-center">
                        <IconAlertCircle className="w-8 h-8" />
                        <div className="flex flex-col items-center gap-1">
                            <div>Error getting the lead activity</div>
                        </div>
                    </div>
                </div>
            }

            {/* Textarea for new comment */}
            {showTextarea && (
                <div className="flex flex-col gap-3 border-1 p-4 bg-neutral-50 rounded-md mb-4">

                    {/* <div className="flex gap-2">
                        <div className="flex flex-col gap-1">
                            <div className="text-sm">Select type</div>
                            <Select
                                value={activityType}
                                onValueChange={(val: LeadActivityType) => setActivityType(val)}
                            >
                                <SelectTrigger className="bg-white">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    {activityTypes.map((type) => (
                                        <SelectItem key={type} value={type} className="bg-white">
                                            {type.replace(/_/g, " ")}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <DateTimePicker value={dueDate} onChange={setDueDate} />
                    </div> */}

                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your comment..."
                        className="w-full resize-none bg-white h-32" // 32 = ~8rem = ~5 rows
                    />

                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setShowTextarea(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleAddComment}>Submit</Button>
                    </div>
                </div>
            )}

            {/* Scrollable comments section */}
            <div className="flex-1 overflow-y-auto space-y-4">
                {showTextarea && <div>{comments.length} comment(s)</div>}
                {comments.map((comment) => {
                    const badgeClasses = activityTypeColors[comment?.type] || activityTypeColors["OTHER"]

                    return (
                        <div key={comment.id} className="border p-3 rounded-md flex flex-col gap-2">
                            <Badge className={`${badgeClasses} font-medium`}>
                                {comment?.type?.replace(/_/g, " ")}
                            </Badge>

                            <div>{comment?.description}</div>

                            <div className="flex gap-2 items-center">
                                <Avatar className="h-10 w-10">
                                    {/* <AvatarFallback className={`${bgColor} text-white`}> */}
                                    <AvatarFallback className="bg-neutral-200">
                                        {/* {firstLetter} */}
                                        <IconUser size={18} />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col text-sm">
                                    <div>{comment?.createdByName}</div>

                                    {(() => {
                                        const commentDate = new Date(comment.createdAt);
                                        const formattedDate = commentDate.toLocaleDateString("en-US", {
                                            day: "2-digit",
                                            month: "short",
                                        }); // e.g., "12 Sep"
                                        const formattedTime = commentDate.toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: true,
                                        }); // e.g., "04:00 PM"
                                        return `${formattedDate}, ${formattedTime}`;
                                    })()}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
