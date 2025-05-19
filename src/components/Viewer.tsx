import { BlockNoteView } from "@blocknote/mantine"
import { useCreateBlockNote } from "@blocknote/react"
import useSWR from "swr"
import type { Block } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { fetcher } from "@/lib/utils";

export const MainViewer = ({ postId }: { postId: string }) => {
    const { data, error, isLoading } = useSWR(`/api/feed/post/${postId}`, fetcher)

    if (isLoading) return <SkeletonPlaceholder />
    if (error) return <ErrorState />

    return <ViewerComponent content={data.content} />
}

const ViewerComponent = ({ content }: { content: Block[] }) => {

    const viewer = useCreateBlockNote({
        initialContent: content
    })

    return (
        <div className="transition-all duration-200 container mx-auto max-w-full min-h-[50vh] min-w-[50vw] px-2 sm:px-4 md:px-6">
            <BlockNoteView
                theme="light"
                editable={false}
                editor={viewer}
                className="min-h-[50vh] w-full p-2 sm:p-4 border-x border-gray-200 border-dashed"
            />
        </div>
    )
}

const SkeletonPlaceholder = () => {
    return (
        <div className="space-y-2 sm:space-y-4 px-2 sm:px-4">
            <div className="w-full h-6 sm:h-8 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-3/4 h-6 sm:h-8 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-full h-24 sm:h-32 bg-gray-200 animate-pulse rounded"></div>
            <div className="w-5/6 h-6 sm:h-8 bg-gray-200 animate-pulse rounded"></div>
        </div>
    )
}

const ErrorState = () => {
    return (
        <div className="text-center py-8 sm:py-12 px-4">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-3 sm:mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
            <p className="text-lg sm:text-xl text-gray-500">
                Unable to load content. Please try again later.
            </p>
        </div>
    )
}