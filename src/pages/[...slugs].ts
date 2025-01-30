// pages/[...slugs].ts
import { Elysia, t, type Context } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { auth } from '@/lib/auth';
import type { User } from 'better-auth';
import type { Session } from 'better-auth';
import { cron, Patterns } from '@elysiajs/cron';
import { getConfig, getRecentPosts, getPriorityPosts, getPostContent } from '@/db/queries';

class MemoryCache {
    private cache: Map<string, { value: any, expiry: number }>;

    constructor() {
        this.cache = new Map();
    }

    async get(key: string) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    async set(key: string, value: any, options?: { ex?: number }) {
        const expiry = Date.now() + ((options?.ex || 0) * 1000);
        this.cache.set(key, { value, expiry });
    }

    async del(key: string) {
        this.cache.delete(key);
    }
}

const cache = new MemoryCache();

const betterAuthView = (context: Context) => {
    const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"]
    // validate request method
    if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
        return auth.handler(context.request);
    }
    else {
        context.error(405)
    }
}

const userMiddleware = async (request: Request) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
        return {
            user: null,
            session: null
        }
    }

    return {
        user: session.user,
        session: session.session
    }
}

const userInfo = (user: User | null, session: Session | null) => {
    return {
        user: user,
        session: session
    }
}

const isBusinessHours = () => {
    const now = new Date();
    const hours = now.getHours();
    // Consider 8 AM to 8 PM as business hours
    return hours >= 8 && hours < 20;
}

const getTTL = (type: 'recent' | 'priority') => {
    const isWorkHours = isBusinessHours();

    if (type === 'recent') {
        return isWorkHours ? 300 : 1800; // 5 mins during business hours, 30 mins otherwise
    }
    return isWorkHours ? 900 : 3600; // 15 mins during business hours, 1 hour otherwise
}

const app = new Elysia()
    .use(swagger())
    .derive(({ request }) => userMiddleware(request))
    .all("/api/auth/*", betterAuthView)
    .group("/api", (app) => app
        .get("/", () => 'Welcome to the API')
        .get("/user", ({ user, session }) => userInfo(user, session))
        .get("/test", () => 'hi')
        .get("/config", async () => {
            const config = await getConfig.execute();
            return config;
        })
        .get("/feed", async () => {
            const recent = await cache.get('recent');
            const priority = await cache.get('priority');

            if (recent && priority) {
                return { recent, priority };
            } else {
                const [recent, priority] = await Promise.all([
                    getRecentPosts.execute(),
                    getPriorityPosts.execute()
                ]);

                // Dynamic TTL based on time of day
                await cache.set('recent', recent, { ex: getTTL('recent') });
                await cache.set('priority', priority, { ex: getTTL('priority') });

                return { recent: recent ?? {}, priority: priority ?? {} };
            }
        })
        .get("/feed/post/:postId", async ({ params }) => {
            const post = await getPostContent.execute({ postId: params.postId as string });

            console.log('post', post)

            if (!post) {
                return new Response(JSON.stringify({ content: null }), {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
            }

            return new Response(JSON.stringify({ content: post.content }), {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        })
        .post("/feed/cache/invalidate", async ({ user }) => {
            if (!user) {
                throw new Error('Unauthorized');
            }

            await Promise.all([
                cache.del('recent'),
                cache.del('priority')
            ]);

            return { success: true, message: 'Cache invalidated successfully' };
        }, {
            // Add swagger documentation
            detail: {
                tags: ['Cache Management'],
                security: [{ BearerAuth: [] }],
                description: 'Invalidate the feed cache. Requires authentication.'
            }
        })
    )

const handle = ({ request }: { request: Request }) => app.handle(request)

export const GET = handle
export const POST = handle

export type appClient = typeof app