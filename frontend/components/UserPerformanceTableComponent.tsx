import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table"
import { User } from "@/lib/types"
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react"
import { Fragment, useState } from "react"

type Props = {
    user: User
}

export function UserPerformanceTableComponent({ user }: Props) {
    const owners = user?.ownerOf ?? []
    const [expandedRow, setExpandedRow] = useState<string | null>(null)

    const toggleExpand = (id: string) => {
        setExpandedRow(prev => (prev === id ? null : id))
    }

    return (
        <Table className="!px-2">
            <TableBody>
                {owners.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                            No dealers assigned
                        </TableCell>
                    </TableRow>
                )}

                {owners.map((item) => {
                    const dealer = item.dealer
                    const packs = dealer?.packs ?? []

                    return (
                        <Fragment key={item.id}>
                            {/* MAIN ROW */}
                            <TableRow className="bg-gray-50 hover:bg-gray-50">

                                <TableCell className="font-medium pl-4 flex items-center gap-2">
                                    {/* Expand Button */}
                                    <button
                                        type="button"
                                        onClick={() => toggleExpand(item.id)}
                                        className="cursor-pointer"
                                    >
                                        {expandedRow === item.id ? (
                                            <IconChevronDown size={16} />
                                        ) : (
                                            <IconChevronRight size={16} />
                                        )}
                                    </button>

                                    {dealer?.name}
                                </TableCell>

                                <TableCell>{dealer?.type}</TableCell>

                                <TableCell>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </TableCell>

                            </TableRow>

                            {/* EXPANDED CONTENT */}
                            {expandedRow === item.id && (
                                <TableRow className="bg-white hover:bg-white">
                                    <TableCell colSpan={4} className="p-4">

                                        {/* <div className="p-4 rounded-lg border bg-white shadow">

                                            <div className="font-semibold mb-3">Dealer Details</div>
                                            <p><b>City:</b> {dealer?.city || "—"}</p>
                                            <p><b>Address:</b> {dealer?.address || "—"}</p>
                                            <p><b>Type:</b> {dealer?.type || "—"}</p>

                                            <h4 className="font-semibold mt-4 mb-2">Pack Details</h4>

                                            {packs.length === 0 ? (
                                                <p className="text-gray-500 text-sm">No packs added</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {packs.map((pack) => (
                                                        <div
                                                            key={pack.id}
                                                            className="p-3 border rounded-md bg-gray-50"
                                                        >
                                                            <p><b>Name:</b> {pack.name}</p>
                                                            <p><b>Target Leads:</b> {pack.targetLeads}</p>
                                                            <p><b>Cost:</b> ₹{pack.packCost}</p>
                                                            <p>
                                                                <b>Cycle Start:</b>{" "}
                                                                {new Date(pack.cycleStartDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div> */}
                                        <div className="grid grid-cols-2">
                                            <div className="flex flex-col gap-2">
                                                <div className="font-semibold">Target (Monthly)</div>
                                                <div>Target (Monthly)</div>
                                            </div>

                                            <div className="font-semibold mb-3">Dealer Details</div>
                                            <p><b>City:</b> {dealer?.city || "—"}</p>
                                            <p><b>Address:</b> {dealer?.address || "—"}</p>
                                            <p><b>Type:</b> {dealer?.type || "—"}</p>

                                            {/* PACK LIST */}
                                            <h4 className="font-semibold mt-4 mb-2">Pack Details</h4>

                                            {packs.length === 0 ? (
                                                <p className="text-gray-500 text-sm">No packs added</p>
                                            ) : (
                                                <div className="space-y-3">
                                                    {packs.map((pack) => (
                                                        <div
                                                            key={pack.id}
                                                            className="p-3 border rounded-md bg-gray-50"
                                                        >
                                                            <p><b>Name:</b> {pack.name}</p>
                                                            <p><b>Target Leads:</b> {pack.targetLeads}</p>
                                                            <p><b>Cost:</b> ₹{pack.packCost}</p>
                                                            <p>
                                                                <b>Cycle Start:</b>{" "}
                                                                {new Date(pack.cycleStartDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                    </TableCell>
                                </TableRow>
                            )}
                        </Fragment>
                    )
                })}
            </TableBody>
        </Table>
    )
}
