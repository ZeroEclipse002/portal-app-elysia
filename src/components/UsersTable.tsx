import { Button } from "./ui/button"
import { Table, TableHeader, TableCell, TableBody, TableRow, TableHead, TableCaption } from "./ui/table"


export const UsersTable = () => {

    return (
        <div className="space-y-4">
            <Button className="w-full sm:w-auto">Create User</Button>
            <div className="rounded-md border">
                <Table>
                    <TableCaption>Users</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>John Doe</TableCell>
                            <TableCell>john.doe@example.com</TableCell>
                            <TableCell>Admin</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}