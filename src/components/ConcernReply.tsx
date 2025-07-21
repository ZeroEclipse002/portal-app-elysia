import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { actions } from "astro:actions";
import { authClient } from "@/lib/auth-client";
import type { User as BetterAuthUser } from "better-auth";

interface ConcernReplyProps {
    concern: {
        id: number;
        message: string;
        reply?: string | null;
        replyAt?: string | null;
    };
    onReplied?: () => void; // Optional callback to refresh parent data
}

export const ConcernReply: React.FC<ConcernReplyProps> = ({ concern, onReplied }) => {
    const { data: session } = authClient.useSession();
    // Type assertion to ensure role is available
    const user = session?.user as (BetterAuthUser & { role: string; approved: boolean }) | undefined;
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);

    // Only admins can see the reply form
    if (user?.role !== "admin") return null;

    // Parse replies from the reply string (format: (reply-[index]))
    // Remove the -[index] part for display
    const replies = concern.reply
        ? (concern.reply.match(/\(([^)]*)\)/g)?.map((r) => {
            const inner = r.slice(1, -1);
            return inner.replace(/-\[\d+\]$/, "");
        }) || [])
        : [];

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return toast.error("Reply cannot be empty");
        setLoading(true);
        try {
            const res = await actions.admin.replyConcern({
                concernId: concern.id,
                reply: reply.trim(),
            });
            if (res?.data?.success) {
                toast.success("Reply sent");
                setReply("");
                onReplied?.();
            } else {
                toast.error(res?.error?.message || "Failed to send reply");
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to send reply");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-2">Replies</h4>
            {replies.length === 0 ? (
                <div className="text-xs text-gray-500 mb-2">No replies yet.</div>
            ) : (
                <ul className="mb-2 space-y-1">
                    {replies.map((r, i) => (
                        <li key={i} className="text-xs text-gray-700 bg-white rounded px-2 py-1 border">
                            {r}
                        </li>
                    ))}
                </ul>
            )}
            <form onSubmit={handleReply} className="flex gap-2 items-center">
                <Input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    disabled={loading}
                />
                <Button type="submit" disabled={loading || !reply.trim()}>
                    {loading ? "Sending..." : "Reply"}
                </Button>
            </form>
        </div>
    );
}; 