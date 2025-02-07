import type { TicketUpdate } from "@/db/schema"
import { cn } from "@/lib/utils"
import useSWR from "swr"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { ChatRequest } from "./ChatRequest"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Check } from "lucide-react"
import { useTransition } from "react"
import { actions } from "astro:actions"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export const RequestDetailsRight = ({ requestId, userId, isAdmin }: { requestId: string, userId: string, isAdmin: boolean }) => {

    const { data: requestLogs, isLoading: isLoadingRequestLogs, error: errorRequestLogs, mutate } = useSWR(`/api/requestlogs/${requestId}`, fetcher)
    const { data: request, isLoading: isLoadingRequest, error: errorRequest } = useSWR(`/api/request/${requestId}`, fetcher)
    const [pending, startTransition] = useTransition()

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

    function handleCloseChat(e: string) {

        if (!e) {
            toast.error('Please select a request log')
        }

        startTransition(async () => {
            try {
                const response = await actions.admin.closeChat({
                    requestLogId: e,
                })

                if (response.data) {
                    toast.success('Chat closed')
                } else {
                    toast.error('Error closing chat')
                }

            } catch (error) {
                toast.error('Error closing chat')
                console.error(error)
            } finally {
                mutate()
                return
            }
        })
    }

    return (
        <div className="flex-1 border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Request Timelines
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
            <div className="relative bg-slate-50 rounded-xl p-4 overflow-y-auto border-2 border-dashed max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {
                    requestLogs.requestLogs.map((log: TicketUpdate, index: number) => (
                        <div key={log.id} className="mb-8 flex gap-4 relative">
                            {/* Timeline connector */}
                            {isAdmin && !log.updateClose && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="absolute top-5 right-5">
                                            Mark as Resolved
                                            <Check className="h-4 w-4 ml-2" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Are you sure you want to mark this as resolved?
                                            </DialogTitle>
                                            <DialogDescription>
                                                This will close the chat and mark the request log as resolved.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <DialogFooter>
                                            <Button disabled={pending} variant="destructive" onClick={() => handleCloseChat(log.id)}>
                                                Yes, I Understand 👍
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                            <div className="relative flex-shrink-0">
                                <div
                                    className={cn(
                                        "h-3 w-3 rounded-full bg-primary mt-2.5 ring-4 ring-white relative",
                                        request.request.status === "rejected" && "bg-red-500",
                                        request.request.status === "approved" && "bg-green-500",
                                    )}
                                >
                                    {(index === 0 && (request.request.status !== "approved" && request.request.status !== "rejected")) && (
                                        <div className="absolute h-3 w-3 inset-0 rounded-full bg-blue-400 animate-ping" />
                                    )}
                                </div>
                                {index !== requestLogs.requestLogs.length - 1 && (
                                    <div className="absolute top-8 left-1/2 -translate-x-1/2 h-full w-0.5 bg-gray-100" />
                                )}
                            </div>

                            {/* Update content */}
                            <div
                                className={cn(
                                    "flex-1 bg-white rounded-xl shadow-sm border-transparent p-4 min-w-0 transition-all",
                                    "hover:shadow-md hover:border-gray-100",
                                    index === 0 && request.request.status === "approved" && "ring-1 ring-green-500 shadow-green-50",
                                    request.request.status === "rejected" && "ring-1 ring-red-500 shadow-red-50"
                                )}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                Request Update
                                            </h3>
                                            {log.type === "urgent" && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                                    Urgent
                                                </span>
                                            )}
                                        </div>
                                        <time className="text-xs text-gray-500 mt-0.5">
                                            {new Date(log.createdAt).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </time>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                    {log.message}
                                </p>
                                <Accordion type="single" collapsible className="mt-4">
                                    <AccordionItem value="item-1" className="border-none">
                                        <AccordionTrigger className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-all">
                                            <div className="flex items-center gap-2 flex-1">
                                                {!log.updateClose ? (
                                                    <>
                                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                        <span className="text-sm font-medium text-blue-600">
                                                            Open conversation
                                                        </span>
                                                        <span className="text-xs text-gray-400 ml-2">
                                                            Click to respond
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                                                        <span className="text-sm font-medium text-gray-500">
                                                            Conversation closed
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-4">
                                            <ChatRequest requestUpdateId={log.id} userId={userId} />
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}