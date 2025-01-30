/// <reference path="../.astro/types.d.ts" />

type EdgeLocals = import('@astrojs/vercel').EdgeLocals

declare namespace App {
    // Note: 'import {} from ""' syntax does not work in .d.ts files.
    interface Locals extends EdgeLocals {
        user: (import("better-auth").User & { role: string }) | null;
        session: import("better-auth").Session | null;
        init: boolean;
    }
}