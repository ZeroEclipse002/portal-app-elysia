import { saveStatus, wordCount, postContent } from "@/stores/editor";
import { useStore } from "@nanostores/react";
import { Badge } from "./ui/badge";
import type { Post, PostContent } from "@/db/schema";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { actions } from "astro:actions";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import type { Block } from "@blocknote/core";
import { toast } from "sonner";

export const EditorBar = ({ post, postCont }: { post: Post, postCont: PostContent | null }) => {
    const count = useStore(wordCount);
    const status = useStore(saveStatus);
    const content = useStore(postContent);
    const [preview, setPreview] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const contentChanged = JSON.stringify(content) !== JSON.stringify(postCont?.content);
        setHasChanges(contentChanged);
    }, [content, postCont?.content]);

    const savePost = async () => {
        try {
            console.log(content)

            toast.promise(actions.admin.editPostContent({
                postId: post.id,
                content: content
            }), {
                loading: "Saving...",
                success: () => {
                    setHasChanges(false)
                    return "Saved!"
                },
                error: "Failed to save"
            })

        } catch (error) {
            console.error(error)
        }
    }

    return (
        <>
            <div className="flex items-center gap-4 p-4 border-b">
                <Badge variant="outline">
                    Words: {count}
                </Badge>
                <Badge
                    className={cn(
                        !status ? "bg-blue-200" :
                            hasChanges ? "bg-yellow-300" :
                                "bg-green-200"
                    )}
                    variant="outline"
                >
                    {!status ? 'Editing...' :
                        hasChanges ? 'Pending Changes' :
                            'Saved'}
                </Badge>
                <Button
                    disabled={!status || !hasChanges}
                    onClick={() => savePost()}
                >
                    Save
                </Button>
                <div className="border border-dashed rounded-md p-2">
                    <div className="flex gap-2 items-center">
                        <h1 className="text-xl opacity-50 font-bold tracking-tight leading-none">{post.title}</h1>
                        <Badge variant="secondary">
                            {post.type}
                        </Badge>
                        <Badge variant={post.public ? "default" : "destructive"}>
                            {post.public ? "Public" : "Private"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            Created {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>
            <div className={cn("min-w-full min-h-[80vh] fixed bottom-0 left-0 z-50 transition-all ease-in-out duration-700", preview ? " translate-y-full" : "translate-y-0")}>
                <div className="flex min-w-full min-h-[90vh] border-2 border-b-0 border-l-0 border-r-0 border-dashed rounded-b-none border-black relative bg-white">
                    <button className="absolute flex items-center gap-2 hover:bg-slate-200 text-md min-w-32 -top-10 left-10 group border-2 border-black border-b-0 rounded-t-lg px-3 py-2 bg-white" onClick={() => {
                        setPreview(!preview)
                    }}>
                        Preview
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={cn("size-6 group-hover:-translate-y-1 transition-all duration-300", !preview ? "rotate-180" : "")}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 18.75 7.5-7.5 7.5 7.5" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 7.5-7.5 7.5 7.5" />
                        </svg>
                    </button>
                    {!preview ? (
                        <div className="w-full h-[70vh] flex flex-col relative bg-gradient-to-b from-white via-white to-transparent">
                            <div className="flex-1 p-8">
                                <div className="w-full max-h-[70vh] overflow-y-auto max-w-5xl mx-auto border-2 border-dashed rounded-xl border-black/30 shadow-lg backdrop-blur-sm">
                                    <PreviewMount open={preview} document={content as Block[]} />
                                </div>
                            </div>
                            <div className="px-8 py-4 bg-white/50 backdrop-blur-sm border-t border-black/10">
                                <div className="max-w-5xl mx-auto space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Badge variant="outline" className="px-3 py-1">Title: {post.title}</Badge>
                                        <Badge variant="outline" className="px-3 py-1">Type: {post.type}</Badge>
                                        <Badge variant="outline" className="px-3 py-1">Status: {post.public ? 'Public' : 'Private'}</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Badge variant="outline" className="px-3 py-1">Words: {count}</Badge>
                                        <Badge variant="outline" className="px-3 py-1">Created: {new Date(post.createdAt).toLocaleDateString()}</Badge>
                                        <Badge variant="outline" className="px-3 py-1">Last saved: {status ? 'Just now' : 'Saving...'}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="min-w-full min-h-[90vh] bg-slate-200"></div>
                    )}
                </div>
            </div>
        </>
    );
};



const PreviewMount = ({ open, document }: { open: boolean, document: Block[] }) => {

    const viewer = useCreateBlockNote({
        initialContent: document
    })

    return (
        <div className="w-full">
            <BlockNoteView theme="light" editable={false} editor={viewer} />
        </div>
    )
}

