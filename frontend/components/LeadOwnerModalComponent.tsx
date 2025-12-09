"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useContext, useEffect, useMemo, useState } from "react"
import { Dealer, Lead, LeadLostReason, LeadStatus, User } from "@/lib/types"
import toast from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getUsersByDealerId } from "@/features/users/api/user"
import { resolveLeadComputedFields } from "@/lib/leadResolution"
import { SessionContext } from "./SessionProvider"

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    lead: Lead
    users?: User[]
    dealers?: Dealer[]
    isSaving: boolean
    onSubmit?: (data: { status: string; lostReason?: string }) => void
    updateLeadMutation: any
}

export function LeadOwnerModalComponent({
    open,
    onOpenChange,
    lead,
    dealers,
    isSaving,
    updateLeadMutation
}: Props) {

    const { user } = useContext(SessionContext)
    const loggedInUser = user
    const [dealerId, setDealerId] = useState<string | undefined>(undefined);
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);

    // For change tracking
    const [initialDealerId, setInitialDealerId] = useState<string | undefined>(undefined)
    const [initialOwnerId, setInitialOwnerId] = useState<string | undefined>(undefined)

    const resolved = useMemo(() => resolveLeadComputedFields(lead, loggedInUser), [
        lead,
        loggedInUser,
    ]);

    useEffect(() => {
        if (open && lead) {
            setDealerId(resolved.resolvedDealerId || undefined)
            setSelectedUserId(resolved.resolvedAssignedToId || undefined)
            setInitialDealerId(resolved.resolvedDealerId || undefined)
            setInitialOwnerId(resolved.resolvedAssignedToId || undefined)
        }
    }, [open, lead])

    // Fetch users for selected dealer
    const {
        data: dealerUsersRes,
        isLoading: dealerUsersLoading,
        error: dealerUsersError,
    } = useQuery<{ data: User[] }, Error>({
        queryKey: ['users', dealerId],
        queryFn: () => getUsersByDealerId(dealerId!),
        enabled: !!dealerId,
    });

    const usersByDealerId = dealerUsersRes?.data || [];

    // Derive assignedToName dynamically
    const assignedToName = useMemo(() => {
        const selectedUser = usersByDealerId.find((u) => u.id === selectedUserId)
        return selectedUser ? selectedUser.name : undefined
    }, [selectedUserId, usersByDealerId])

    // Handle submit
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!dealerId) {
            toast.error("Please select a dealer")
            return
        }
        if (!selectedUserId) {
            toast.error("Please select a user")
            return
        }

        try {
            await updateLeadMutation.mutateAsync({
                id: lead.id,
                dealerId,
                assignedToId: selectedUserId,
                assignedToName
            })

            toast.success("Lead owner updated successfully!")
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error?.message || "Failed to update lead")
        }
    }

    // Determine if button should be disabled
    const isButtonDisabled =
        isSaving ||
        !dealerId ||
        !selectedUserId ||
        (dealerId === initialDealerId && selectedUserId === initialOwnerId)


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Change Lead Owner</DialogTitle>
                    {/* <DialogDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </DialogDescription> */}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4">
                    {/* <form className="grid gap-4"> */}
                    {/* <div className="grid gap-3">
                        <Label htmlFor="name-1">Name</Label>
                        <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="username-1">Username</Label>
                        <Input id="username-1" name="username" defaultValue="@peduarte" />
                    </div> */}

                    {/* Status + Lost Reason Section */}
                    <div className="grid gap-2">
                        <div className="flex gap-2 items-center">
                            {/* Status field */}
                            <div className="flex flex-col flex-1 gap-2">
                                <Label htmlFor="dealers" className="text-gray-500">
                                    Dealer
                                </Label>
                                <Select
                                    name="dealers"
                                    value={dealerId}
                                    onValueChange={(val) => {
                                        setDealerId(val);      // Update dealerId
                                        setSelectedUserId(""); // Reset user selection
                                    }}
                                >
                                    <SelectTrigger id="status" className="w-full">
                                        <SelectValue placeholder="Select Dealer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* {dealers?.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.name}
                                            </SelectItem>
                                        ))} */}
                                        {(!dealers || dealers.length === 0) ? (
                                            <SelectItem value="na" disabled>
                                                NA
                                            </SelectItem>
                                        ) : (
                                            dealers.map((d) => (
                                                <SelectItem key={d.id} value={d.id}>
                                                    {d.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Lost Reason field: only show when status is LOST */}
                            {/* {formData.status === "Lost" && ( */}
                            <div className="flex flex-col flex-1 gap-2">
                                <Label htmlFor="lostReason" className="text-gray-500">
                                    User
                                </Label>
                                <Select
                                    name="users"
                                    value={selectedUserId}
                                    onValueChange={(val) => setSelectedUserId(val)}
                                    disabled={!dealerId || dealerUsersLoading}
                                >
                                    <SelectTrigger id="users" className="w-full">
                                        <SelectValue placeholder={dealerUsersLoading ? "Loading..." : "Select User"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* {usersByDealerId.map((u) => (
                                            <SelectItem key={u.id} value={u.id}>
                                                {u.name}
                                            </SelectItem>
                                        ))} */}
                                        {usersByDealerId.length === 0 ? (
                                            <SelectItem value="na" disabled>
                                                NA
                                            </SelectItem>
                                        ) : (
                                            usersByDealerId.map((u) => (
                                                <SelectItem key={u.id} value={u.id}>
                                                    {u.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* )} */}
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        {/* <Button type="submit">Save changes</Button> */}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={isButtonDisabled}
                        >
                            {isSaving ? (
                                <>
                                    <div className="flex items-center gap-1.5">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Saving
                                    </div>
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
