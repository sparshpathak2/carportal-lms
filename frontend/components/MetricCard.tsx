'use client'

import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

export type MetricCardProps = {
    title: string
    value: string | number
    change?: number
    description?: string
    trend?: "up" | "down"
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, description, trend }) => {
    return (
        <div className="flex flex-col border rounded-md bg-white p-4 gap-2">
            <div className="flex flex-col gap-0">
                <div className="uppercase text-sm">{title}</div>
                {description && <div className="text-sm">{description}</div>}
            </div>
            <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold">{value}</span>
                {change !== undefined && trend && (
                    <span
                        className={`flex items-center text-sm font-medium ${trend === "up" ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {trend === "up" ? <IconTrendingUp className="w-4 h-4 mr-1" /> : <IconTrendingDown className="w-4 h-4 mr-1" />}
                        {change}%
                    </span>
                )}
            </div>
        </div>
    )
}
