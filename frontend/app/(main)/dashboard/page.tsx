import { DataTable } from "@/components/DataTable"
// import { DataTable } from "@/components/DataTable2"
import { ColumnDef } from "@tanstack/react-table"

export type Payment = {
    id: string
    amount: number
    status: "pending" | "processing" | "success" | "failed"
    email: string
}

const payments: Payment[] = [
    { id: "m5gr84i9", amount: 316, status: "success", email: "ken99@example.com" },
    { id: "3u1reuv4", amount: 242, status: "success", email: "Abe45@example.com" },
    { id: "derv1ws0", amount: 837, status: "processing", email: "Monserrat44@example.com" },
    { id: "5kma53ae", amount: 874, status: "success", email: "Silas22@example.com" },
    { id: "bhqecj4p", amount: 721, status: "failed", email: "carmella@example.com" },
    { id: "a1bc23d4", amount: 150, status: "success", email: "liam.j@example.com" },
    { id: "b2cd34e5", amount: 499, status: "failed", email: "sophia.w@example.com" },
    { id: "c3de45f6", amount: 1200, status: "processing", email: "ethan.m@example.com" },
    { id: "d4ef56g7", amount: 640, status: "success", email: "ava.r@example.com" },
    { id: "e5fg67h8", amount: 305, status: "success", email: "noah.p@example.com" },
    { id: "f6gh78i9", amount: 760, status: "failed", email: "isabella.k@example.com" },
    { id: "g7hi89j0", amount: 980, status: "success", email: "oliver.l@example.com" },
    { id: "h8ij90k1", amount: 420, status: "processing", email: "mia.d@example.com" },
    { id: "i9jk01l2", amount: 110, status: "success", email: "lucas.h@example.com" },
    { id: "j0kl12m3", amount: 845, status: "failed", email: "amelia.z@example.com" },
    { id: "k1lm23n4", amount: 1330, status: "success", email: "james.c@example.com" },
    { id: "l2mn34o5", amount: 290, status: "processing", email: "harper.t@example.com" },
    { id: "m3no45p6", amount: 720, status: "success", email: "benjamin.u@example.com" },
    { id: "n4op56q7", amount: 415, status: "failed", email: "evelyn.b@example.com" },
    { id: "o5pq67r8", amount: 910, status: "success", email: "henry.g@example.com" },
    { id: "p6qr78s9", amount: 550, status: "success", email: "ella.j@example.com" },
    { id: "q7rs89t0", amount: 250, status: "processing", email: "william.v@example.com" },
    { id: "r8st90u1", amount: 1280, status: "success", email: "chloe.n@example.com" },
    { id: "s9tu01v2", amount: 690, status: "failed", email: "daniel.s@example.com" },
    { id: "t0uv12w3", amount: 360, status: "success", email: "aria.f@example.com" },
    { id: "u1vw23x4", amount: 775, status: "processing", email: "jackson.o@example.com" },
    { id: "v2wx34y5", amount: 1440, status: "success", email: "scarlett.m@example.com" },
    { id: "w3xy45z6", amount: 530, status: "failed", email: "michael.q@example.com" },
    { id: "x4yz56a7", amount: 870, status: "success", email: "sofia.r@example.com" },
    { id: "y5za67b8", amount: 310, status: "processing", email: "alexander.k@example.com" },
];

const columns: ColumnDef<Payment>[] = [
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "amount",
        header: "Amount",
    },
]

export default function Page() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            {/* {Array.from({ length: 24 }).map((_, index) => (
                        <div
                            key={index}
                            className="bg-muted/50 aspect-video h-12 w-full rounded-lg"
                        />
                    ))} */}
            <DataTable />
            {/* <DataTable columns={columns} data={payments} filterColumn="email" /> */}
        </div>
    )
}
