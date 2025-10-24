import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export function BulkUploadComponent() {
    const [file, setFile] = useState<File | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = () => {
        if (!file) {
            alert("Please select a file first")
            return
        }
        console.log("Uploading file:", file)
        // TODO: add upload logic here
    }

    return (
        <form>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bulk Upload Leads</DialogTitle>
                    <DialogDescription>
                        Upload your Excel or CSV file. Make sure it matches the required format.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                    <div className="grid gap-3">
                        <Label htmlFor="file-upload">Choose File</Label>
                        <input
                            id="file-upload"
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="cursor-pointer rounded border border-gray-300 p-2"
                        />
                    </div>

                    {file && (
                        <p className="text-sm text-muted-foreground">
                            Selected file: <span className="font-medium">{file.name}</span>
                        </p>
                    )}
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
        </form>
    )
}
