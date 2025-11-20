"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import toast from "react-hot-toast"
import { getLeads, getLeadSources, getLeadStatuses } from "@/features/leads/api/lead"
import { BulkUploadComponent } from "./BulkUploadComponent3"
import { AddLeadComponent } from "./AddLeadComponent3"
import { leadCategoryColors, leadStatusColors } from "@/app/constants/constants"
import { Lead } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { renderCategoryIcon } from "@/lib/utils"
import { IconFilter2, IconPlus, IconTarget, IconUpload, IconUserStar } from "@tabler/icons-react"
import { LeadOwnerModalComponent } from "./LeadOwnerModalComponent"
import { LeadStatusModalComponent } from "./LeadStatusModalComponent"
import { CalendarRangeComponent } from "./CalendarRangeComponent"
import { TableFilterComponent } from "./TableFilterComponent4"
import { useUserFilters } from "@/hooks/useUserFilters"
import { SessionContext } from "./SessionProvider"
import ActiveFilters from "./ActiveFiltersComponent3"
import { FilterDropdownComponent } from "./FilterDropdownComponent5"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { Checkbox } from "./ui/checkbox"

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

export const columns: ColumnDef<Lead>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                className="mr-2"
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="mr-2"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    // {
    //     accessorKey: "status",
    //     header: "Status",
    //     cell: ({ row }) => (
    //         <div className="capitalize">{row.getValue("status")}</div>
    //     ),
    // },
    // {
    //     accessorKey: "email",
    //     header: ({ column }) => {
    //         return (
    //             <Button
    //                 variant="ghost"
    //                 onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    //             >
    //                 Email
    //                 <ArrowUpDown />
    //             </Button>
    //         )
    //     },
    //     cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
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
    // {
    //     accessorKey: "name",
    //     header: "Name",
    //     cell: ({ row }) => (
    //         <div className="">{row.getValue("name")}</div>
    //     ),

    // },
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
    {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => <div className="lowercase">{row.getValue("phone")}</div>
    },
    {
        accessorKey: "assignedToName",
        header: "Owner",
        cell: ({ row }) => {
            const assignedToName = row.getValue("assignedToName") as string;

            return (
                <span className="text-gray-700 font-medium">
                    {assignedToName || "-"}
                </span>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as { name: string } | null;
            const statusName = status?.name ?? "NA";
            const colorClass = leadStatusColors[statusName] || "bg-gray-100 text-gray-700";

            return (
                <Badge className={`capitalize ${colorClass}`}>
                    {statusName}
                </Badge>
            );
        },
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => {
            const lead = row.original; // full row data
            const category = row.getValue("category") as string;
            const colorClass =
                leadCategoryColors[category] || "bg-gray-100 text-gray-700";

            return (
                <Badge className={`capitalize flex items-center gap-1 ${colorClass}`}>
                    {renderCategoryIcon(lead)}
                    {category || "-"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => {
            const source = row.getValue("source") as string;

            return (
                <span className="text-gray-700 font-medium">
                    {source || "-"}
                </span>
            );
        },
    },
    // {
    //     accessorKey: "statusId",
    //     header: "Status",
    //     cell: ({ row }) => <div className="capitalize">{row.getValue("statusId")}</div>,
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

export function DataTable() {

    const { user } = React.useContext(SessionContext)
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [file, setFile] = useState<File | null>(null)
    const [openUploadModal, setOpenUploadModal] = useState(false)
    const [openAddLeadModal, setOpenAddLeadModal] = useState(false)
    const [isOwnerModalOpen, setOwnerModalOpen] = useState(false)
    const [isStatusModalOpen, setStatusModalOpen] = useState(false)
    const [isFilterModalOpen, setFilterModalOpen] = useState(false)
    const [filtersActive, setFiltersActive] = useState<string[]>([])
    const [globalSearch, setGlobalSearch] = useState("");

    // const [filters, setFilters] = useState<Record<string, string[]>>({})
    const [filters, setFilters] = useState<Filters>({})

    console.log("filtersActive:", filtersActive)

    // ✅ Fetch leads using React Query
    // const { data: leadsData, isLoading, isError, refetch } = useQuery({
    //     queryKey: ["leads"],
    //     queryFn: getLeads,
    // })

    const {
        data: leadsData,
        isLoading: isLeadsLoading,
        isError: isLeadsError,
        refetch: refetchLeads,
    } = useQuery({
        queryKey: ["leads"], // 🧩 include filters in query key for auto refetch
        // queryFn: () => getLeadsWithFilters(filters), // ✅ pass filters to API
        queryFn: () => getLeads(), // ✅ pass filters to API
        // enabled: isLoaded, // ✅ wait for filters to load from localStorage
        // enabled: true,
    });

    const allLeads = leadsData?.data || []

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

    // const leads = (leadsData?.data || []).sort((a: Lead, b: Lead) => {
    //     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    // });

    const filteredLeads = React.useMemo(() => {
        if (!Array.isArray(allLeads)) return [];

        let results = allLeads;

        // ✅ Filter by Status
        if (filters.status?.length) {
            results = results.filter((lead) => {
                // handle both `lead.status` being object or string
                const leadStatus = typeof lead.status === "object" ? lead.status.name : lead.status;
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
    }, [allLeads, filters, filtersActive]);


    const handleFilterChange = (newFilter: Record<string, any>) => {
        setFilters((prev) => ({ ...prev, ...newFilter }))
    }

    console.log("filters:", filters)

    // const handleFilterChange = (newFilter: Record<string, any>) => {
    //     setFilters((prev) => ({
    //         ...prev,
    //         ...newFilter,
    //     }))
    // }

    const clearAllFilters = () => setFilters({})


    const table = useReactTable({
        data: filteredLeads,
        columns,

        // 🔹 Sorting / Column filters
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,

        // 🔹 Visibility + row selection
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,

        // 🔹 GLOBAL FILTER HANDLER
        onGlobalFilterChange: setGlobalSearch,

        // 🔹 Table State
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,

            // 🔹 Add global search value
            globalFilter: globalSearch,
        },

        // 🔹 Default pagination
        initialState: {
            pagination: {
                pageSize: 15,
            },
        },

        // 🔹 Required table models
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),

        // 🔥 CUSTOM GLOBAL FILTER FUNCTION
        globalFilterFn: (row, columnId, filterValue) => {
            if (!filterValue) return true;

            const search = String(filterValue).toLowerCase();
            const lead = row.original;

            // Combine searchable fields
            const searchable = [
                lead.id || "",
                lead.email || "",
                lead.phone || lead.mobile || "",
                lead.name || "",
            ]
                .join(" ")
                .toLowerCase();

            return searchable.includes(search);
        },
    });


    const handleFilterSelect = (filterName: string) => {
        setFiltersActive((prev) =>
            prev.includes(filterName)
                ? prev.filter((f) => f !== filterName) // toggle off if already active
                : [...prev, filterName] // add if not active
        )
    }

    return (
        <>
            <div className="flex flex-col gap-2 w-full">
                <div className="flex items-center gap-2 justify-between">
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
                            // trigger={
                            //     <Button size="sm" variant="outline" className="rounded-full">
                            //         <IconFilter2 />
                            //         Filter
                            //     </Button>
                            // }
                            onFilterSelect={handleFilterSelect}
                        />

                        {/* <CalendarRangeComponent /> */}

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

                {/* <ActiveFilters filters={filters} onRemove={handleRemoveFilter} /> */}

                {/* <ActiveFilters
                    filters={filters}
                    onRemove={handleRemoveFilter}
                    onUpdate={handleUpdateFilter}
                /> */}

                {/* <FilterDropdownComponent
                    label="Status"
                    filterKey="status"
                    options={["Active", "Inactive", "Pending"]}
                    selectedValues={filters.status || []}
                    onChange={applyFilters}
                // onRemove={removeFilter}
                /> */}

                <div className="flex gap-2">
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


                <div className="overflow-hidden rounded-md border bg-white">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between space-x-2 py-4">
                    {/* <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div> */}
                    <div className="text-sm"><span className="font-semibold">{filteredLeads?.length}</span> result(s)</div>
                    <div className="space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            {/* <TableFilterComponent
                open={isFilterModalOpen}
                onOpenChange={setFilterModalOpen}
            /> */}

            {/* <LeadOwnerModalComponent
                open={isOwnerModalOpen}
                onOpenChange={setOwnerModalOpen}
                users={users}
                dealers={dealers}
                lead={lead}
                isSaving={updateLeadMutation.isPending}
                updateLeadMutation={updateLeadMutation}
            />
            <LeadStatusModalComponent
                open={isStatusModalOpen}
                onOpenChange={setStatusModalOpen}
                lead={lead}
                statuses={statuses}
                lostReasons={lostReasons}
                isSaving={updateLeadMutation.isPending}
                updateLeadMutation={updateLeadMutation}
            /> */}
        </>
    )
}
