import React, { useState } from "react"
import LeadActivityHistoryComponent from "./LeadActivityHistoryComponent"
import LeadCommentsComponent from "./LeadCommentsComponent"
import { Lead } from "@/lib/types"
import LeadTasksComponent from "./LeadTasksComponent"

type Props = {
    lead: Lead
}

export default function LeadActivityComponent({ lead }: Props) {
    // 1️⃣ State to track which tab is active
    const [activeTab, setActiveTab] = useState<"comments" | "history" | "tasks">(
        "comments"
    )

    // 2️⃣ Tab click handler
    const handleTabClick = (tab: typeof activeTab) => {
        setActiveTab(tab)
    }

    return (
        <div className="flex flex-col w-full border h-full bg-white">
            {/* Tabs */}
            <div className="flex border-b px-2.5">
                <div
                    className={`font-semibold p-2 cursor-pointer border-b-2 ${activeTab === "comments" ? "border-blue-600" : "border-transparent"
                        }`}
                    onClick={() => handleTabClick("comments")}
                >
                    Comments
                </div>

                <div
                    className={`font-semibold p-2 cursor-pointer border-b-2 ${activeTab === "history" ? "border-blue-600" : "border-transparent"
                        }`}
                    onClick={() => handleTabClick("history")}
                >
                    Activity History
                </div>

                <div
                    className={`font-semibold p-2 cursor-pointer border-b-2 ${activeTab === "tasks" ? "border-blue-600" : "border-transparent"
                        }`}
                    onClick={() => handleTabClick("tasks")}
                >
                    Tasks
                </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {activeTab === "comments" && <LeadCommentsComponent lead={lead} />}
                {activeTab === "history" && <LeadActivityHistoryComponent />}
                {activeTab === "tasks" && <LeadTasksComponent />}
            </div>
        </div>
    )
}
