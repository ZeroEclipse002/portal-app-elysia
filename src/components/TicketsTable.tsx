import useSWR, { preload } from "swr"
import { actions } from "astro:actions"
import type { Ticket } from "@/db/schema"
import { Button } from "./ui/button"
import { navigate } from "astro:transitions/client"
import { cn } from "@/lib/utils"

const fetcher = (url: string) => fetch(url).then(res => res.json())

preload("/api/requests", fetcher)

export const TicketsTable = () => {
    const { data, isLoading } = useSWR<Ticket[]>('/api/requests', fetcher)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Active Requests */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Active Requests</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage your ongoing requests</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Request ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data?.filter(request => ['submitted', 'reviewed'].includes(request.status))
                                .map(request => (
                                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-gray-700">#{request.id.slice(0, 8)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-700 capitalize">{request.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                request.status === 'submitted' && "bg-yellow-50 text-yellow-700",
                                                request.status === 'reviewed' && "bg-blue-50 text-blue-700"
                                            )}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">
                                                {new Date(request.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={`/tickets/${request.id}`}
                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                View details
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Request History</h2>
                    <p className="text-sm text-gray-500 mt-1">View your past requests</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Request ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data?.filter(request => ['approved', 'rejected'].includes(request.status))
                                .map(request => (
                                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-gray-700">#{request.id.slice(0, 8)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-700 capitalize">{request.type}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                                request.status === 'approved' && "bg-green-50 text-green-700",
                                                request.status === 'rejected' && "bg-red-50 text-red-700"
                                            )}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">
                                                {new Date(request.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <a
                                                href={`/tickets/${request.id}`}
                                                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                View details
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}