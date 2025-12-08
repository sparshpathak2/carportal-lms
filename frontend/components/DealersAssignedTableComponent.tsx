import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { User } from "@/lib/types"
import { Button } from "./ui/button"
import { IconTrashX } from "@tabler/icons-react"

type Props = {
    user: User
    // bgColor: string
    // firstLetter: string
    // statuses: LeadStatus[] // pass from API
    // lostReasons: LeadLostReason[] // pass from API
    // // handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    // isSaving: boolean
    // updateUserMutation: any
    // users?: User[]
    // dealers?: Dealer[]
}

export function DealersAssignedTableComponent({ user }: Props) {
    // console.log("user:", user)
    const owners = user?.ownerOf ?? []
    return (
        <Table className="!px-2">
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-[100px] pl-4">Dealer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right pr-4">Assigned On</TableHead>
                    {/* <TableHead className="text-right pr-4">Options</TableHead> */}
                </TableRow>
            </TableHeader>
            {/* <TableBody>
                {invoices.map((invoice) => (
                    <TableRow key={invoice.invoice} className="bg-gray-50 hover:bg-gray-50">
                        <TableCell className="font-medium pl-4">{invoice.invoice}</TableCell>
                        <TableCell>{invoice.paymentStatus}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right pr-4">{invoice.totalAmount}</TableCell>
                    </TableRow>
                ))}
            </TableBody> */}
            <TableBody>
                {owners.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                            No dealers assigned
                        </TableCell>
                    </TableRow>
                )}

                {owners.map((item) => (
                    <TableRow key={item.id} className="bg-gray-50 hover:bg-gray-50">
                        <TableCell className="font-medium pl-4">
                            {item.dealer?.name}
                        </TableCell>
                        {/* <TableCell>{item.dealer?.city || "—"}</TableCell> */}
                        <TableCell>{item.dealer?.type}</TableCell>
                        <TableCell className="text-right pr-4">
                            {new Date(item.createdAt).toLocaleDateString()}
                        </TableCell>
                        {/* <TableCell className="flex justify-end gap-2 text-right pr-4">
                            <IconTrashX
                                className="w-5 h-5 cursor-pointer"
                            // onClick={() => setIsEditable((prev) => !prev)}
                            />
                        </TableCell> */}
                    </TableRow>
                ))}
            </TableBody>
            {/* <TableFooter>
                <TableRow>
                    <TableCell colSpan={3} className="pl-4">Total</TableCell>
                    <TableCell className="text-right pr-4">$2,500.00</TableCell>
                </TableRow>
            </TableFooter> */}
        </Table>
    )
}
