import React from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const POLL_INTERVAL = 10000; // 10 seconds

export const AdminNewAccountsWidget: React.FC = () => {
    const { data: session } = authClient.useSession();
    const user = session?.user as { role?: string } | undefined;

    // Always call hooks at the top level!
    const { data, error } = useSWR<boolean>(
        "/api/admin/newaccounts",
        fetcher,
        { refreshInterval: POLL_INTERVAL }
    );

    // Now do conditional rendering
    if (user?.role !== "admin") return null;
    if (error) return null;
    if (!data) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-blue-300 shadow-lg rounded-lg px-6 py-4 flex items-center gap-3 animate-bounce">
            <span className="text-blue-600 text-xl font-bold">New Account Requests!</span>
            <a
                href="/admin?users=open#userssection"
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium shadow"
            >
                Review Now
            </a>
        </div>
    );
}; 