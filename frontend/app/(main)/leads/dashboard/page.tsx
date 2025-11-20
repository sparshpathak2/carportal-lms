'use client'

import { useParams, usePathname } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLeadById, getLeadStatuses, editLead, getLeads } from '@/features/leads/api/lead'
import LeadDetailsForm from '@/components/LeadDetailsComponent'
import LeadActivityComponent from '@/components/LeadActivityComponent'
import LeadHeader from '@/components/LeadHeaderComponent'
import { Loader2, CircleAlert } from 'lucide-react'
import { avatarBgColors } from '@/app/constants/constants'
import { Lead, LeadStatus } from '@/lib/types'
import MetricCardsComponent from '@/components/MetricCardsComponent'
import { ChartAreaLinear } from '@/components/Charts/AreaChart'
import { ChartPieLabelCustom } from '@/components/Charts/PieChart'

function stringToColorIndex(str: string) {
    let hash = 0
    for (let i = 0; i < str?.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return Math.abs(hash) % avatarBgColors.length
}

export default function LeadDetailPage() {
    const { leadId } = useParams<{ leadId: string }>()
    const queryClient = useQueryClient()
    const pathname = usePathname()


    // Fetch lead
    // const {
    //     data: leadRes,
    //     isLoading: leadLoading,
    //     error: leadError,
    // } = useQuery<{ data: Lead }, Error>({
    //     queryKey: ['lead', leadId],
    //     queryFn: () => getLeadById(leadId),
    //     enabled: !!leadId,
    // })
    const {
        data: leadRes,
        isLoading: leadLoading,
        error: leadError,
    } = useQuery<{ data: Lead[] }, Error>({
        queryKey: ['leads'],
        queryFn: () => getLeads(),
        // Only enable this query if we are on the /leads page (not a specific lead)
        enabled: pathname === "/leads/dashboard",
        // Optional: success/error handlers
        // onSuccess: () => toast.success("Leads loaded"),
        // onError: () => toast.error("Failed to fetch leads")
    })

    const leads = leadRes?.data
    console.log("leads:", leads)

    // Fetch statuses + lost reasons
    const {
        data: statusesRes,
        isLoading: statusLoading,
        error: statusError,
    } = useQuery<{ data: LeadStatus[] }, Error>({
        queryKey: ['leadStatuses'],
        queryFn: () => getLeadStatuses(),
    })

    const statuses = statusesRes?.data || []

    // Mutation to update lead
    const updateLeadMutation = useMutation({
        mutationFn: (data: any) => editLead(leadId, data),
        onSuccess: () => {
            // Refetch lead details
            queryClient.invalidateQueries({ queryKey: ['lead', leadId] })

            // Refetch lead activity
            queryClient.invalidateQueries({ queryKey: ['leadActivities', leadId] });
        },
    })


    if (leadLoading || statusLoading) {
        return (
            <div className="flex w-full justify-center mt-[10%]">
                <Loader2 className="animate-spin" size={24} />
            </div>
        )
    }

    if (leadError || !leads) {
        return (
            <div className="flex w-full justify-center mt-[10%]">
                <div className="flex flex-col gap-3 items-center">
                    <CircleAlert className="w-10 h-10" />
                    <div className="font-semibold">Error getting the lead</div>
                </div>
            </div>
        )
    }

    // const bgColor = avatarBgColors[stringToColorIndex(lead?.name || lead?.id)]
    // const firstLetter = lead?.name ? lead.name.charAt(0).toUpperCase() : '?'


    // Get lost reasons for LOST status
    const lostStatus = statuses.find((s: any) => s.name === 'Lost')
    const lostReasons = lostStatus?.lostReasons || []

    return (
        // <div className="flex flex-col h-[calc(100vh-64px)] p-8 gap-4">
        <div className="flex flex-col p-4 gap-4">

            <MetricCardsComponent
                leads={leads}
            />

            {/* <div className="flex flex-1 flex-col gap-4 overflow-hidden w-full"> */}
            <div className="flex flex-1 flex-col gap-4 w-full">
                {/* <div className="w-full h-full"> */}
                <div className="w-full h-[480px]">
                    <ChartAreaLinear />
                </div>

                {/* <div className="flex-1 h-1/2 w-full overflow-y-auto">
                    You can add your LeadActivityComponent or another section here
                </div> */}
            </div>

            {/* <div className="flex flex-1 flex-col sm:flex-row gap-4 overflow-hidden"> */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* <div className="w-full sm:w-1/3 h-full"> */}
                <div className="w-full sm:w-1/3">
                    <ChartPieLabelCustom />
                </div>
                {/* <div className='w-full sm:w-1/3 h-full'> */}
                <div className='w-full sm:w-1/3'>
                    <ChartPieLabelCustom />
                </div>
                {/* <div className="w-full sm:w-1/3 h-full overflow-y-auto"> */}
                <div className="w-full sm:w-1/3">
                    <ChartAreaLinear />
                </div>
            </div>
        </div>
    )
}
