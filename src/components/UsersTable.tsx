import { EyeIcon, TrashIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Table, TableHeader, TableCell, TableBody, TableRow, TableHead, TableCaption } from "./ui/table"
import { actions } from "astro:actions"
import { navigate } from "astro:transitions/client"

interface User {
    id: string
    email: string
    name: string
    role: string
    approved: boolean
}

export const UsersTable = ({ users, page }: { users: User[], page: string }) => {

    async function approveUser(userId: string, approved: boolean) {
        try {
            const response = await actions.admin.approveUser({
                userId: userId,
                approved: approved
            });

            if (response.data) {
                alert('User ' + userId + ' approved: ' + approved);
                navigate(`/admin`);
            } else {
                console.error(response.error);
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableCaption>Users</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Approved</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.approved ? 'Yes' : 'No'}</TableCell>
                                <TableCell className="flex gap-2">
                                    <a href={`/admin/users/${user.id}`}>
                                        <Button variant="outline" size="icon">
                                            <EyeIcon className="w-4 h-4" />
                                        </Button>
                                    </a>
                                    <form onSubmit={() => approveUser(user.id, !user.approved)} method="post">
                                        <Button className="w-24" variant={user.approved ? "destructive" : "default"} size="icon">
                                            {user.approved ? 'Unapprove' : 'Approve'}
                                        </Button>
                                    </form>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div>
                    {parseInt(page) > 1 && (
                        <a
                            href={`/admin?usersPage=${parseInt(page) - 1}`}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </a>
                    )}
                </div>
            </div>
            <div>
                {users?.length === 10 && (
                    <a
                        href={`/admin?usersPage=${parseInt(page) + 1}`}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Next
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                )}
            </div>
        </div>
    )
}