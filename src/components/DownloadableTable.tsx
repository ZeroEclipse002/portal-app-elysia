import useSWR, { useSWRConfig } from "swr"
import { Table, TableHead, TableRow, TableHeader, TableCell, TableBody } from "./ui/table"
import type { DownloadableResourcesType, HighlightsType } from "@/db/schema"
import { Button } from "./ui/button"
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogFooter, DialogDescription } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { actions } from "astro:actions"
import { toast } from "sonner"

export const fetcher = async (url: string) => fetch(url).then(res => res.json())

export const DownloadableTable = () => {

    const { data: downloadableResources, isLoading } = useSWR<DownloadableResourcesType[]>("/api/downloadable-resources", fetcher)

    if (isLoading) return <div>Loading...</div>

    if (!downloadableResources) return <div>No downloadable resources found</div>

    return (
        <>
            <AddDownloadableButton />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Caption</TableHead>
                        <TableHead>Link</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {downloadableResources?.map((data) => (
                        <TableRow key={data.id}>
                            <TableCell>{data.caption}</TableCell>
                            <TableCell>{data.fileLink ? (<a href={data.fileLink} target="_blank" rel="noopener noreferrer">{data.fileLink.slice(0, 30) + "..."}</a>) : "No link"}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

const AddDownloadableButton = () => {

    const { mutate } = useSWRConfig()
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function addDownloadableResource(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        const formData = new FormData(e.target as HTMLFormElement)

        const { data, error } = await actions.admin.addDownloadableResource(formData)

        if (data) {
            toast.success("Downloadable resource added successfully")
        } else {
            toast.error("Failed to add downloadable resource")
        }

        mutate("/api/downloadable-resources")
        setIsLoading(false)
    }


    return (
        <Dialog>
            <DialogTrigger asChild className="w-full">
                <Button>Add Downloadable Resource</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Downloadable Resource</DialogTitle>
                    <DialogDescription>Add a downloadable resource to the table such as a pdf, document, etc.</DialogDescription>
                </DialogHeader>
                <form className="flex flex-col gap-4" onSubmit={addDownloadableResource}>
                    <Label htmlFor="fileLink">File</Label>
                    <Input id="fileLink" name="file" type="file" accept="application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document" placeholder="File" />
                    <p className="text-sm text-gray-500">Please provide a PDF or DOCX file</p>
                    <Label htmlFor="caption">Caption</Label>
                    <Input id="caption" name="caption" placeholder="Caption" />
                    <p className="text-sm text-gray-500">Please provide a short caption for the file</p>
                    <Button className="w-full mt-4" type="submit" disabled={isLoading}>Add</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}