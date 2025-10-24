import { Lead } from '@/lib/types'
import React from 'react'
import { MetricCard } from './MetricCard'

type Props = {
    leads: Lead[]
}

export default function MetricCardsComponent({ leads }: Props) {

    // Compute metrics
    const totalLeads = leads.length
    const newLeadsToday = leads.filter(
        (l: any) => new Date(l.createdAt).toDateString() === new Date().toDateString()
    ).length
    const convertedLeads = leads.filter((l: any) => l.status === "converted").length
    const lostLeads = leads.filter((l: any) => l.status === "lost").length
    const conversionRate = totalLeads ? ((convertedLeads / totalLeads) * 100).toFixed(1) + "%" : "0%"

    const metrics = [
        { title: "Total Leads", value: totalLeads },
        { title: "New Leads Today", value: newLeadsToday },
        // { title: "Converted Leads", value: convertedLeads },
        { title: "Lost Leads", value: lostLeads },
        { title: "Conversion Rate", value: conversionRate },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {metrics.map((metric) => (
                <MetricCard key={metric.title} {...metric} />
            ))}
        </div>
    )
}
