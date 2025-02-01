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

const fetcher = (url: string) => fetch(url).then(res => {
    return res.json()
})

export const RequestDetailsLeft = ({ requestId }: { requestId: string }) => {

    const { data: request, isLoading, error } = useSWR(`/api/request/${requestId}`, fetcher)
    const { mutate } = useSWRConfig()
    const [status, setStatus] = useState<"submitted" | "reviewed" | "approved" | "rejected" | undefined>(request?.request.status)

    if (error) {
        return <div>Error loading request</div>
    }

    if (isLoading) {
        return (
            <div className="w-[40%] border rounded-xl shrink-0 animate-pulse">
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

        try {
            const res = actions.admin.addRequestUpdate({
                message,
                type: type as "urgent" | "normal",
                status: status as "submitted" | "reviewed" | "approved" | "rejected",
                requestId
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
        <div className="w-[40%] border rounded-xl shrink-0">
            <div className="space-y-10 relative">
                {/* Header Section */}
                <div className="px-6 py-4">

                    <div className="flex items-center gap-4">
                        <h1
                            className="text-2xl font-bold text-gray-900 tracking-tight"
                        >
                            Request Details
                        </h1>
                        <Badge
                            variant={request.request.status === "rejected"
                                ? "destructive"
                                : request.request.status === "submitted"
                                    ? "default"
                                    : "secondary"}
                            className="capitalize"
                        >
                            {request.request.status}
                        </Badge>
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                        Reference ID: <span className="font-mono"
                        >{requestId}</span
                        >
                    </p>
                </div>

                {/* Status Progress */}
                <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                    <Dialog>
                        <DialogTrigger disabled={request.request.status === 'approved' || request.request.status === 'rejected'} asChild className="absolute top-5 right-5">
                            <Button disabled={request.request.status === 'approved' || request.request.status === 'rejected'} variant="outline">
                                <PlusIcon className="w-4 h-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Updates</DialogTitle>
                                <DialogDescription>
                                    Add updates to the request
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="message">Message</Label>
                                        <Textarea id="message" name="message" />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="type">Type</Label>
                                        <Select name="type">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="urgent">Urgent</SelectItem>
                                                <SelectItem value="normal">Normal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="type">Status</Label>
                                        <Select name="status" onValueChange={(value) => setStatus(value as "submitted" | "reviewed" | "approved" | "rejected")} defaultValue={request.request.status}>
                                            <SelectTrigger>
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
                                            <p className="text-sm text-gray-500">
                                                When the status is approved or rejected, the request will be closed and no further updates can be added.
                                            </p>
                                        )}
                                    </div>
                                    <Button type="submit">Add Update</Button>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <div className="px-8 py-6">
                        {
                            (() => {
                                const statuses = [
                                    "submitted",
                                    "reviewed",
                                    "approved",
                                ];
                                const currentIndex = statuses.indexOf(
                                    request.request.status,
                                );
                                const progress =
                                    request.request.status === "rejected"
                                        ? 0
                                        : Math.round(
                                            (currentIndex /
                                                (statuses.length - 1)) *
                                            100,
                                        );

                                return (
                                    request.request.status !== "rejected" && (
                                        <Progress value={progress} />
                                    )
                                );
                            })()
                        }
                        <div className="flex justify-between mt-4">
                            {request.request.status !== 'rejected' && (
                                ["submitted", "reviewed", "approved"].map(
                                    (status, index) => (
                                        <div key={index} className="text-sm font-medium text-gray-700 capitalize">
                                            {status}
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                    </div>

                    {/* Request Details */}
                    <div className="border-t border-gray-200">
                        <dl className="divide-y divide-gray-100">
                            <div className="px-8 py-6">
                                <dt className="text-sm font-semibold text-gray-900">
                                    Request Type
                                </dt>
                                <dd
                                    className="mt-2 text-base text-gray-700 capitalize"
                                >
                                    {request.request.type}
                                </dd>
                            </div>
                            <div className="px-8 py-6">
                                <dt className="text-sm font-semibold text-gray-900">
                                    Details
                                </dt>
                                <dd className="mt-2 text-base text-gray-700">
                                    {request.request.details}
                                </dd>
                            </div>
                            <div className="px-8 py-6">
                                <dt className="text-sm font-semibold text-gray-900">
                                    ID Picture
                                </dt>
                                <dd className="mt-3">
                                    <img
                                        src={request.request.idPicture.url}
                                        alt="Request Picture"
                                        className="rounded-lg shadow-md max-h-[32rem] w-full object-cover"
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