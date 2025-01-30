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

export const PriorityPostsTable = ({ priorityPosts, posts }: { priorityPosts: PriorityPostWithPost[], posts: Post[] }) => {

    const [postId, setPostId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

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
                                    {posts.map((post) => (
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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {priorityPosts.map((post, index) => (
                        <TableRow key={index}>
                            <TableCell>{post.post.title}</TableCell>
                            <TableCell>{post.priority}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}