import { leadStatusColors } from "@/app/constants/constants";
import { Badge } from "@/components/ui/badge";
import { User } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";

export const usersColumns: ColumnDef<User>[] = [
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
            const userId = row.original.id // ✅ make sure id exists in Lead type
            const userName = row.getValue("name") as string

            return (
                <a
                    href={`/users/${userId}`}
                    className="text-blue-600 hover:underline"
                >
                    {userName}
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
    // {
    //     accessorKey: "category",
    //     header: "Category",
    //     cell: ({ row }) => {
    //         const lead = row.original; // full row data
    //         const category = row.getValue("category") as string;
    //         const colorClass =
    //             leadCategoryColors[category] || "bg-gray-100 text-gray-700";

    //         return (
    //             <Badge className={`capitalize flex items-center gap-1 ${colorClass}`}>
    //                 {renderCategoryIcon(lead)}
    //                 {category || "-"}
    //             </Badge>
    //         );
    //     },
    // },
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