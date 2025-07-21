import { Elysia } from 'elysia';
import { getPosts, getAllRequests, getHighlights, getDownloadableResources, getLatestAnnouncementAndNews, getUsers, getPriorityPostsAdmin } from '@/db/queries';
import { db } from '@/db';
import { userMiddleware } from '../auth';
import { bearer } from '@elysiajs/bearer'
import { requests, user as userTable } from '@/db/schema';
import { and, eq, gte, lt } from 'drizzle-orm';

export const adminRoutes = new Elysia()
    .use(bearer())
    .derive(({ request }) => userMiddleware(request))
    .group('/api', app => app
        .get('/adminposts', async ({ user }) => {
            if (!user) {
                throw new Error('Unauthorized');
            }

            if (user.role !== 'admin') {
                throw new Error('Unauthorized');
            }

            const posts = await getPriorityPostsAdmin.execute();

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
        }, {
            detail: {
                tags: ['Admin'],
                security: [{ BearerAuth: [] }],
                description: 'Get all posts with priority information. Admin access only.',
                responses: {
                    200: {
                        description: 'Posts retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        posts: { type: 'array', items: { type: 'object' } },
                                        priorityPosts: { type: 'array', items: { type: 'object' } }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized - Not authenticated or not an admin' }
                }
            }
        })
        .get('/adminrequests', async ({ user, query }) => {
            if (!user) {
                throw new Error('Unauthorized');
            }

            if (user.role !== 'admin') {
                throw new Error('Unauthorized');
            }

            const page: number = parseInt(query.page || '1');

            const requests = await getAllRequests.execute({ limit: 10, offset: (page - 1) * 10 });

            return requests;
        }, {
            detail: {
                tags: ['Admin'],
                security: [{ BearerAuth: [] }],
                description: 'Get all requests with pagination. Admin access only.',
                query: {
                    page: { type: 'string', description: 'Page number for pagination' }
                },
                responses: {
                    200: { description: 'Requests retrieved successfully' },
                    401: { description: 'Unauthorized - Not authenticated or not an admin' }
                }
            }
        })
        .get('/highlights', async () => {
            const highlights = await getHighlights.execute();
            return highlights;
        }, {
            detail: {
                tags: ['Content'],
                description: 'Get highlighted content',
                responses: {
                    200: { description: 'Highlights retrieved successfully' }
                }
            }
        })
        .get('/downloadable-resources', async () => {
            const downloadableResources = await getDownloadableResources.execute();
            return downloadableResources;
        }, {
            detail: {
                tags: ['Resources'],
                description: 'Get list of downloadable resources',
                responses: {
                    200: { description: 'Resources retrieved successfully' }
                }
            }
        })
        .get('/marquee', async () => {
            const latestAnnouncementAndNews = await getLatestAnnouncementAndNews.execute();

            return {
                latestAnnouncementAndNews: {
                    rows: latestAnnouncementAndNews.rows
                }
            };
        }, {
            detail: {
                tags: ['Content'],
                description: 'Get latest announcements and news for marquee display',
                responses: {
                    200: {
                        description: 'Latest announcements and news retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        latestAnnouncementAndNews: {
                                            type: 'object',
                                            properties: {
                                                rows: { type: 'array', items: { type: 'object' } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        .post('/clean-expired-requests', async ({ bearer }) => {

            if (!bearer) {
                throw new Error('No bearer token');
            }

            if (bearer !== import.meta.env.CRON_KEY!) {
                throw new Error('Invalid bearer token');
            }

            return new Response('Expired requests cleaned successfully', {
                status: 200
            });
        }, {
            detail: {
                tags: ['Admin'],
                security: [{ BearerAuth: [] }],
                description: 'Clean expired requests',
                responses: {
                    200: { description: 'Expired requests cleaned successfully' }
                }
            }
        })
        .get('/admin/users', async ({ user, query }) => {
            if (!user) {
                throw new Error('Unauthorized');
            }

            if (user.role !== 'admin') {
                throw new Error('Unauthorized');
            }

            const pageNumber = parseInt(query.page || '1');

            const users = await getUsers.execute({ page: (pageNumber - 1) * 5, search: `%${query.searchUser || ''}%` });

            return users;
        }, {
            detail: {
                tags: ['Admin'],
                description: 'Get all users',
                responses: {
                    200: { description: 'Users retrieved successfully' }
                }
            }
        })
        .get('/admin/newaccounts', async ({ user }) => {
            if (!user) {
                throw new Error('Unauthorized');
            }

            if (user.role !== 'admin') {
                throw new Error('Unauthorized');
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const newAccounts = await db.select()
                .from(userTable)
                .where(
                    and(
                        gte(userTable.createdAt, today),
                        lt(userTable.createdAt, tomorrow),
                        eq(userTable.approved, false)
                    )
                );

            return newAccounts.length > 0 ? true : false;

        }, {
            detail: {
                tags: ['Admin'],
                description: 'Check if there are new accounts',
                responses: {
                    200: { description: 'New accounts retrieved successfully' },
                    401: { description: 'Unauthorized - Not authenticated or not an admin' }
                }
            }
        })
    );