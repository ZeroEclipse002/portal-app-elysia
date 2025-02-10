import useSWR, { mutate, useSWRConfig } from "swr"
import { Table, TableHead, TableRow, TableHeader, TableCell, TableBody } from "./ui/table"
import type { HighlightsType } from "@/db/schema"
import { Button } from "./ui/button"
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogFooter, DialogDescription } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useState, useTransition } from "react"
import { cn, fetcher } from "@/lib/utils"
import { actions } from "astro:actions"
import { toast } from "sonner"


export const HighlightsTable = () => {

    const { data: highlights, isLoading, mutate } = useSWR<HighlightsType[]>("/api/highlights", fetcher)
    const [pending, startTransition] = useTransition()

    if (isLoading) return <div>Loading...</div>

    if (!highlights) return <div>No highlights found</div>

    function deleteHighlight(id: number) {
        startTransition(async () => {
            try {
                const response = await actions.admin.removeHighlight({
                    highlightId: id
                })

                if (response.data) {
                    toast.success("Highlight deleted successfully")
                } else {
                    toast.error("Failed to delete highlight")
                }

            } catch (error) {
                console.error(error)
            } finally {
                mutate()
            }
        })
    }

    return (
        <>
            <AddHighlightButton />
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Image</TableHead>
                        <TableHead>Caption</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {highlights?.map((data) => (
                        <TableRow key={data.id}>
                            <TableCell><img className="aspect-square object-cover rounded-md" src={data.image} alt={data.caption} width={50} height={50} /></TableCell>
                            <TableCell>{data.caption}</TableCell>
                            <TableCell>{data.link ? (<a href={data.link} target="_blank" rel="noopener noreferrer">{data.link.slice(0, 30) + "..."}</a>) : "No link"}</TableCell>
                            <TableCell>
                                <Button onClick={() => deleteHighlight(data.id)} variant={'destructive'}>
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    )
}

const AddHighlightButton = () => {

    const { mutate } = useSWRConfig()
    const [image, setImage] = useState<string>("")
    const [caption, setCaption] = useState<string>("")
    const [link, setLink] = useState<string | undefined>(undefined)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    async function addHighlight() {
        setIsLoading(true)
        const response = await actions.admin.addHighlight({
            image: image,
            caption: caption,
            link: link
        })

        if (response.data) {
            toast.success("Highlight added successfully")
        } else {
            toast.error("Failed to add highlight")
        }

        mutate("/api/highlights")
        setIsLoading(false)
    }


    return (
        <Dialog>
            <DialogTrigger asChild className="w-full">
                <Button>Add Highlight</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Highlight</DialogTitle>
                    <DialogDescription>Add a highlight to the table such as a picture with a short caption</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Label htmlFor="image">Image URL</Label>
                    {image ? <p className="text-sm text-green-500">Valid image URL</p> : <p className="text-sm text-red-500">Invalid image URL</p>}
                    <Input className={cn(image ? "border-green-500" : "border-red-500")} id="image" placeholder="Image URL" onChange={(e) => {
                        try {
                            const url = new URL(e.target.value);
                            if (url.protocol === 'https:') {
                                setImage(e.target.value);
                            }
                        } catch (err) {
                            // Invalid URL, don't set the state
                        }
                    }} />
                    <p className="text-sm text-gray-500">Please provide a URL to an image, either uploaded to a cloud storage service or a public URL</p>
                    <Label htmlFor="caption">Caption</Label>
                    <Input id="caption" placeholder="Caption" onChange={(e) => {
                        setCaption(e.target.value)
                    }} />
                    <p className="text-sm text-gray-500">Please provide a short caption for the image</p>
                    <Label htmlFor="link">Link</Label>
                    {link ? <p className="text-sm text-green-500">Valid link</p> : <p className="text-sm text-red-500">Invalid link</p>}
                    <Input className={cn(link ? "border-green-500" : "border-red-500")} id="link" placeholder="Link" onChange={(e) => {
                        try {
                            const url = new URL(e.target.value);
                            if (url.protocol === 'https:') {
                                setLink(e.target.value);
                            }
                        } catch (err) {
                            // Invalid URL, don't set the state
                        }
                    }} />
                    <p className="text-sm text-gray-500">Please provide a link that will redirect the user to main content</p>
                </div>
                <DialogFooter>
                    <Button onClick={addHighlight} disabled={isLoading}>{isLoading ? "Adding..." : "Add Highlight"}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}