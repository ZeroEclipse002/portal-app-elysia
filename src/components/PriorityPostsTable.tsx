import type { Post, PriorityPostWithPost } from "@/db/schema";
import { Table, TableHead, TableRow, TableHeader, TableCell, TableBody } from "./ui/table";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { actions } from "astro:actions";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { TrashIcon } from "lucide-react";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/utils";

export const PriorityPostsTable = () => {

    const [postId, setPostId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [open, setOpen] = useState(false)

    const { data: postArray, mutate } = useSWR<{ posts: Post[], priorityPosts: PriorityPostWithPost[] }>('/api/adminposts', fetcher)

    async function addPriority() {

        if (!postId) {
            toast.error('Please select a post and priority')
            setError('Please select a post and priority')
            return
        }

        const handler = actions.admin.managePriority({
            mode: 'add',
            postId: postId,
        })

        toast.promise(handler, {
            loading: 'Adding priority',
            success: (e) => {
                setError(null)
                if (e.error) {
                    setError(e.error.message)
                    return 'Failed to add priority'
                }
                return 'Priority added'
            },
            error: (e) => {
                setError(e.message)
                return 'Failed to add priority'
            }
        })

        await mutate()
    }


    async function removePriority(postId: string) {
        const handler = actions.admin.managePriority({
            mode: 'remove',
            postId: postId,
        })

        toast.promise(handler, {
            loading: 'Removing priority',
            success: 'Priority removed',
            error: 'Failed to remove priority',
        })

        await mutate()
    }

    if (!postArray) {
        return (
            <div className="flex flex-col gap-4">
                <div className="animate-pulse">
                    <div className="h-10 w-32 bg-slate-200 rounded mb-4" />
                    <div className="space-y-3">
                        <div className="h-12 bg-slate-200 rounded" />
                        <div className="h-12 bg-slate-200 rounded" />
                        <div className="h-12 bg-slate-200 rounded" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            <Dialog>
                <DialogTrigger asChild>
                    <Button onClick={() => {
                        console.log('clicked')
                    }}>
                        Add Priority
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Priority</DialogTitle>
                        <DialogDescription>
                            Add priority to a post
                        </DialogDescription>
                    </DialogHeader>
                    {error && <div className="text-red-200 text-sm border border-red-500 rounded-md p-2">{error}</div>}
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="priority">Posts</Label>
                            <Select value={postId ?? ''} onValueChange={(value) => setPostId(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a post" />
                                </SelectTrigger>
                                <SelectContent>
                                    {postArray?.posts.filter((post) => !postArray?.priorityPosts.some((priorityPost) => priorityPost.postId === post.id)).map((post) => (
                                        <SelectItem key={post.id} value={post.id}>{post.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={addPriority}>Add</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {postArray?.priorityPosts.map((post, index) => (
                        <TableRow key={index}>
                            <TableCell>{post.post.title}</TableCell>
                            <TableCell>{post.priority}</TableCell>
                            <TableCell>
                                <Button onClick={() => removePriority(post.postId)} variant="destructive" size="icon">
                                    <TrashIcon className="w-4 h-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}