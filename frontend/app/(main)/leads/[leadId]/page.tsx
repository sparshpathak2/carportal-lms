'use client'

import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getLeadById, getLeadStatuses, editLead } from '@/features/leads/api/lead'
import LeadDetailsForm from '@/components/LeadDetailsComponent2'
import LeadActivityComponent from '@/components/LeadActivityComponent'
import LeadHeader from '@/components/LeadHeaderComponent'
import { Loader2, CircleAlert } from 'lucide-react'
import { avatarBgColors } from '@/app/constants/constants'
import { Dealer, Lead, LeadStatus, User } from '@/lib/types'
import toast from 'react-hot-toast'
import { getAllDealers, getAllUsers, getUsersByDealerId } from '@/features/users/api/user'
import { useState } from 'react'
import { stringToColorIndex } from '@/lib/utils'

export default function LeadDetailPage() {
    const { leadId } = useParams<{ leadId: string }>()
    const queryClient = useQueryClient()

    // Fetch lead
    const {
        data: leadRes,
        isLoading: leadLoading,
        error: leadError,
    } = useQuery<{ data: Lead }, Error>({
        queryKey: ['lead', leadId],
        queryFn: () => getLeadById(leadId),
        enabled: !!leadId,
        // onSuccess: () => toast.success("Lead details loaded"),
        // onError: () => {
        //     toast.error("Failes to fetch lead details")
        // }
    })

    const lead = leadRes?.data

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

    // Fetch all users
    const {
        data: usersRes,
        isLoading: usersLoading,
        error: usersError,
    } = useQuery<{ data: User[] }, Error>({
        queryKey: ['users'],
        queryFn: getAllUsers,
    });

    const users = usersRes?.data


    const {
        data: allDealersRes,
        isLoading: allDealersLoading,
        error: allDealersError,
    } = useQuery<{ data: Dealer[] }, Error>({
        queryKey: ['dealers'],
        queryFn: getAllDealers,
    });

    const dealers = allDealersRes?.data

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

    if (leadError || !lead) {
        return (
            <div className="flex w-full justify-center mt-[10%]">
                <div className="flex flex-col gap-3 items-center">
                    <CircleAlert className="w-10 h-10" />
                    <div className="font-semibold">Error getting the lead</div>
                </div>
            </div>
        )
    }

    const bgColor = avatarBgColors[stringToColorIndex(lead?.name || lead?.id)]
    const firstLetter = lead?.name ? lead.name.charAt(0).toUpperCase() : '?'


    // Get lost reasons for LOST status
    const lostStatus = statuses.find((s: any) => s.name === 'Lost')
    const lostReasons = lostStatus?.lostReasons || []

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] p-4 gap-4">
            <LeadHeader
                lead={lead}
                bgColor={bgColor}
                firstLetter={firstLetter}
                statuses={statuses}
                lostReasons={lostReasons}
                isSaving={updateLeadMutation.isPending}
                updateLeadMutation={updateLeadMutation}
                users={users}
                dealers={dealers}
            />

            <div className="flex flex-1 flex-col sm:flex-row gap-4 overflow-hidden">
                <div className="w-full sm:w-1/2 h-full">
                    <LeadDetailsForm
                        lead={lead}
                        statuses={statuses}
                        lostReasons={lostReasons}
                        // handleSubmit={handleSubmit}
                        isSaving={updateLeadMutation.isPending}
                        updateLeadMutation={updateLeadMutation}
                    />
                </div>
                <div className="w-full sm:w-1/2 h-full overflow-y-auto">
                    <LeadActivityComponent
                        lead={lead}
                    />
                </div>
            </div>
        </div>
    )
}
