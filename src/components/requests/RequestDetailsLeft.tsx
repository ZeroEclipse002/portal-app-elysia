import { Badge } from "@/components/ui/badge";
import useSWR, { useSWRConfig } from "swr";
import { Progress } from "../ui/progress";
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogTrigger, DialogDescription } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectItem } from "../ui/select";
import { SelectContent, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { useState } from "react";
import { Switch } from "../ui/switch";

const fetcher = (url: string) => fetch(url).then(res => {
    return res.json()
})

export const RequestDetailsLeft = ({ requestId, isAdmin }: { requestId: string, isAdmin: boolean }) => {

    const { data: request, isLoading, error } = useSWR(`/api/request/${requestId}`, fetcher)
    const { mutate } = useSWRConfig()
    const [status, setStatus] = useState<"submitted" | "reviewed" | "approved" | "rejected" | undefined>(request?.request.status)

    if (error) {
        return <div>Error loading request</div>
    }

    if (isLoading) {
        return (
            <div className="w-full lg:w-[40%] border rounded-xl shrink-0 animate-pulse">
                <div className="space-y-10">
                    {/* Header Section */}
                    <div className="px-6 py-4">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-40 bg-gray-200 rounded-md" />
                            <div className="h-6 w-20 bg-gray-200 rounded-full" />
                        </div>
                        <div className="mt-2 h-4 w-60 bg-gray-200 rounded" />
                    </div>

                    {/* Status Progress */}
                    <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                        <div className="px-8 py-6">
                            <div className="h-2 bg-gray-200 rounded" />
                            <div className="flex justify-between mt-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-4 w-16 bg-gray-200 rounded" />
                                ))}
                            </div>
                        </div>

                        {/* Request Details */}
                        <div className="border-t border-gray-200">
                            <div className="px-8 py-6">
                                <div className="h-4 w-24 bg-gray-200 rounded mb-4" />
                                <div className="h-6 w-32 bg-gray-200 rounded" />
                            </div>
                            <div className="px-8 py-6 border-t">
                                <div className="h-4 w-16 bg-gray-200 rounded mb-4" />
                                <div className="h-20 bg-gray-200 rounded" />
                            </div>
                            <div className="px-8 py-6 border-t">
                                <div className="h-4 w-20 bg-gray-200 rounded mb-4" />
                                <div className="h-64 bg-gray-200 rounded" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const message = formData.get("message") as string
        const type = formData.get("type") as string
        const status = formData.get("status") as string
        const hasChat = formData.get("hasChat") as string

        try {
            const res = actions.admin.addRequestUpdate({
                message,
                type: type as "urgent" | "normal",
                status: status as "submitted" | "reviewed" | "approved" | "rejected",
                requestId,
                closedChat: hasChat !== "on" ? true : false
            })

            toast.promise(res, {
                loading: "Adding update...",
                success: (data) => {

                    if (data.error) {
                        return data.error.message
                    }

                    mutate(`/api/request/${requestId}`)
                    mutate(`/api/requestlogs/${requestId}`)
                    return "Update added successfully"
                },
                error: "Failed to add update"
            })
        } catch (error) {
            console.error(error)
        }

    }

    return (
        <div className="w-full lg:w-[40%] border rounded-xl shrink-0">
            <div className="space-y-6 relative">
                {/* Header Section */}
                <div className="px-6 py-4 bg-white rounded-t-xl border-b">
                    <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Request Details
                        </h1>
                        <Badge
                            variant={request.request.status === "rejected"
                                ? "destructive"
                                : request.request.status === "submitted"
                                    ? "default"
                                    : "secondary"}
                            className="capitalize font-medium"
                        >
                            {request.request.status}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                            Reference ID: <span className="font-mono text-gray-700">{requestId}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            Request from: <span className="font-medium text-gray-700">{request.request.user.name}</span>
                        </p>
                    </div>
                </div>

                {/* Status Progress */}
                <div className="bg-white shadow-sm rounded-xl overflow-hidden mx-6">
                    {isAdmin && (
                        <Dialog>
                            <DialogTrigger disabled={request.request.status === 'approved' || request.request.status === 'rejected'} asChild>
                                <Button
                                    disabled={request.request.status === 'approved' || request.request.status === 'rejected'}
                                    variant="outline"
                                    className="p-2 absolute top-5 right-5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-slate-50 p-6 max-w-md">
                                <DialogHeader className="space-y-2">
                                    <DialogTitle className="text-xl font-semibold text-gray-900">Add Updates</DialogTitle>
                                    <DialogDescription className="text-sm text-gray-500">
                                        Add updates to the request
                                    </DialogDescription>
                                </DialogHeader>
                                <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
                                    <div className="space-y-2">
                                        <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            className="w-full bg-white border border-gray-100 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="hasChat" className="text-sm font-medium text-gray-700">Has Chat?</Label>
                                        <Switch 
                                            name="hasChat" 
                                            checked={status === 'approved' || status === 'rejected' ? false : undefined}
                                            disabled={status === 'approved' || status === 'rejected'} 
                                            className="mt-1" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="text-sm font-medium text-gray-700">Type</Label>
                                        <Select name="type">
                                            <SelectTrigger className="w-full bg-white border border-gray-100 rounded-lg">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                                <SelectItem value="normal">Normal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                                        <Select
                                            name="status"
                                            onValueChange={(value) => setStatus(value as "submitted" | "reviewed" | "approved" | "rejected")}
                                            defaultValue={request.request.status}
                                        >
                                            <SelectTrigger className="w-full bg-white border border-gray-100 rounded-lg">
                                                <SelectValue placeholder="Update Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="submitted">Submitted</SelectItem>
                                                <SelectItem value="reviewed">Reviewed</SelectItem>
                                                <SelectItem value="approved">Approved</SelectItem>
                                                <SelectItem value="rejected">Rejected</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {(status === 'approved' || status === 'rejected') && (
                                            <p className="text-sm text-gray-500 mt-2">
                                                When the status is approved or rejected, the request will be closed and no further updates can be added.
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-500 text-white hover:bg-blue-600 rounded-lg py-2 transition-colors"
                                    >
                                        Add Update
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                    <div className="px-6 py-4">
                        {request.request.status !== "rejected" && (
                            <>
                                <Progress
                                    value={(() => {
                                        const statuses = ["submitted", "reviewed", "approved"];
                                        const currentIndex = statuses.indexOf(request.request.status);
                                        return Math.round((currentIndex / (statuses.length - 1)) * 100);
                                    })()}
                                    className="h-2"
                                />
                                <div className="flex justify-between mt-3">
                                    {["submitted", "reviewed", "approved"].map((status) => (
                                        <div key={status} className="text-xs font-medium text-gray-500 capitalize">
                                            {status}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Request Details */}
                    <div className="border-t border-gray-100">
                        <dl className="divide-y divide-gray-100">
                            <div className="px-6 py-4">
                                <dt className="text-sm font-medium text-gray-500">
                                    Request Type
                                </dt>
                                <dd className="mt-1 text-sm font-medium text-gray-900 capitalize">
                                    {request.request.type}
                                </dd>
                            </div>
                            <div className="px-6 py-4">
                                <dt className="text-sm font-medium text-gray-500">
                                    Details
                                </dt>
                                <dd className="mt-1 text-sm text-gray-700 leading-relaxed">
                                    {request.request.details}
                                </dd>
                            </div>
                            <div className="px-6 py-4">
                                <dt className="text-sm font-medium text-gray-500 mb-2">
                                    ID Picture
                                </dt>
                                <dd className="mt-2">
                                    <img
                                        src={request.request.idPicture.url}
                                        alt="Request Picture"
                                        className="rounded-lg shadow-sm w-full object-cover max-h-[32rem]"
                                    />
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}