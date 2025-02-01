import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogDescription } from "./ui/dialog"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { cn } from "@/lib/utils"
import { Textarea } from "./ui/textarea"
import { actions, isInputError } from "astro:actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import useSWR, { useSWRConfig } from "swr"



export const RequestForm = () => {
    const { mutate } = useSWRConfig()
    const [requestType, setRequestType] = useState<string>('')
    const [otherRequestType, setOtherRequestType] = useState<string>('')
    const [requestDetails, setRequestDetails] = useState<string>('')
    const [idPicture, setIdPicture] = useState<File | null>(null)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Add form submission logic here
        console.log(requestType, otherRequestType, requestDetails, idPicture)

        const formData = new FormData()
        formData.append('requestType', requestType)
        formData.append('otherRequestType', otherRequestType)
        formData.append('requestDetails', requestDetails)
        formData.append('idPicture', idPicture as File)

        try {
            setLoading(true)
            const { data, error } = await actions.createRequest(formData)

            if (isInputError(error)) {
                if (error.fields) {
                    // Get all error messages from all fields
                    const messages = Object.entries(error.fields)
                        .map(([field, errors]) => errors?.[0])
                        .filter(Boolean)
                        .join(', ');
                    const message = messages || "Failed to submit request. Please try again.";
                    setError(message);
                    toast.error(message);
                    return
                } else {
                    setError("Failed to submit request. Please try again.");
                    toast.error(error.message);
                    return
                }
            } else {
                toast.success('Request submitted successfully!')
                setOpen(false)
                setRequestType('')
                setOtherRequestType('')
                setRequestDetails('')
                setIdPicture(null)
                mutate('/api/requests')
            }

        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIdPicture(e.target.files[0])
        }
    }

    // Cleanup URL object on unmount
    useEffect(() => {
        return () => {
            if (idPicture) {
                URL.revokeObjectURL(URL.createObjectURL(idPicture))
            }
        }
    }, [idPicture])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    Submit New Request
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Submit New Request</DialogTitle>
                    <DialogDescription>Please fill out the form below to submit a new request.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-center text-xs border border-red-500 p-2 rounded-md">{error}</p>}
                    <div className={cn("flex flex-col gap-2", requestType === 'other' && "bg-slate-50 p-4 rounded-md")}>
                        <Label className="block text-sm font-medium mb-1">Request Type</Label>
                        <Select onValueChange={(value) => setRequestType(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Request Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="document">Document Request</SelectItem>
                                <SelectItem value="permit">Permit Application</SelectItem>
                                <SelectItem value="blotter">Blotter Report</SelectItem>
                                <SelectItem value="other">Other Inquiry</SelectItem>
                            </SelectContent>
                        </Select>
                        {requestType === 'other' && (
                            <div>
                                <Label className="block text-sm font-medium mb-1">Other Request Type</Label>
                                <Input
                                    value={otherRequestType || ''}
                                    onChange={(e) => setOtherRequestType(e.target.value)}
                                    placeholder="Please specify the type of request..."
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <Label className="block text-sm font-medium mb-2">Request Details</Label>
                        <Textarea
                            value={requestDetails || ''}
                            onChange={(e) => setRequestDetails(e.target.value)}
                            className="w-full p-2 border rounded-md h-24"
                            placeholder="Please provide additional details about your request..."
                        />
                        <p className="text-xs my-2 text-gray-500">Please provide as much detail as possible to help us process your request.</p>
                    </div>
                    <div>
                        <Label className="block text-sm font-medium mb-2">ID Picture</Label>
                        <Input
                            type="file"
                            // accept="image/*"
                            className="w-full border rounded-md"
                            placeholder="Please provide additional details about your request..."
                            onChange={handleFileChange}
                        />
                        <p className="text-xs my-2 text-gray-500">Please upload a clear picture of your ID.</p>
                    </div>
                    <div>
                        <Label className="block text-sm font-medium mb-2">Preview</Label>
                        <div className="w-full h-48 border rounded-md flex items-center justify-center bg-slate-50">
                            {idPicture ? (
                                <img
                                    src={URL.createObjectURL(idPicture)}
                                    alt="ID Preview"
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <p className="text-gray-400">No image selected</p>
                            )}
                        </div>
                    </div>
                    <Button type="submit" disabled={loading}>
                        Submit Request {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}