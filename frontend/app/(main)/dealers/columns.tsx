import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { leadStatusColors } from "@/app/constants/constants";
import { Dealer } from "@/lib/types";

export const dealersColumns: ColumnDef<Dealer>[] = [
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
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const leadId = row.original.id; // ✅ make sure id exists in Lead type
      const leadName = row.getValue("name") as string;

      return (
        <a href={`/leads/${leadId}`} className="text-blue-600 hover:underline">
          {leadName}
        </a>
      );
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

      const colorClass =
        leadStatusColors[display] || "bg-gray-100 text-gray-700";

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
      const date = row.getValue("createdAt") as string | Date | null;

      if (!date) return <span>NA</span>;

      let formatted = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(date));

      // ✅ Force AM/PM to uppercase
      formatted = formatted.replace(/am|pm/, (match) => match.toUpperCase());

      return <div className="whitespace-nowrap">{formatted}</div>;
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
];
