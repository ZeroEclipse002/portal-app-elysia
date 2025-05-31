import { authClient } from "@/lib/auth-client"
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { User } from "lucide-react";

export const Signout = () => {

    const { data: session } = authClient.useSession()

    const handleSignout = async () => {
        const { data, error } = await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = "/";
                }
            }
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2">
                    <User className="w-6 h-6" />
                    <span>{session?.user?.name}</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem>
                    <a href="/add-member">
                        Add Members
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <a href="/change-password">
                        Change Password
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignout}>
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}