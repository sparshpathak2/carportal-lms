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
import * as XLSX from "xlsx"
import toast from "react-hot-toast"
import { bulkUploadLeads } from "@/features/leads/api/lead"
import { useMutation, useQueryClient } from "@tanstack/react-query"

// Required columns in sheet
const REQUIRED_COLUMNS = ["name", "email", "phone"]

type Lead = {
    name: string
    email?: string | null
    phone?: string | null
}

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
    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: (data: any[]) => bulkUploadLeads(data),
        onSuccess: () => {
            toast.success("Bulk upload successful!")
            queryClient.invalidateQueries({ queryKey: ["leads"] }) // refresh leads
            onOpenChange(false)
        },
        onError: (error: any) => {
            toast.error(error?.message || "Failed to upload")
        },
    })

    const handleUpload = async () => {
        if (!file) {
            toast.error("Please select a file first.")
            return
        }

        try {
            const data = await file.arrayBuffer()
            const workbook = XLSX.read(data, { type: "array" })
            const sheetName = workbook.SheetNames[0]
            const sheet = workbook.Sheets[sheetName]

            const jsonData: any[] = XLSX.utils.sheet_to_json(sheet)
            console.log("jsonData:", jsonData)

            if (!jsonData.length) {
                toast.error("Sheet is empty!")
                return
            }

            // ✅ Normalize columns for validation
            const sheetColumns = Object.keys(jsonData[0]).map((col) => col.toLowerCase())
            const missingCols = REQUIRED_COLUMNS.filter(
                (col) => !sheetColumns.includes(col.toLowerCase())
            )
            if (missingCols.length > 0) {
                toast.error(`Missing columns: ${missingCols.join(", ")}`)
                return
            }

            // ✅ Normalize rows and map to Lead[]
            const validData: Lead[] = jsonData.map((row: any) => {
                const normalizedRow: any = {}
                Object.keys(row).forEach((key) => {
                    normalizedRow[key.toLowerCase()] = row[key]
                })
                return {
                    name: normalizedRow.name,
                    email: normalizedRow.email,
                    phone: normalizedRow.phone,
                }
            })

            // ✅ Send to backend
            mutation.mutate(validData)
        } catch (error: any) {
            console.error(error)
            toast.error(error?.message || "Failed to upload")
        }
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
