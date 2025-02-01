// pages/[...slugs].ts
import { Elysia, t, type Context } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { auth } from '@/lib/auth';
import type { User } from 'better-auth';
import type { Session } from 'better-auth';
import { cron, Patterns } from '@elysiajs/cron';
import { getConfig, getRecentPosts, getPriorityPosts, getPostContent, getUserFamily, getRequests, getRequest, getRequestLogs, getPosts, getAllRequests, getHighlights, getDownloadableResources, getLatestAnnouncementAndNews } from '@/db/queries';
import { utapi } from '@/utconfig/uploadthing';
import _ from 'lodash';

class MemoryCache {
    private cache: Map<string, { value: any, expiry: number }>;
    private cleanupInterval: number;
    private intervalId: NodeJS.Timeout;

    constructor(cleanupInterval = 60000) { // Default cleanup every minute
        this.cache = new Map();
        this.cleanupInterval = cleanupInterval;
        this.intervalId = setInterval(() => this.cleanup(), this.cleanupInterval);
    }

    private cleanup() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
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

    // Clean up the interval when the cache is no longer needed
    destroy() {
        clearInterval(this.intervalId);
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

const getTTL = (type: 'recent' | 'priority' | 'config' | 'post') => {
    const isWorkHours = isBusinessHours();

    switch (type) {
        case 'recent':
            return isWorkHours ? 300 : 1800; // 5 mins during business hours, 30 mins otherwise
        case 'priority':
            return isWorkHours ? 900 : 3600; // 15 mins during business hours, 1 hour otherwise
        case 'config':
            return isWorkHours ? 1800 : 7200; // 30 mins during business hours, 2 hours otherwise
        case 'post':
            return isWorkHours ? 3600 : 14400; // 1 hour during business hours, 4 hours otherwise
    }
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
            const cached = await cache.get('config');
            if (cached) return cached;

            const config = await getConfig.execute();
            await cache.set('config', config, { ex: getTTL('config') });
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
            const cacheKey = `post:${params.postId}`;
            const cached = await cache.get(cacheKey);
            if (cached) return cached;

            const post = await getPostContent.execute({ postId: params.postId as string });

            const response = {
                content: post?.content ?? null
            };

            await cache.set(cacheKey, response, { ex: getTTL('post') });
            return response;
        })
        .post("/feed/cache/invalidate", async ({ user }) => {
            if (!user) {
                throw new Error('Unauthorized');
            }

            await Promise.all([
                cache.del('recent'),
                cache.del('priority'),
                cache.del('config'),
                cache.del('request'),
                // Note: We don't invalidate individual post caches here as they're less frequently updated
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
        .get("/initialconfig", async ({ user }) => {
            if (user) {

                const userDetails = await getUserFamily.execute({ userId: user.id });

                return {
                    hasInitialDetails: userDetails ? true : false
                }

            }

            return {
                hasInitialDetails: false
            }
        })
        .get("/requests", async ({ user }) => {

            if (!user) {
                console.log('Unauthorized');
                throw new Error('Unauthorized');
            }

            const requests = await getRequests.execute({ userId: user.id });


            return requests;
        })
        .get("/request/:requestId", async ({ params, user }) => {
            if (!params.requestId) {
                throw new Error('Request ID is required');
            }

            if (!user) {
                throw new Error('Unauthorized');
            }

            const request = await getRequest.execute({ requestId: params.requestId as string })

            if (!request) {
                throw new Error('Request not found');
            }

            const pictureUrl = await utapi.getSignedURL(request.idPicture, {
                expiresIn: 60 * 60
            })

            const cacheKey = `request:${params.requestId}`;
            const cached = await cache.get(cacheKey);

            if (cached) {
                return {
                    request: {
                        ...cached.request,
                        status: request.status
                    }
                };
            }

            const response = {
                request: {
                    ..._.omit(request, ['idPicture', 'status']),
                    idPicture: pictureUrl
                }
            };

            await cache.set(cacheKey, response, { ex: 3600 }); // Cache for 1 hour

            return {
                request: {
                    ...response.request,
                    status: request.status
                }
            };
        })
        .get("/requestlogs/:requestId", async ({ params, user }) => {
            if (!params.requestId) {
                throw new Error('Request ID is required');
            }

            if (!user) {
                throw new Error('Unauthorized');
            }

            const requestLogs = await getRequestLogs.execute({ requestId: params.requestId as string })

            console.log(requestLogs);

            return {
                requestLogs: requestLogs
            };

        })
        .get("/adminposts", async ({ user }) => {
            if (!user) {
                throw new Error('Unauthorized');
            }

            if (user.role !== 'admin') {
                throw new Error('Unauthorized');
            }

            const posts = await getPosts.execute();

            const priorityPosts = posts
                .filter((post) => post.priority)
                .map((post) => ({
                    postId: post.id,
                    priority: post.priority?.priority ?? 0,
                    post: {
                        title: post.title,
                    },
                }));

            return {
                posts: posts,
                priorityPosts: priorityPosts
            };
        })
        .get("/adminrequests", async ({ user, query }) => {
            if (!user) {
                throw new Error('Unauthorized');
            }

            if (user.role !== 'admin') {
                throw new Error('Unauthorized');
            }

            const page: number = parseInt(query.page || '1');

            const requests = await getAllRequests.execute({ limit: 10, offset: (page - 1) * 10 });

            return requests;
        })
        .get("/highlights", async () => {
            const highlights = await getHighlights.execute();
            return highlights;
        })
        .get("/downloadable-resources", async () => {
            const downloadableResources = await getDownloadableResources.execute();
            return downloadableResources;
        })
        .get("/marquee", async () => {
            // Query the latest highlight, news, and announcement
            const latestAnnouncementAndNews = await getLatestAnnouncementAndNews.execute();

            return {
                latestAnnouncementAndNews: _.pick(latestAnnouncementAndNews, ['rows'])
            };
        })
    )

const handle = ({ request }: { request: Request }) => app.handle(request)

export const GET = handle
export const POST = handle

export type appClient = typeof app