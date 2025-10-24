import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRef, useState } from "react"

export function FileUpload({ onFileSelect }: { onFileSelect: (file: File | null) => void }) {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [fileName, setFileName] = useState("")

    const handleClick = () => {
        fileInputRef.current?.click()
    }

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
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleChange}
                    className="hidden" // 👈 hide default input
                />

                <Button type="button" variant="outline" onClick={handleClick}>
                    Choose File
                </Button>

                {fileName && (
                    <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {fileName}
                    </span>
                )}
            </div>
        </div>
    )
}
