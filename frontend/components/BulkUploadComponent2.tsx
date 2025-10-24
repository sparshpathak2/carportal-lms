"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

// 👇 styled file upload
function FileUpload({ onFileSelect }: { onFileSelect: (file: File | null) => void }) {
    const [fileName, setFileName] = useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setFileName(file.name)
            onFileSelect(file)
        } else {
            setFileName("")
            onFileSelect(null)
        }
    }

    return (
        <div className="grid gap-2">
            <Label htmlFor="file-upload">Upload File</Label>

            <div className="flex items-center gap-2">
                <input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleChange}
                    className="hidden"
                />

                <Label
                    htmlFor="file-upload"
                    className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                    Choose File
                </Label>

                {fileName && (
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {fileName}
                    </span>
                )}
            </div>
        </div>
    )
}

export function BulkUploadComponent({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const [file, setFile] = useState<File | null>(null)

    const handleUpload = () => {
        if (!file) {
            alert("Please select a file before uploading.")
            return
        }
        console.log("Uploading file:", file)
        // TODO: call your upload API here
        onOpenChange(false) // close after upload
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Leads</DialogTitle>
                    <DialogDescription>
                        Upload an Excel or CSV file to create multiple leads at once.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <FileUpload onFileSelect={(f) => setFile(f)} />
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleUpload}>
                        Upload
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
