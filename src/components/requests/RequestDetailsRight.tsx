import type { TicketUpdate } from "@/db/schema"
import { cn } from "@/lib/utils"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export const RequestDetailsRight = ({ requestId }: { requestId: string }) => {

    const { data: requestLogs, isLoading: isLoadingRequestLogs, error: errorRequestLogs } = useSWR(`/api/requestlogs/${requestId}`, fetcher)
    const { data: request, isLoading: isLoadingRequest, error: errorRequest } = useSWR(`/api/request/${requestId}`, fetcher)

    if (isLoadingRequestLogs || isLoadingRequest) {
        return (
            <div className="flex-1 border rounded-xl p-6">
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        )
    }

    if (errorRequestLogs || errorRequest) {
        return <div>Error loading request</div>
    }

    return (
        <div className="flex-1 border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Request Timeline
            </h2>
            {request.request.status === "approved" && (
                <div className="bg-green-500 text-white p-4 rounded-xl mb-8">
                    <p className="text-lg font-bold">
                        Request Approved
                    </p>
                    <p className="text-sm">
                        Please proceed to our barangay to complete the request.
                    </p>
                </div>
            )}
            <div className="relative bg-slate-50 rounded-xl p-4 overflow-y-auto">
                {
                    requestLogs.requestLogs.map((log: TicketUpdate, index: number) => (
                        <div className="mb-8 flex gap-4">
                            {/* Timeline connector */}
                            <div className="relative flex-shrink-0">
                                <div
                                    className={cn(
                                        "h-4 w-4 rounded-full bg-primary mt-1.5",
                                        request.request.status === "rejected" &&
                                        "bg-red-500",
                                        request.request.status === "approved" &&
                                        "bg-green-500",
                                    )}
                                />
                                {index !== requestLogs.requestLogs.length - 1 && (
                                    <div className="absolute top-8 left-1/2 -translate-x-1/2 h-full w-0.5 bg-gray-200" />
                                )}
                            </div>

                            {/* Update content */}
                            <div
                                className={cn(
                                    "flex-1 bg-white rounded-lg border p-4 min-w-0",
                                    index === 0 &&
                                    request.request.status === "approved" &&
                                    "border-green-500 border-2",
                                    request.request.status === "rejected" &&
                                    "border-red-500 border-2",
                                )}
                            >
                                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                    <p className="font-semibold text-gray-900">
                                        Request Update
                                    </p>
                                    {log.type === "urgent" && (
                                        <p className="text-red-700 text-xs bg-red-100 px-2 py-1 rounded-full font-medium">
                                            Urgent Update
                                        </p>
                                    )}
                                    <time className="text-sm text-gray-500">
                                        {new Date(
                                            log.createdAt,
                                        ).toLocaleDateString()}
                                    </time>
                                </div>
                                <p className="text-gray-700">{log.message}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}