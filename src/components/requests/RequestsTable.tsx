import type { Ticket } from "@/db/schema";
import { fetcher } from "@/lib/utils";
import { useState } from "react";
import useSWR from "swr";
import { Skeleton } from "../ui/skeleton";



const RequestsTableNest = ({ requests, isLoading }: { requests: Ticket[], isLoading: boolean }) => {

    if (isLoading) return (
        <div className="flex justify-center items-center h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    )

    return requests && (
        <div>
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
                            {requests
                                ?.filter((request: any) => ['submitted', 'reviewed'].includes(request.status))
                                .map((request: any) => (
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
                            {requests
                                ?.filter((request: any) => ['approved', 'rejected'].includes(request.status))
                                .map((request: any) => (
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
                    {/* <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div>
                                    {parseInt(page) > 1 && (
                                        <a
                                            href={`/tickets?page=${parseInt(page) - 1}`}
                                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </a>
                                    )}
                                </div>
                            </div> */}
                    {/* <div>
                                {requests?.length === 10 && (
                                    <a
                                        href={`/tickets?page=${parseInt(page) + 1}`}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Next
                                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                )}
                            </div> */}
                </div>
            </div>
        </div>
    )
}


export const RequestsTable = () => {

    const [page, setPage] = useState<number>(1)
    const { data: requests, isLoading } = useSWR(`/api/adminrequests?page=${page}`, fetcher)


    return (
        <>
            <RequestsTableNest requests={requests} isLoading={isLoading} />
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div>
                    {page > 1 && (
                        <button
                            onClick={() => setPage(page - 1)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>
                    )}
                </div>
                <div>
                    {requests?.length === 10 && (
                        <button
                            onClick={() => setPage(page + 1)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Next
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </>
    )

}