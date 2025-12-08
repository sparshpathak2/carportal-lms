'use client'

import { leadCategoryColors, leadStatusColors } from "@/app/constants/constants"
import { DataTable } from "@/components/DataTableNew"
import { FilterDropdownComponent } from "@/components/FilterDropdownComponent5"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { getLeads, getLeadSources, getLeadStatuses } from "@/features/leads/api/lead"
import { renderCategoryIcon } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { TableFilterComponent } from "@/components/TableFilterComponent4"
import { CalendarRangeComponent } from "@/components/CalendarRangeComponent"
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { IconPlus, IconUpload } from "@tabler/icons-react"
import { BulkUploadComponent } from "@/components/BulkUploadComponent3"
import { AddLeadComponent } from "@/components/AddLeadComponent4"
import { leadsColumns } from "./columns"

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

export default function Page() {
    const [filters, setFilters] = useState<Filters>({})
    const [filtersActive, setFiltersActive] = useState<string[]>([])
    const [openUploadModal, setOpenUploadModal] = useState(false)
    const [openAddLeadModal, setOpenAddLeadModal] = useState(false)
    // const [isOwnerModalOpen, setOwnerModalOpen] = useState(false)
    // const [isStatusModalOpen, setStatusModalOpen] = useState(false)
    // const [isFilterModalOpen, setFilterModalOpen] = useState(false)
    const [globalSearch, setGlobalSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"all_leads" | "unattended" | "pending_approval">(
        "all_leads"
    )

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

    const filteredData = React.useMemo(() => {
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

    const leadGlobalFilterFn = (
        row: any,
        columnId: string,
        filterValue: string
    ) => {
        if (!filterValue) return true;

        const search = String(filterValue).toLowerCase();
        const lead = row.original;

        // const searchable = [
        //     lead.id || "",
        //     lead.email || "",
        //     lead.phone || lead.mobile || "",
        //     lead.name || "",
        // ]
        const searchable = [
            lead.id || "",
            lead?.customer?.email || "",
            lead?.customer?.phone || lead?.customer?.mobile || "",
            lead?.customer?.name || "",
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
                        className={`font-semibold p-2 cursor-pointer border-b-2 ${activeTab === "all_leads" ? "border-blue-600" : "border-transparent"
                            }`}
                        onClick={() => handleTabClick("all_leads")}
                    >
                        All Leads
                    </div>

                    <div
                        className={`font-semibold p-2 cursor-pointer border-b-2 text-neutral-500 ${activeTab === "unattended" ? "border-blue-600" : "border-transparent"
                            }`}
                    // onClick={() => handleTabClick("unattended")}
                    >
                        Unattended
                    </div>

                    <div
                        className={`font-semibold p-2 cursor-pointer border-b-2 text-neutral-500 ${activeTab === "pending_approval" ? "border-blue-600" : "border-transparent"
                            }`}
                    // onClick={() => handleTabClick("pending_approval")}
                    >
                        Pending Approval
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
                        <div className="pb-2">
                            <FilterDropdownComponent
                                label="Status"
                                filterKey="status"
                                // options={["New", "Contacted", "Converted"]}
                                options={leadStatuses?.data.map((status: any) => status.name) || []}
                                selectedValues={filters.status || []}
                                onChange={handleFilterChange}
                            />
                        </div>
                    )}

                    {filtersActive.includes("Category") && (
                        <div className="pb-2">
                            <FilterDropdownComponent
                                label="Category"
                                filterKey="category"
                                options={["HOT", "WARM", "COLD"]}
                                selectedValues={filters.category || []}
                                onChange={handleFilterChange}
                            />
                        </div>
                    )}

                    {filtersActive.includes("Source") && (
                        <div className="pb-2">
                            <FilterDropdownComponent
                                label="Source"
                                filterKey="source"
                                // options={["Website", "Referral", "Social Media"]}
                                options={leadSources?.data}
                                selectedValues={filters.source || []}
                                onChange={handleFilterChange}
                            />
                        </div>
                    )}

                    {/* {filtersActive.includes("Owner") && (
                    <div className="pb-2">
                        <FilterDropdownComponent
                            label="Owner"
                            filterKey="owner"
                            options={["Alice", "Bob", "Charlie"]}
                            selectedValues={filters.owner || []}
                            onChange={handleFilterChange}
                        />
</div>
                    )} */}
                </div>
            </div>

            {/* Tab content */}
            {/* <div className="flex-1 p-4 overflow-y-auto"> */}
            <div className="px-2">
                {activeTab === "all_leads" &&
                    <DataTable
                        columns={leadsColumns}
                        data={filteredData}
                        globalFilterFn={leadGlobalFilterFn}
                        globalSearch={globalSearch}
                        onGlobalSearchChange={setGlobalSearch}
                    />
                }
                {activeTab === "unattended" &&
                    <DataTable
                        columns={leadsColumns}
                        data={filteredData}
                        globalFilterFn={leadGlobalFilterFn}
                        globalSearch={globalSearch}
                        onGlobalSearchChange={setGlobalSearch}
                    />
                }
                {activeTab === "pending_approval" &&
                    <DataTable
                        columns={leadsColumns}
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
