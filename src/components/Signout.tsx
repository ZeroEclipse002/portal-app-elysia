import { authClient } from "@/lib/auth-client"

export const Signout = () => {
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
        <button
            className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
            onClick={handleSignout}
        >
            Sign out
        </button>
    )
}