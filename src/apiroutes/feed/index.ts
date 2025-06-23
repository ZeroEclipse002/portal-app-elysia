import { Elysia } from 'elysia';
import { getConfig, getRecentPosts, getPriorityPosts, getPostContent, GetAllNews, GetAllAnnouncements } from '@/db/queries';
import type { TTLType } from '../types';
import { userMiddleware } from '../auth';
import { db } from '@/db';
import { posts } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

const isBusinessHours = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 8 && hours < 20;
};

const getTTL = (type: TTLType) => {
    const isWorkHours = isBusinessHours();

    switch (type) {
        case 'recent':
            return isWorkHours ? 300 : 1800;
        case 'priority':
            return isWorkHours ? 900 : 3600;
        case 'config':
            return isWorkHours ? 1800 : 7200;
        case 'post':
            return isWorkHours ? 3600 : 14400;
    }
};

export const feedRoutes = new Elysia()
    .derive(({ request }) => userMiddleware(request))
    .group('/api', app => app
        .get('/config', async () => {
            const config = await getConfig.execute();
            return config;
        })
        .get('/feed', async () => {
            const [recentPosts, priorityPosts] = await Promise.all([
                getRecentPosts.execute(),
                getPriorityPosts.execute()
            ]);
            return {
                recent: recentPosts ?? {},
                priority: priorityPosts ?? {}
            };
        })
        .get('/feed/news', async ({ query }) => {
            const page = query.page || '1';
            const totalPages = await db.$count(posts, and(eq(posts.type, 'news'), eq(posts.public, true)));
            const data = await GetAllNews.execute({
                page: ((parseInt(page as string) || 1) - 1) * 9,
            });
            return { data, totalPages: Math.ceil(totalPages / 9) };
        })
        .get('/feed/announcements', async ({ query }) => {
            const page = query.page || '1';
            const totalPages = await db.$count(posts, and(eq(posts.type, 'announcement'), eq(posts.public, true)));
            const data = await GetAllAnnouncements.execute({
                page: ((parseInt(page as string) || 1) - 1) * 9,
            });
            return { data, totalPages: Math.ceil(totalPages / 9) };
        })
        .get('/feed/post/:postId', async ({ params }) => {
            const post = await getPostContent.execute({ postId: params.postId as string });
            const response = { content: post?.content ?? null };
            return response;
        })
        .post('/feed/cache/invalidate', async ({ user }) => {
            if (!user) {
                throw new Error('Unauthorized');
            }
            if (user.role !== 'admin') {
                throw new Error('Unauthorized');
            }
            return { success: true, message: 'Cache invalidated successfully (no cache present)' };
        }, {
            detail: {
                tags: ['Cache Management'],
                security: [{ BearerAuth: [] }],
                description: 'Invalidate the feed cache. Requires authentication.'
            }
        })
    );