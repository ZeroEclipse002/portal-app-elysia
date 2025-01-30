import { useState } from "react";
import { Button } from "./ui/button";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { type Post } from "@/db/schema";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { actions } from "astro:actions";
import { navigate } from "astro:transitions/client";
import { toast } from "sonner";

export const EditSidebar = ({ post }: { post: Post }) => {

    const [tab, setTab] = useState<'manual' | 'editor'>("manual");
    const [image, setImage] = useState<string | null>(post.image ?? null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        const handler = actions.admin.editPostDetails(formData)

        toast.promise(handler, {
            loading: 'Updating post...',
            success: 'Post updated',
            error: 'Failed to update post',
            onDismiss: () => {
                navigate(`/admin/edit/${post.id}`)
            },
            onAutoClose: () => {
                navigate(`/admin/edit/${post.id}`)
            }
        })

    }

    return (
        <div className="w-[400px] p-6 m-4 bg-white rounded-lg shadow-sm">
            <div className="sticky top-6 space-y-8 overflow-hidden bg-white">
                <div>
                    <div className="flex items-center justify-between bg-slate-100 rounded-lg p-1 mb-2 gap-2">
                        <Button variant="ghost" className={cn("w-full hover:bg-slate-300", tab === "manual" && "bg-slate-200")} size="icon" onClick={() => setTab("manual")}>
                            Instructions
                        </Button>
                        <Button variant="ghost" className={cn("w-full hover:bg-slate-300", tab === "editor" && "bg-slate-200")} size="icon" onClick={() => setTab("editor")}>
                            Edit Details
                        </Button>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Editor Guide</h2>
                    {tab === "manual" && (
                        <>
                            <div className="space-y-6">
                                <section>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                                        Basic Formatting
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            Select text to show formatting options
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            <span
                                            >Use <kbd
                                                className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 text-xs"
                                            >B</kbd
                                                > for bold</span
                                            >
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            <span
                                            >Use <kbd
                                                className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 text-xs"
                                            >I</kbd
                                                > for italic</span
                                            >
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            <span
                                            >Use <kbd
                                                className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 text-xs"
                                            >U</kbd
                                                > for underline</span
                                            >
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                                        Block Elements
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            Type <code className="px-1.5 text-gray-700 bg-gray-100 rounded"
                                            >/</code
                                            > to show block options
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            Choose headings, lists, quotes etc.
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            Press <kbd
                                                className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 text-xs"
                                            >Enter</kbd
                                            > twice to exit blocks
                                        </li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                                        Advanced Features
                                    </h3>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            Create tables with columns and rows
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            Add code blocks with syntax highlighting
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            Embed external content like videos
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            Use callouts for important notes
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                                            Drag and drop blocks to reorder
                                        </li>
                                    </ul>
                                </section>
                            </div>
                        </>
                    )}
                    {tab === "editor" && (
                        <div className="bg-slate-50 rounded-lg p-4">
                            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                                <input type="hidden" name="postId" value={post.id} />
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input defaultValue={post.title} id="title" name="title" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="shortDescription">Short Description</Label>
                                    <Input defaultValue={post.shortDescription ?? ''} id="shortDescription" name="shortDescription" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select defaultValue={post.type} name="type">
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select a type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Type</SelectLabel>
                                                <SelectItem value="announcement">Announcement</SelectItem>
                                                <SelectItem value="news">News</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="image">Image</Label>
                                    <Input defaultValue={post.image ?? ''} onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || /^https?:\/\/.+/.test(value)) {
                                            setImage(value);
                                        }
                                    }} id="image" name="image" />
                                </div>
                                <Button type="submit">Save</Button>
                            </form>
                            {image && (
                                <div className="items-center rounded-md m-2 border overflow-hidden w-fit h-fit gap-4">
                                    <img src={image} alt="Post Image" className="w-40 h-40" />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <p className="text-xs text-gray-400 italic">
                    Pro tip: Hover over buttons to see keyboard shortcuts
                </p>
            </div>
        </div>
    )
};
