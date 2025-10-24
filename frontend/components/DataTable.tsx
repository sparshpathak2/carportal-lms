"use client"

import * as React from "react"
import * as XLSX from "xlsx"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { axiosInstance } from "@/lib/axios"
import { bulkUploadLeads, getLeads } from "@/features/leads/api/lead"
import { Dialog, DialogTrigger } from "./ui/dialog"
import { BulkUploadComponent } from "./BulkUploadComponent3"
import { AddLeadComponent } from "./AddLeadComponent3"
import { leadCategoryColors, leadStatusColors } from "@/app/constants/colors"
import { Lead } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import { renderCategoryIcon } from "@/lib/utils"
import { IconPlus, IconTarget, IconUpload, IconUserStar } from "@tabler/icons-react"
import { LeadOwnerModalComponent } from "./LeadOwnerModalComponent"
import { LeadStatusModalComponent } from "./LeadStatusModalComponent"

export const columns: ColumnDef<Lead>[] = [
    // {
    //     id: "select",
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={
    //                 table.getIsAllPageRowsSelected() ||
    //                 (table.getIsSomePageRowsSelected() && "indeterminate")
    //             }
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label="Select all"
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox
    //             checked={row.getIsSelected()}
    //             onCheckedChange={(value) => row.toggleSelected(!!value)}
    //             aria-label="Select row"
    //         />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    // },
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

// ✅ Define the exact required columns
const REQUIRED_COLUMNS = ["name", "email", "phone"]

export function DataTable() {

    // const [leads, setLeads] = useState<Lead[]>([])
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

    // ✅ Fetch leads using React Query
    const { data: leadsData, isLoading, isError, refetch } = useQuery({
        queryKey: ["leads"],
        queryFn: getLeads,
    })

    // const leads = leadsData?.data || []

    const leads = (leadsData?.data || []).sort((a: Lead, b: Lead) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });


    const table = useReactTable({
        data: leads,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        initialState: {
            pagination: {
                pageSize: 15,
            },
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     if (e.target.files?.[0]) {
    //         setFile(e.target.files[0])
    //     }
    // }

    // const handleUpload = async () => {
    //     if (!file) {
    //         toast.error("Please select a file first.")
    //         return
    //     }

    //     try {
    //         const data = await file.arrayBuffer()
    //         const workbook = XLSX.read(data, { type: "array" })
    //         const sheetName = workbook.SheetNames[0]
    //         const sheet = workbook.Sheets[sheetName]

    //         const jsonData: any[] = XLSX.utils.sheet_to_json(sheet)
    //         console.log("jsonData:", jsonData)

    //         if (!jsonData.length) {
    //             toast.error("Sheet is empty!")
    //             return
    //         }

    //         // ✅ Normalize columns for validation
    //         const sheetColumns = Object.keys(jsonData[0]).map(col => col.toLowerCase())
    //         const missingCols = REQUIRED_COLUMNS.filter(
    //             col => !sheetColumns.includes(col.toLowerCase())
    //         )
    //         if (missingCols.length > 0) {
    //             toast.error(`Missing columns: ${missingCols.join(", ")}`)
    //             return
    //         }

    //         // ✅ Normalize rows and map to Lead[]
    //         const validData: Lead[] = jsonData.map((row: any) => {
    //             const normalizedRow: any = {}
    //             Object.keys(row).forEach(key => {
    //                 normalizedRow[key.toLowerCase()] = row[key]
    //             })
    //             return {
    //                 name: normalizedRow.name,
    //                 email: normalizedRow.email,
    //                 phone: normalizedRow.phone,
    //             }
    //         })

    //         // ✅ Send to backend
    //         await bulkUploadLeads(validData)
    //         toast.success("Bulk upload successful!")
    //     } catch (error: any) {
    //         console.error(error)
    //         toast.error(error?.message || "Failed to upload")
    //     }
    // }


    return (
        <>
            <div className="w-full">
                <div className="flex items-center pb-4 gap-2 justify-between">
                    <Input
                        placeholder="Filter emails..."
                        value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("email")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm bg-white h-8"
                    />

                    <div className="flex gap-2 items-center">
                        <div className="hidden sm:flex gap-[-1px]">
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
                        </div>

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
                    <div className="text-sm"><span className="font-semibold">{leads?.length}</span> result(s)</div>
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
