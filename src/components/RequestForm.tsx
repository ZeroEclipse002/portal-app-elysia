import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogDescription } from "./ui/dialog"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "./ui/select"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { cn, fetcher } from "@/lib/utils"
import { Textarea } from "./ui/textarea"
import { actions, isInputError } from "astro:actions"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import useSWR, { useSWRConfig } from "swr"
import type { FamilyData } from "@/db/schema"



export const RequestForm = () => {
    const { mutate } = useSWRConfig()
    const { data: familyMembers, isLoading: isFamilyMembersLoading } = useSWR<FamilyData[]>('/api/request-family', fetcher)
    const [requestType, setRequestType] = useState<string>('')
    const [otherRequestType, setOtherRequestType] = useState<string>('')
    const [requestDetails, setRequestDetails] = useState<string>('')
    const [businessName, setBusinessName] = useState<string>('')
    const [businessAddress, setBusinessAddress] = useState<string>('')
    const [familyMemberId, setFamilyMemberId] = useState<string>('')
    const [idPicture, setIdPicture] = useState<File | null>(null)
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [purpose, setPurpose] = useState<string>('')
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Add form submission logic here
        console.log(requestType, otherRequestType, requestDetails, idPicture)

        const formData = new FormData()
        formData.append('requestType', requestType)
        formData.append('otherRequestType', otherRequestType)

        // For business requests, combine business name and address into a single string
        const finalRequestDetails = purpose === 'business'
            ? `Business Name: ${businessName}\nBusiness Address: ${businessAddress}`
            : requestDetails

        formData.append('requestDetails', finalRequestDetails)
        formData.append('idPicture', idPicture as File)
        formData.append('familyMemberId', familyMemberId || 'selfdoc')
        formData.append('purpose', purpose || '')

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
                setBusinessName('')
                setBusinessAddress('')
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
                <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm">
                    Submit New Request
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl max-w-full w-full p-2 sm:p-6 max-sm:scale-[0.92] max-sm:!max-w-[98vw] max-sm:!w-[98vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">Submit New Request</DialogTitle>
                    <DialogDescription className="text-gray-500 text-sm">
                        Please fill out the form below to submit a new request.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 max-sm:space-y-4 overflow-visible">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <div className={cn("space-y-2", requestType === 'other' && "bg-gray-50 p-4 rounded-lg border border-gray-100")}>
                        <Label className="text-sm font-medium text-gray-700">Request Type</Label>
                        <Select onValueChange={(value) => setRequestType(value)}>
                            <SelectTrigger className="bg-white border-gray-200">
                                <SelectValue placeholder="Select Request Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="document">Document Request</SelectItem>
                                {/* <SelectItem value="permit">Permit Application</SelectItem> */}
                                <SelectItem value="blotter">Blotter Report</SelectItem>
                                <SelectItem value="other">Other Inquiry</SelectItem>
                            </SelectContent>
                        </Select>
                        {requestType === 'other' && (
                            <div className="pt-2">
                                <Label className="text-sm font-medium text-gray-700">Specify Request Type</Label>
                                <Input
                                    value={otherRequestType || ''}
                                    onChange={(e) => setOtherRequestType(e.target.value)}
                                    placeholder="Please specify..."
                                    className="mt-1 bg-white border-gray-200"
                                />
                            </div>
                        )}
                        {requestType === 'document' && (
                            <div className="pt-2">
                                {isFamilyMembersLoading ? (
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Select Family Member</Label>
                                            <Select required defaultValue="selfdoc" value={familyMemberId} onValueChange={(value) => setFamilyMemberId(value)}>
                                                <SelectTrigger className="bg-white border-gray-200">
                                                    <SelectValue placeholder="Select Family Member" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem defaultChecked value="selfdoc">Self Document</SelectItem>
                                                    {familyMembers?.map((member) => (
                                                        <SelectItem key={member.id} value={member.id.toString()}>
                                                            {member.fullName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-gray-500">
                                                If you are requesting for a document for yourself, select "Self Document".
                                                If you are requesting for a document for a family member, select the family member from the list.
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700">Purpose</Label>
                                            <Select value={purpose} onValueChange={(value) => setPurpose(value)}>
                                                <SelectTrigger className="bg-white border-gray-200">
                                                    <SelectValue placeholder="Select Purpose" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="clearance">Clearance</SelectItem>
                                                    <SelectItem value="indigency">Indigency</SelectItem>
                                                    <SelectItem value="certificate">Certificate</SelectItem>
                                                    <SelectItem value="business">Business Request</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">{requestType === 'blotter' ? "Proof Details" : purpose === 'business' ? "Business Details" : "Request Details"}</Label>
                        {purpose === 'business' ? (
                            <div className="border border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
                                <Label className="text-sm font-medium text-gray-700">Business Name</Label>
                                <Input
                                    value={businessName || ''}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    className="bg-white border-gray-200 mb-4"
                                    placeholder="Enter business name..."
                                />
                                <Label className="text-sm font-medium text-gray-700">Business Address</Label>
                                <Input
                                    value={businessAddress || ''}
                                    onChange={(e) => setBusinessAddress(e.target.value)}
                                    className="bg-white border-gray-200"
                                    placeholder="Enter business address..."
                                />
                            </div>
                        ) : (<Textarea
                            value={requestDetails || ''}
                            onChange={(e) => setRequestDetails(e.target.value)}
                            className="min-h-[120px] bg-white border-gray-200 resize-none"
                            placeholder="Please provide additional details..."
                        />)}
                        <p className="text-xs text-gray-500">
                            Provide as much detail as possible to help us process your request efficiently.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">{requestType === 'blotter' ? "Photo of Proof" : "ID Picture"}</Label>
                            <Input
                                type="file"
                                className="bg-white border-gray-200"
                                onChange={handleFileChange}
                            />
                            <p className="text-xs text-gray-500">
                                {requestType === 'blotter' ? "Upload a clear photo of the proof of your request." : "Upload a clear picture of your valid ID."}
                            </p>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 overflow-hidden">
                            <div className="p-1">
                                {idPicture ? (
                                    <img
                                        src={URL.createObjectURL(idPicture)}
                                        alt="ID Preview"
                                        className="w-full h-48 object-contain rounded"
                                    />
                                ) : (
                                    <div className="h-48 flex items-center justify-center text-gray-400">
                                        <p className="text-sm">No image selected</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Submitting...</span>
                            </div>
                        ) : (
                            "Submit Request"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}