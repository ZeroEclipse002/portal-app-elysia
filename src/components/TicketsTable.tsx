import useSWR, { preload } from "swr"
import { actions } from "astro:actions"
import type { Ticket } from "@/db/schema"
import { Button } from "./ui/button"
import { navigate } from "astro:transitions/client"

const fetcher = (url: string) => fetch(url).then(res => res.json())

preload("/api/requests", fetcher)

export const TicketsTable = () => {
    const { data, isLoading } = useSWR<Ticket[]>('/api/requests', fetcher)

    return isLoading ? <div>Loading...</div> : (
        <>
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Active Requests</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >Request ID</th
                                >
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >Type</th
                                >
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >Status</th
                                >
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >Date</th
                                >
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >Action</th
                                >
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data
                                ?.filter(request => ['submitted', 'reviewed'].includes(request.status))
                                .map(request => (
                                    <tr key={request.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">#{request.id.slice(0, 8)}...</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{request.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                                                request.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <a href={`/tickets/${request.id}`} className="text-blue-500 hover:underline">View</a>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request History Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Request History</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >Request ID</th
                                >
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >Type</th
                                >
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >Status</th
                                >
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >Date</th
                                >
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                >Action</th
                                >
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data
                                ?.filter(request => ['approved', 'rejected'].includes(request.status))
                                .map(request => (
                                    <tr key={request.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">#{request.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{request.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <a href={`/tickets/${request.id}`} className="text-blue-500 hover:underline">View</a>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}