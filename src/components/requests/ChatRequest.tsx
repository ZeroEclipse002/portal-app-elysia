import type { ChatType } from "@/db/schema"
import useSWR from "swr"
import { Input } from "../ui/input"
import { actions } from "astro:actions"
import { toast } from "sonner"
import { useTransition } from "react"
import { fetcher } from "@/lib/utils"



export const ChatRequest = ({ requestUpdateId, userId, isAdmin }: { requestUpdateId: string, userId: string, isAdmin: boolean }) => {

    const { data: chats, isLoading, error, mutate } = useSWR(`/api/chatrequests/${requestUpdateId}`, fetcher, { refreshInterval: 1000 })
    const [pending, startTransition] = useTransition()

    if (isLoading) {
        return (
            <div className="flex-1 border rounded-xl p-6">
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return <div>Error loading chats</div>
    }

    async function submitChat(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)

        const message = formData.get('message')
        const requestId = formData.get('requestUpdateId')

        if (!message) {
            return
        }

        try {
            const { data, error } = await actions.sendMessage(formData)

            if (error) {
                toast.error(error.message)
                return
            }

            if (data) {
                toast.success(data.message)
                mutate()
            }

        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="w-full h-fit bg-slate-50 rounded-xl p-6">
            <div className="flex flex-col gap-4">
                <div className="space-y-4 max-h-[400px] overflow-y-auto px-2">
                    {chats.chat.chatrecord.length > 0 ? chats.chat.chatrecord.map((chat: ChatType, index: number) => (
                        <div key={index + requestUpdateId} className={`flex ${chat.userId === userId ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex flex-col gap-1 max-w-[80%] ${chat.userId === userId ? 'items-end' : 'items-start'}`}>
                                <div className="flex items-center gap-2 px-2">
                                    <span className="text-xs font-medium text-gray-500">
                                        {(isAdmin && chat.userId === userId) ? "You" : "Admin"}
                                    </span>
                                    <time className="text-xs text-gray-400">
                                        {new Date(chat.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </time>
                                </div>
                                <div className={`px-4 py-2 rounded-2xl ${chat.userId === userId
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white border border-gray-100'
                                    }`}>
                                    <p className="text-sm">
                                        {chat.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No messages yet
                        </div>
                    )}
                </div>

                {!chats.chat.updateClose ? (<form onSubmit={(e) => startTransition(async () => submitChat(e))} className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
                    <Input
                        name="message"
                        placeholder="Type a message..."
                        className="border-0 focus:ring-0 bg-transparent flex-1 text-sm placeholder:text-gray-400"
                    />
                    <input type="hidden" name="requestUpdateId" value={requestUpdateId} />
                    <button
                        type="submit"
                        disabled={pending}
                        className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                        {!pending ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                            </svg>
                        ) : (
                            <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-gray-900"></div>
                        )}
                    </button>
                </form>) : (
                    <div className="border-0 focus:ring-0 bg-transparent flex-1 text-sm placeholder:text-gray-400 min-h-[48px]">
                        <p className="text-gray-500 text-sm">
                            This request has been closed.
                        </p>
                    </div>
                )}

            </div>
        </div>
    )
}