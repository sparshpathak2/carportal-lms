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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export interface Props<T> {
    columns: ColumnDef<T, any>[];
    data: T[];
    globalFilterFn?: (row: any, columnId: string, filterValue: any) => boolean;
    globalSearch?: string;
    onGlobalSearchChange?: (value: string) => void;
}

export function DataTable<T>({ columns, data, globalFilterFn, globalSearch, onGlobalSearchChange }: Props<T>) {

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})


    const table = useReactTable({
        data: data,
        columns,

        // 🔹 Sorting / Column filters
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,

        // 🔹 Visibility + row selection
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,

        // 🔹 GLOBAL FILTER HANDLER
        onGlobalFilterChange: onGlobalSearchChange,

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
        globalFilterFn: globalFilterFn,
    });

    return (
        <>
            <div className="flex flex-col gap-2 w-full">

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
                <div className="flex items-center justify-between space-x-2">
                    {/* <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div> */}
                    <div className="text-sm"><span className="font-semibold">{data?.length}</span> result(s)</div>
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
