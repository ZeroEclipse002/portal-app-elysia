import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import { actions } from "astro:actions"
import type { Post, PostWithUser } from "@/db/schema"
import { navigate } from "astro:transitions/client"
import { Switch } from "./ui/switch"
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable, getFilteredRowModel, type ColumnFiltersState, getPaginationRowModel } from "@tanstack/react-table"
import { formatDate } from "@/utils/format"
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSeparator
} from "./ui/dropdown-menu"
import { Badge } from "./ui/badge"


type PostTable = Omit<PostWithUser, 'content'> & {
    user: {
        name: string;
    };
    priority: boolean;
}

async function deletePost(postId: string) {
    try {
        const { data, error } = await actions.admin.deletePost({ postId })
        if (!error) {
            window.location.reload()
        }
    } catch (error) {
        console.error('Failed to delete post:', error)
    }
}

const createColumns = () => {
    const columns: ColumnDef<PostTable>[] = [
        {
            accessorKey: "title",
            header: "Title",
            enableColumnFilter: true,
            cell: ({ row }) => (
                <p className=" bg-slate-100 px-2 py-1 rounded-md">
                    {row.original.title}
                </p>
            )
        },
        {
            accessorKey: "type",
            header: "Type",
            enableColumnFilter: true,
            cell: ({ row }) => (
                <span className="capitalize">{row.original.type}</span>
            )
        },
        {
            accessorKey: "user",
            header: "Author",
            cell: ({ row }) => <span>{row.original.user.name}</span>
        },

        {
            accessorKey: "createdAt",
            header: "Created At",
            cell: ({ row }) => formatDate(row.original.createdAt)
        },
        {
            accessorKey: "updatedAt",
            header: "Updated At",
            cell: ({ row }) => formatDate(row.original.updatedAt)
        },
        {
            accessorKey: "archived",
            header: "Archived",
            cell: ({ row }) => (
                <Badge variant={row.original.deletedAt ? "destructive" : "default"}>
                    {row.original.deletedAt ? "Archived" : "Active"}
                </Badge>
            )
        },
        {
            accessorKey: "public",
            header: "Visibility",
            cell: ({ row }) => (
                <Switch
                    checked={row.original.public}
                    disabled={!!row.original.deletedAt}
                    onCheckedChange={async () => {
                        const { data, error } = await actions.admin.updatePostVisibility({
                            postId: row.original.id,
                            public: !row.original.public
                        })
                        if (!error) {
                            window.location.reload()
                        }
                    }}
                />
            )
        },
        {
            accessorKey: "priority",
            header: "Priority",
            cell: ({ row }) => (
                <Dialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                </svg>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Options</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem disabled={!!row.original.deletedAt} asChild>
                                    <a href={`/admin/edit/${row.original.id}`}>
                                        Edit
                                    </a>
                                </DropdownMenuItem>
                                <DialogTrigger disabled={!!row.original.deletedAt} asChild>
                                    <DropdownMenuItem>
                                        Archive
                                    </DropdownMenuItem>
                                </DialogTrigger>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Are you absolutely sure?</DialogTitle>
                            {row.original.priority && (<div className="bg-red-300 border-red-500 border-2 text-slate-500 text-sm rounded-md p-2">
                                <p>You cannot delete a post that is currently in a priority feed.</p>
                            </div>)}
                            <DialogDescription>
                                This action cannot be undone. This will archive your post.
                            </DialogDescription>
                        </DialogHeader>
                        <Button disabled={row.original.priority} onClick={() => deletePost(row.original.id)}>
                            Archive
                        </Button>
                    </DialogContent>
                </Dialog>
            )
        }
    ]
    return columns
}

const CreatePostDialog = () => {
    const [title, setTitle] = useState('')
    const [type, setType] = useState<'announcement' | 'news'>('announcement')
    const [shortDescription, setShortDescription] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [image, setImage] = useState('')
    const [imageFinal, setImageFinal] = useState('')

    const handleCreatePost = async () => {
        try {
            const { data, error } = await actions.admin.createPost({ title, type, shortDescription, image: imageFinal })
            if (!error && data?.postId) {
                setIsOpen(false)
                navigate(`/admin/edit/${data.postId}`)
            }
        } catch (error) {
            console.error('Failed to create post:', error)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">Create Post</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Post</DialogTitle>
                    <DialogDescription>
                        Fill out the initial details to create a post.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="shortDescription" className="text-right">
                            Short Description
                        </Label>
                        <Input id="shortDescription" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            Post Type
                        </Label>
                        <Select value={type} onValueChange={(value) => setType(value as 'announcement' | 'news')}>
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
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">
                            Image
                        </Label>
                        <Input id="image" value={image} onChange={(e) => {
                            const value = e.target.value;
                            setImage(value);
                            if (value === '' || /^https?:\/\/.+/.test(value)) {
                                setImageFinal(value);
                            }
                        }} className="col-span-3" />
                    </div>
                    {imageFinal && (
                        <div className="items-center rounded-md border overflow-hidden w-fit h-fit gap-4">
                            <img src={imageFinal} alt="Image Preview" className="w-24 h-24 object-cover" />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleCreatePost}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export const PostsTable = ({ posts }: { posts: PostTable[] }) => {
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const table = useReactTable({
        data: posts,
        columns: createColumns(),
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnFiltersChange: setColumnFilters,
        state: {
            columnFilters,
        },
        getPaginationRowModel: getPaginationRowModel()
    })

    return (
        <div className="space-y-4">
            <CreatePostDialog />
            <div className="flex gap-2">
                <Input
                    placeholder="Filter titles..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(e) =>
                        table.getColumn("title")?.setFilterValue(e.target.value)
                    }
                    className="max-w-sm"
                />
                <Select
                    value={(table.getColumn("type")?.getFilterValue() as string) ?? "all"}
                    onValueChange={(value) => {
                        const filterValue = value === "all" ? "" : value;
                        table.getColumn("type")?.setFilterValue(filterValue);
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter type..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        <SelectItem value="news">News</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableCaption>Posts</TableCaption>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}