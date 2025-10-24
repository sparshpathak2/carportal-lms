'use client'

import { IconBell, IconChecks, IconChevronRight, IconPointFilled } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import io from "socket.io-client"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "./ui/dropdown-menu"
import { useContext, useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { getNotificationsByUser, getUnReadCount, getUnViewedCount } from "@/features/notifications/api/notification"
import { SessionContext } from "./SessionProvider"
import { Notification } from "@/lib/types"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { avatarBgColors } from "@/app/constants/colors"
import { formatNotificationDate, stringToColorIndex } from "@/lib/utils"
import { Button } from "./ui/button"


export default function NotificationBell() {
    // const [notifications, setNotifications] = useState<Notification[]>([
    //     { id: 1, title: "New message from John", description: "Hey! Can we talk?", isRead: false },
    //     { id: 2, title: "Payment received", description: "You got $50 from Alice.", isRead: true },
    //     { id: 3, title: "System update", description: "Version 1.2.0 is now available.", isRead: false },
    //     { id: 4, title: "New comment on your post", description: "Lisa commented: Nice post!", isRead: false },
    //     { id: 5, title: "Reminder", description: "Meeting at 4 PM today.", isRead: true },
    // ])

    const queryClient = useQueryClient()
    // const [notifications, setNotifications] = useState<Notification[]>([])
    const { user, loading } = useContext(SessionContext)
    const [socket, setSocket] = useState<any>(null)

    const userId = user?.id

    // Fetch all notifications
    const { data: notifications = [] } = useQuery<Notification[], Error>({
        queryKey: ["notifications", userId],
        queryFn: () => getNotificationsByUser(userId!),
        enabled: !!userId,
    })

    // Fetch unread notifications count
    const { data: unviewedCount = 0 } = useQuery<number, Error>({
        queryKey: ["notifications-unviewed-count", userId],
        queryFn: () => getUnViewedCount(userId!),
        enabled: !!userId,
    })

    // Fetch unread notifications count
    const { data: unreadCount = 0 } = useQuery<number, Error>({
        queryKey: ["notifications-unread-count", userId],
        queryFn: () => getUnReadCount(userId!),
        enabled: !!userId,
    })


    // 👇 Connect to backend websocket when component mounts
    useEffect(() => {
        const newSocket = io("http://localhost:3004", {
            transports: ["websocket"],
            reconnection: true,
        })

        setSocket(newSocket)

        newSocket.on("connect", () => {
            console.log("✅ Connected to notification service")

            // 👇 join the room for this user
            const userId = "W6ymcEViwf" // replace with logged-in user's id
            newSocket.emit("join", userId)
        })

        newSocket.on("notification", (data: Notification) => {
            console.log("📩 New notification:", data)
            // setNotifications((prev) => [data, ...prev])

            // Invalidate queries to refetch updated data
            queryClient.invalidateQueries({ queryKey: ["notifications", userId] })
            queryClient.invalidateQueries({ queryKey: ["notifications-unread-count", userId] })

        })

        // ✅ cleanup properly
        return () => {
            newSocket.disconnect();
        };
    }, [userId, queryClient])

    // Mark a notification as read (local cache update)
    const markAsViewed = (id: string) => {
        queryClient.setQueryData<Notification[]>(["notifications", userId], (old = []) =>
            old.map(n => n.id === id ? { ...n, isViewed: true } : n)
        )
        queryClient.setQueryData<number>(["notifications-unviewed-count", userId], (old = 0) => old - 1)
    }

    const markAsRead = (id: string) => {
        queryClient.setQueryData<Notification[]>(["notifications", userId], (old = []) =>
            old.map(n => n.id === id ? { ...n, isRead: true } : n)
        )
        queryClient.setQueryData<number>(["notifications-unread-count", userId], (old = 0) => old - 1)
    }

    const markAllAsViewed = () => {
        if (!userId) return;

        // ✅ Optimistically update cache
        queryClient.setQueryData<Notification[]>(["notifications", userId], (old = []) =>
            old.map((n) => ({ ...n, isViewed: true }))
        );

        queryClient.setQueryData<number>(["notifications-unviewed-count", userId], 0);

        // ✅ Optionally hit backend to persist read state
        fetch(`/api/notifications/mark-all-read/${userId}`, {
            method: "PATCH",
        }).catch((err) => console.error("Failed to mark all as read:", err));
    };


    const displayUnreadCount = unreadCount > 99 ? "99+" : unreadCount
    const displayUnviewedCount = unviewedCount > 99 ? <IconPointFilled className="text-red" /> : unviewedCount


    return (
        <DropdownMenu
            onOpenChange={(open) => {
                if (open && unreadCount > 0) {
                    // Trigger mark-all-as-read after 1 second
                    setTimeout(() => {
                        console.log("🔔 Marking all as read after delay...");
                        markAllAsViewed(); // custom function below
                    }, 1000);
                }
            }}
        >
            <DropdownMenuTrigger className="focus:ring-0 focus:ring-offset-0 focus:outline-none">
                <div className="relative inline-flex items-center">
                    <IconBell className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                    {/* {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-4 w-4 text-[10px] font-medium leading-none flex items-center justify-center"
                        >
                            {displayUnviewedCount}
                        </Badge>
                    )} */}
                    {unviewedCount !== 0 && (
                        <IconPointFilled
                            className="absolute -top-2 -right-1.5 text-red-600"
                        />
                    )}
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                className="w-100 max-h-110 overflow-y-auto rounded-lg shadow-lg p-0"
                side="bottom"
                align="end"
                sideOffset={4}
            >

                <div className="sticky top-0 z-10 h-12 bg-white border-b border-gray-200 flex gap-2 items-center px-3 py-2 justify-between">
                    <div className="flex gap-2 items-center">
                        <div className="font-semibold text-sm text-gray-700">Notifications</div>
                        <Badge
                            className="h-4 p-1 text-[10px] font-medium flex items-center justify-center text-black bg-neutral-200"
                        >
                            {displayUnreadCount}
                        </Badge>
                    </div>

                    {/* {unreadCount > 0 && (
                        <a
                            // size="sm"
                            // variant="ghost"
                            href="/notifications"
                            className="flex gap-2 text-sm items-center text-gray-700"
                        >
                            View All <IconChevronRight className="w-3 h-3 text-gray-700" />
                        </a>
                    )} */}
                    <Button
                        size="sm"
                        variant="outline"
                    >
                        <IconChecks />
                        Mark all as read
                    </Button>
                </div>

                <div className="max-h-90 overflow-y-auto">
                    {notifications?.length === 0 ? (
                        <DropdownMenuItem className="text-gray-500 cursor-default">
                            No notifications
                        </DropdownMenuItem>
                    ) : (
                        notifications?.map((n) => {
                            const getAvatarBgColor = (generatedBy?: string | null) => {
                                if (!generatedBy || generatedBy.toLowerCase() === "system") {
                                    return "bg-neutral-400";
                                }
                                return avatarBgColors[stringToColorIndex(generatedBy)];
                            };

                            const firstLetter = n?.generatedBy ? n?.generatedBy.charAt(0).toUpperCase() : 'S'

                            return (
                                <DropdownMenuItem
                                    key={n.id}
                                    className={`flex flex-col items-start gap-2 py-2 cursor-pointer rounded-none border-b border-neutral-200 pr-3 ${!n.isRead ? "border-l-2 border-l-blue-500" : "bg-gray-100 font-medium"
                                        }`}
                                    onClick={() => markAsRead(n.id)}
                                >
                                    <div className="flex gap-2 w-full">
                                        <Avatar className="mt-0.5">
                                            <AvatarFallback className={`${getAvatarBgColor(n.generatedBy)} text-white text-2xl`}>
                                                {firstLetter}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="flex flex-col gap-1 w-full">
                                            <div className="flex w-full gap-1 justify-between">
                                                <div className="text-sm font-semibold">{n.title}</div>
                                                {/* {!n.isRead &&
                                                    <IconPointFilled
                                                        onClick={() => markAsClicked(n.id)}
                                                        className="text-green-600"
                                                    />
                                                } */}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {formatNotificationDate(n.createdAt)}
                                            </div>
                                            {n.message && <span className="text-sm text-gray-500 border-1 rounded-sm p-2 w-full bg-white">{n.message}</span>}
                                        </div>
                                    </div>

                                </DropdownMenuItem>
                            )
                        })
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
