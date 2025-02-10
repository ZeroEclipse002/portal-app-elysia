import { Elysia } from 'elysia';
import { cache } from '../utils/cache';
import { getConfig, getRecentPosts, getPriorityPosts, getPostContent, GetAllNews, GetAllAnnouncements } from '@/db/queries';
import type { TTLType } from '../types';
import { userMiddleware } from '../auth';

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
            const cached = await cache.get('config');
            if (cached) return cached;

            const config = await getConfig.execute();
            await cache.set('config', config, { ex: getTTL('config') });
            return config;
        })
        .get('/feed', async () => {
            const recent = await cache.get('recent');
            const priority = await cache.get('priority');

            if (recent && priority) {
                return { recent, priority };
            }

            const [recentPosts, priorityPosts] = await Promise.all([
                getRecentPosts.execute(),
                getPriorityPosts.execute()
            ]);

            await cache.set('recent', recentPosts, { ex: getTTL('recent') });
            await cache.set('priority', priorityPosts, { ex: getTTL('priority') });

            return {
                recent: recentPosts ?? {},
                priority: priorityPosts ?? {}
            };
        })
        .get('/feed/news', async () => {

            const data = await cache.get('news');

            if (data) {
                return data;
            } else {
                const data = await GetAllNews.execute();
                await cache.set('news', data, { ex: getTTL('recent') });
                return data;
            }
        })
        .get('/feed/announcements', async () => {

            const data = await cache.get('announcements');

            if (data) {

                return data;

            } else {
                const data = await GetAllAnnouncements.execute();

                await cache.set('announcements', data, { ex: getTTL('recent') });

                return data;
            }

        })
        .get('/feed/post/:postId', async ({ params }) => {
            const cacheKey = `post:${params.postId}`;
            const cached = await cache.get(cacheKey);
            if (cached) return cached;

            const post = await getPostContent.execute({ postId: params.postId as string });
            const response = { content: post?.content ?? null };

            await cache.set(cacheKey, response, { ex: getTTL('post') });
            return response;
        })
        .post('/feed/cache/invalidate', async ({ user }) => {
            if (!user) {
                throw new Error('Unauthorized');
            }

            await Promise.all([
                cache.del('recent'),
                cache.del('priority'),
                cache.del('config'),
                cache.del('request')
            ]);

            return { success: true, message: 'Cache invalidated successfully' };
        }, {
            detail: {
                tags: ['Cache Management'],
                security: [{ BearerAuth: [] }],
                description: 'Invalidate the feed cache. Requires authentication.'
            }
        })
    );