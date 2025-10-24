import { MessageSquare, Phone, Car, CheckCircle, Calendar, DollarSign, FileText } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { JSX } from "react"

interface Activity {
    id: string
    type: "NOTE" | "CALL" | "MEETING" | "TEST_DRIVE" | "FOLLOW_UP" | "STATUS_CHANGE" | "FINANCE" | "DOCUMENT"
    description?: string
    createdAt: string
    createdBy: string
    statusFrom?: string
    statusTo?: string
    scheduledAt?: string
}

interface Props {
    activities: Activity[]
}

const iconMap: Record<Activity["type"], JSX.Element> = {
    NOTE: <MessageSquare className="h-5 w-5 text-blue-500" />,
    CALL: <Phone className="h-5 w-5 text-green-500" />,
    MEETING: <Calendar className="h-5 w-5 text-purple-500" />,
    TEST_DRIVE: <Car className="h-5 w-5 text-orange-500" />,
    FOLLOW_UP: <CheckCircle className="h-5 w-5 text-yellow-500" />,
    STATUS_CHANGE: <CheckCircle className="h-5 w-5 text-red-500" />,
    FINANCE: <DollarSign className="h-5 w-5 text-emerald-500" />,
    DOCUMENT: <FileText className="h-5 w-5 text-gray-500" />,
}

export function LeadActivityComponent({ activities }: Props) {
    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative pl-6 border-l space-y-6">
                    {activities.map((activity) => (
                        <div key={activity.id} className="relative flex gap-3">
                            {/* Timeline icon */}
                            <div className="absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 border">
                                {iconMap[activity.type]}
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">
                                    {activity.type === "STATUS_CHANGE"
                                        ? `Status changed from "${activity.statusFrom}" to "${activity.statusTo}"`
                                        : activity.description || activity.type}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {new Date(activity.createdAt).toLocaleString()} · by {activity.createdBy}
                                </p>
                                {activity.scheduledAt && (
                                    <p className="text-xs text-indigo-600">
                                        Scheduled at: {new Date(activity.scheduledAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
