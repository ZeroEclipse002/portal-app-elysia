import { fetchClient, fetcher } from "@/lib/utils";
import { useState } from "react";
import useSWR from "swr"
import { PaginatorComp } from "./PaginatorComp";


export const AnnouncementFeed = () => {
    const [page, setPage] = useState(1);
    const { data, error, isLoading, isValidating } = useSWR('/api/feed/announcements?page=' + page, fetcher)

    if (isLoading) {
        return (
            <div className="flex-1 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex-1 p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-600 text-sm font-medium">Error: {error.message}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full bg-slate-50 p-6 min-h-screen">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.data?.map((announcement: any) => (
                        <a href={`/post/${announcement.id}`} key={announcement.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md hover:border-blue-100">
                            <div className="aspect-video relative overflow-hidden">
                                <img
                                    src={announcement.image}
                                    alt={announcement.title}
                                    className="w-full h-full object-cover transition-transform hover:scale-105"
                                />
                            </div>
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">{announcement.title}</h2>
                                <p className="text-gray-600 leading-relaxed text-sm">{announcement.shortDescription}</p>
                                <time dateTime={announcement.createdAt} className="text-sm text-gray-500 mt-4 block">
                                    {new Date(announcement.createdAt).toLocaleDateString()}
                                </time>
                            </div>
                        </a>
                    ))}
                </div>
                {isValidating && (
                    <div className="flex justify-center mt-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            <span>Refreshing...</span>
                        </div>
                    </div>
                )}
            </div>
            <PaginatorComp page={page} setPage={setPage} totalPages={data.totalPages ?? 0} />
        </div>
    )
}