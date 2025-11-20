'use client'

import { leadCategoryColors, leadStatusColors } from "@/app/constants/constants"
import { DataTable } from "@/components/DataTableNew"
import { FilterDropdownComponent } from "@/components/FilterDropdownComponent5"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getLeadSources, getLeadStatuses } from "@/features/leads/api/lead"
import { Dealer } from "@/lib/types"
import { renderCategoryIcon } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { TableFilterComponent } from "@/components/TableFilterComponent4"
import { CalendarRangeComponent } from "@/components/CalendarRangeComponent"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconPlus, IconUpload } from "@tabler/icons-react"
import { BulkUploadComponent } from "@/components/BulkUploadComponent3"
import { AddLeadComponent } from "@/components/AddLeadComponent3"
import { getAllDealers } from "@/features/users/api/user"

type Filters = {
    status?: string[];
    category?: string[];
    source?: string[];
    owner?: string[];
    dateRange?: {
        from: Date | null;
        to: Date | null;
    };
};

export const columns: ColumnDef<Dealer>[] = [
    // {
    //     id: "select",
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={
    //                 table.getIsAllPageRowsSelected() ||
    //                 (table.getIsSomePageRowsSelected() && "indeterminate")
    //             }
    //             className="mr-2"
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label="Select all"
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox
    //             checked={row.getIsSelected()}
    //             onCheckedChange={(value) => row.toggleSelected(!!value)}
    //             aria-label="Select row"
    //             className="mr-2"
    //         />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    // },
    // {
    //     accessorKey: "amount",
    //     header: () => <div className="text-right">Amount</div>,
    //     cell: ({ row }) => {
    //         const amount = parseFloat(row.getValue("amount"))

    //         // Format the amount as a dollar amount
    //         const formatted = new Intl.NumberFormat("en-US", {
    //             style: "currency",
    //             currency: "USD",
    //         }).format(amount)

    //         return <div className="text-right font-medium">{formatted}</div>
    //     },
    // },
    {
        id: "serial",
        header: "No",
        cell: ({ row }) => row.index + 1, // ✅ row.index starts from 0
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "Lead Id",
        cell: ({ row }) => (
            <div className="">{row.getValue("id")}</div>
        ),

    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
            const leadId = row.original.id // ✅ make sure id exists in Lead type
            const leadName = row.getValue("name") as string

            return (
                <a
                    href={`/leads/${leadId}`}
                    className="text-blue-600 hover:underline"
                >
                    {leadName}
                </a>
            )
        },
    },
    // {
    //     accessorKey: "assignedToName",
    //     header: "Owner",
    //     cell: ({ row }) => {
    //         const assignedToName = row.getValue("assignedToName") as string;

    //         return (
    //             <span className="text-gray-700 font-medium">
    //                 {assignedToName || "-"}
    //             </span>
    //         );
    //     },
    // },
    {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("type") as string | null;
            const display = type ?? "NA";

            const colorClass = leadStatusColors[display] || "bg-gray-100 text-gray-700";

            return (
                // <Badge className={`capitalize ${colorClass}`}>
                <Badge className="capitalize bg-neutral-100 text-neutral-700">
                    {display.toLowerCase()}
                </Badge>
            );
        },
    },
    // {
    //     accessorKey: "status",
    //     header: "Status",
    //     cell: ({ row }) => {
    //         const status = row.getValue("status") as { name: string } | null;
    //         const statusName = status?.name ?? "NA";
    //         const colorClass = leadStatusColors[statusName] || "bg-gray-100 text-gray-700";

    //         return (
    //             <Badge className={`capitalize ${colorClass}`}>
    //                 {statusName}
    //             </Badge>
    //         );
    //     },
    // },

    {
        accessorKey: "createdAt",
        header: "Date Created",
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as string | Date | null

            if (!date) return <span>NA</span>

            let formatted = new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }).format(new Date(date))

            // ✅ Force AM/PM to uppercase
            formatted = formatted.replace(/am|pm/, (match) => match.toUpperCase())

            return <div className="whitespace-nowrap">{formatted}</div>
        },
    },
    // {
    //     id: "actions",
    //     enableHiding: false,
    //     cell: ({ row }) => {
    //         const payment = row.original

    //         return (
    //             <DropdownMenu>
    //                 <DropdownMenuTrigger asChild>
    //                     <Button variant="ghost" className="h-8 w-8 p-0">
    //                         <span className="sr-only">Open menu</span>
    //                         <MoreHorizontal />
    //                     </Button>
    //                 </DropdownMenuTrigger>
    //                 <DropdownMenuContent align="end">
    //                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
    //                     <DropdownMenuItem
    //                     // onClick={() => navigator.clipboard.writeText(payment.id)}
    //                     >
    //                         Copy payment ID
    //                     </DropdownMenuItem>
    //                     <DropdownMenuSeparator />
    //                     <DropdownMenuItem>View customer</DropdownMenuItem>
    //                     <DropdownMenuItem>View payment details</DropdownMenuItem>
    //                 </DropdownMenuContent>
    //             </DropdownMenu>
    //         )
    //     },
    // },
]

export default function Page() {
    const [filters, setFilters] = useState<Filters>({})
    const [filtersActive, setFiltersActive] = useState<string[]>([])
    const [openUploadModal, setOpenUploadModal] = useState(false)
    const [openAddLeadModal, setOpenAddLeadModal] = useState(false)
    // const [isOwnerModalOpen, setOwnerModalOpen] = useState(false)
    // const [isStatusModalOpen, setStatusModalOpen] = useState(false)
    // const [isFilterModalOpen, setFilterModalOpen] = useState(false)
    const [globalSearch, setGlobalSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"all_dealers">(
        "all_dealers"
    )

    const {
        data: dealersData,
        isLoading: isUsersLoading,
        isError: isUsersError,
        refetch: refetchUsers,
    } = useQuery({
        queryKey: ["dealers"], // 🧩 include filters in query key for auto refetch
        // queryFn: () => getLeadsWithFilters(filters), // ✅ pass filters to API
        queryFn: () => getAllDealers(), // ✅ pass filters to API
        // enabled: isLoaded, // ✅ wait for filters to load from localStorage
        // enabled: true,
    });

    const allDealers = dealersData?.data || []

    const {
        data: leadStatuses,
        isLoading: isLeadStatusesLoading,
        isError: isLeadStatusesError,
        refetch: refetchLeadStatuses,
    } = useQuery({
        queryKey: ["leadStatuses"],
        queryFn: getLeadStatuses,
    });

    const {
        data: leadSources,
        isLoading: isLeadSourcesLoading,
        isError: isLeadSourcesError,
        refetch: refetchLeadSources,
    } = useQuery({
        queryKey: ["leadSources"],
        queryFn: getLeadSources,
    });

    console.log("leadSources:", leadSources)

    const filteredData = React.useMemo(() => {
        if (!Array.isArray(allDealers)) return [];

        let results = allDealers;

        // ✅ Filter by Status
        if (filters.status?.length) {
            results = results.filter((dealer) => {
                // handle both `lead.status` being object or string
                const leadStatus = typeof dealer.status === "object" ? dealer.status.name : dealer.status;
                return filters?.status?.includes(leadStatus);
            });
        }

        // ✅ Filter by Category (Hot / Warm / Cold)
        if (filters.category?.length) {
            results = results.filter((lead) => {
                const leadCategory =
                    typeof lead.category === "object"
                        ? lead.category.name
                        : lead.category || "";

                return filters?.category?.includes(leadCategory);
            });
        }

        // ✅ Filter by Source (null-safe)
        if (filters.source?.length) {
            results = results.filter((lead) =>
                filters?.source?.includes(lead.source || "Unknown")
            );
        }

        // ✅ Filter by Owner
        if (filters.owner?.length) {
            results = results.filter((lead) =>
                filters?.owner?.includes(lead.assignedToName || "")
            );
        }

        // ✅ Filter by Date Range
        if (filters.dateRange?.from || filters.dateRange?.to) {
            const from = filters.dateRange.from
                ? new Date(filters.dateRange.from).setHours(0, 0, 0, 0)
                : null;

            const to = filters.dateRange.to
                ? new Date(filters.dateRange.to).setHours(23, 59, 59, 999)
                : null;

            results = results.filter((lead) => {
                const created = new Date(lead.createdAt).getTime();

                if (from && created < from) return false;
                if (to && created > to) return false;
                return true;
            });
        }


        return results;
    }, [allDealers, filters, filtersActive]);

    const leadGlobalFilterFn = (
        row: any,
        columnId: string,
        filterValue: string
    ) => {
        if (!filterValue) return true;

        const search = String(filterValue).toLowerCase();
        const lead = row.original;

        const searchable = [
            lead.id || "",
            lead.email || "",
            lead.phone || lead.mobile || "",
            lead.name || "",
        ]
            .join(" ")
            .toLowerCase();

        return searchable.includes(search);
    };

    const handleFilterChange = (newFilter: Record<string, any>) => {
        setFilters((prev) => ({ ...prev, ...newFilter }))
    }

    const handleFilterSelect = (filterName: string) => {
        setFiltersActive((prev) =>
            prev.includes(filterName)
                ? prev.filter((f) => f !== filterName) // toggle off if already active
                : [...prev, filterName] // add if not active
        )
    }

    const clearAllFilters = () => setFilters({})

    // 2️⃣ Tab click handler
    const handleTabClick = (tab: typeof activeTab) => {
        setActiveTab(tab)
    }

    return (
        <div className="flex flex-1 flex-col gap-2">

            {/* 🔥 Sticky top section */}
            <div className="sticky top-0 z-50 bg-white flex flex-col gap-2 border-b">
                {/* Tabs */}
                <div className="flex border-b px-2">
                    <div
                        className={`font-semibold p-2 cursor-pointer border-b-2 ${activeTab === "all_dealers" ? "border-blue-600" : "border-transparent"
                            }`}
                        onClick={() => handleTabClick("all_dealers")}
                    >
                        All Dealers
                    </div>
                </div>

                {/* Options */}
                <div className="flex items-center gap-2 justify-between px-2">
                    {/* <Input
                            placeholder="Search by email..."
                            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("email")?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm bg-white h-8"
                        /> */}

                    <Input
                        placeholder="Search by Email, Mobile, or ID..."
                        value={globalSearch}
                        onChange={(e) => setGlobalSearch(e.target.value)}
                        className="max-w-sm bg-white h-8"
                    />


                    <div className="flex gap-2 items-center">
                        {/* <div className="hidden sm:flex gap-[-1px]">
                                <Button
                                    size="sm"
                                    onClick={() => setStatusModalOpen(true)}
                                    className="rounded-r-none"
                                >
                                    <IconTarget className="text-white" />
                                    Change Status
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setOwnerModalOpen(true)}
                                    // className="rounded-r-none bg-white text-blue-600 border border-blue-600"
                                    className="rounded-l-none border-l-1 border-l-white"
                                >
                                    <IconUserStar className="text-white" />
                                    Change Owner
                                </Button>
                            </div> */}

                        {/* <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setFilterModalOpen(true)}
                                className="rounded-full"
                            >
                                <IconFilter2 />
                                Filter
                            </Button> */}

                        {/* <TableFilterComponent
                                trigger={<Button
                                    size="sm"
                                    variant="outline"
                                    // onClick={() => setFilterModalOpen(true)}
                                    className="rounded-full"
                                >
                                    <IconFilter2 />
                                    Filter
                                </Button>}
                            /> */}


                        <TableFilterComponent
                            onFilterSelect={handleFilterSelect}
                        />

                        <CalendarRangeComponent
                            onApply={(range) => {
                                handleFilterChange({
                                    dateRange: {
                                        from: range?.from ? new Date(range.from) : null,
                                        to: range?.to ? new Date(range.to) : null
                                    }
                                })
                            }}
                        />


                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setOpenUploadModal(true)}>
                                <IconUpload />
                                Upload
                            </Button>

                            <BulkUploadComponent open={openUploadModal} onOpenChange={setOpenUploadModal} />

                            <Button size="sm" onClick={() => setOpenAddLeadModal(true)} >
                                <IconPlus />
                                Add
                            </Button>

                            <AddLeadComponent open={openAddLeadModal} onOpenChange={setOpenAddLeadModal} />
                        </div>

                    </div>

                </div>

                {/* Filters */}
                <div className="flex gap-2 px-2">
                    {filtersActive.includes("Status") && (
                        <FilterDropdownComponent
                            label="Status"
                            filterKey="status"
                            // options={["New", "Contacted", "Converted"]}
                            options={leadStatuses?.data.map((status: any) => status.name) || []}
                            selectedValues={filters.status || []}
                            onChange={handleFilterChange}
                        />
                    )}

                    {filtersActive.includes("Category") && (
                        <FilterDropdownComponent
                            label="Category"
                            filterKey="category"
                            options={["HOT", "WARM", "COLD"]}
                            selectedValues={filters.category || []}
                            onChange={handleFilterChange}
                        />
                    )}

                    {filtersActive.includes("Source") && (
                        <FilterDropdownComponent
                            label="Source"
                            filterKey="source"
                            // options={["Website", "Referral", "Social Media"]}
                            options={leadSources?.data}
                            selectedValues={filters.source || []}
                            onChange={handleFilterChange}
                        />
                    )}

                    {filtersActive.includes("Owner") && (
                        <FilterDropdownComponent
                            label="Owner"
                            filterKey="owner"
                            options={["Alice", "Bob", "Charlie"]}
                            selectedValues={filters.owner || []}
                            onChange={handleFilterChange}
                        />
                    )}
                </div>
            </div>

            {/* Tab content */}
            {/* <div className="flex-1 p-4 overflow-y-auto"> */}
            <div className="px-2">
                {activeTab === "all_dealers" &&
                    <DataTable
                        columns={columns}
                        data={filteredData}
                        globalFilterFn={leadGlobalFilterFn}
                        globalSearch={globalSearch}
                        onGlobalSearchChange={setGlobalSearch}
                    />
                }
            </div>

        </div>
    )
}
