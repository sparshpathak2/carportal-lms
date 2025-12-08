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

    const getTargetStatus = (dailyTarget: number, dailyDelivered: number) => {
        if (dailyDelivered >= dailyTarget) return "Healthy"
        if (dailyDelivered >= dailyTarget * 0.9) return "Warning"
        if (dailyDelivered >= dailyTarget * 0.7) return "Critical"
        return "Critical"
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
                    const pack = dealer?.packs?.[0];

                    const monthlyTarget = pack?.targetLeads ?? 0;
                    const weeklyTarget = Math.round(monthlyTarget / 4);
                    const dailyTarget = Math.round(monthlyTarget / 24);

                    // 👉 Replace this with real delivered values
                    // const deliveredThisMonth = dealer?.stats?.monthDelivered ?? 0;
                    // const deliveredThisWeek = dealer?.stats?.weekDelivered ?? 0;
                    // const deliveredDailyAvg = dealer?.stats?.dailyAvg ?? 0;

                    // Target status depends on daily target vs daily delivered avg
                    // const targetStatus = getTargetStatus(dailyTarget, deliveredDailyAvg);

                    return (
                        <Fragment key={item.id}>
                            {/* MAIN ROW */}
                            <TableRow className="bg-gray-50 hover:bg-gray-50">

                                <TableCell className="font-medium pl-4 flex items-center gap-2">
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

                                {/* <TableCell>{targetStatus}</TableCell> */}

                                <TableCell>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </TableCell>

                            </TableRow>

                            {/* EXPANDED CONTENT */}
                            {expandedRow === item.id && (
                                <TableRow className="bg-white hover:bg-white">
                                    <TableCell colSpan={4} className="p-4">

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div className="flex flex-col gap-1">
                                                <div className="font-semibold">Target (Monthly)</div>
                                                <div>{monthlyTarget}</div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="font-semibold">Leads Delivered (This Month)</div>
                                                {/* <div>{deliveredThisMonth}</div> */}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <div className="font-semibold">Target (Weekly)</div>
                                                <div>{weeklyTarget}</div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="font-semibold">Leads Delivered (This Week)</div>
                                                {/* <div>{deliveredThisWeek}</div> */}
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <div className="font-semibold">Target (Daily)</div>
                                                <div>{dailyTarget}</div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <div className="font-semibold">Leads Delivered (Daily Average)</div>
                                                {/* <div>{deliveredDailyAvg}</div> */}
                                            </div>
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
