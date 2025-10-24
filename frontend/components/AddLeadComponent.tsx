import { ReactNode } from "react"
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddLeadComponent({ open, onOpenChange }: Props) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const name = formData.get("name")
        const username = formData.get("username")

        console.log("Form Submitted:", { name, username })
        onOpenChange(false) // ✅ close after submit (optional)
    }
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                // className="w-full sm:max-w-2xl sm:w-[900px]"
                className="w-full sm:max-w-[600px]"
                side="right"
            >
                <SheetHeader>
                    <SheetTitle>Add Lead</SheetTitle>
                    <SheetDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit} className="flex flex-col h-full jusify-between">
                    {/* <div className="grid flex-1 auto-rows-min gap-6 px-4"> */}
                    <div className="grid sm:grid-cols-2 flex-1 auto-rows-min gap-6 px-4">
                        <div className="grid gap-3">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                            />
                        </div>
                        <div className="grid gap-3">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                name="username"
                            />
                        </div>
                    </div>
                    <SheetFooter className="flex flex-row w-full justify-end">
                        <SheetClose asChild>
                            <Button variant="outline">Close</Button>
                        </SheetClose>
                        <Button type="submit">Save changes</Button>
                    </SheetFooter>
                </form>

            </SheetContent>
        </Sheet>
    )
}
