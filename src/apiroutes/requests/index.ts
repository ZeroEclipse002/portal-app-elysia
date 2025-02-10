import { Elysia } from 'elysia';
import { cache } from '../utils/cache';
import { getRequests, getRequest, getRequestLogs, getUserFamily } from '@/db/queries';
import { utapi } from '@/utconfig/uploadthing';
import _ from 'lodash';
import { userMiddleware } from '../auth';

export const requestRoutes = new Elysia()
    .derive(({ request }) => userMiddleware(request))
    .group('/api', app => app
        .get('/requests', async ({ user }) => {
            if (!user) {
                throw new Error('Unauthorized');
            }

            const requests = await getRequests.execute({ userId: user.id });
            return requests;
        }, {
            detail: {
                tags: ['Requests'],
                security: [{ BearerAuth: [] }],
                description: 'Get all requests for the authenticated user',
                responses: {
                    200: {
                        description: 'List of user requests retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            status: { type: 'string' },
                                            userId: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized - User not authenticated' }
                }
            }
        })
        .get('/request/:requestId', async ({ params, user }) => {
            if (!params.requestId) {
                throw new Error('Request ID is required');
            }

            if (!user) {
                throw new Error('Unauthorized');
            }

            const request = await getRequest.execute({ requestId: params.requestId as string })

            if (user.role !== 'admin') {
                if (request?.userId !== user.id) {
                    throw new Error('Unauthorized');
                }
            }

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
                        status: request.status,
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
        .get('/requestlogs/:requestId', async ({ params, user }) => {
            if (!params.requestId) {
                throw new Error('Request ID is required');
            }

            if (!user) {
                throw new Error('Unauthorized');
            }

            const requestLogs = await getRequestLogs.execute({ requestId: params.requestId as string })
            return { requestLogs };
        }, {
            detail: {
                tags: ['Requests'],
                security: [{ BearerAuth: [] }],
                description: 'Get logs for a specific request',
                params: {
                    requestId: { type: 'string', description: 'ID of the request to get logs for' }
                },
                responses: {
                    200: {
                        description: 'Request logs retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        requestLogs: { type: 'array', items: { type: 'object' } }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'Unauthorized' },
                    404: { description: 'Request not found' }
                }
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
        }, {
            detail: {
                tags: ['User Configuration'],
                description: 'Get user initial configuration status',
                responses: {
                    200: {
                        description: 'Initial configuration status retrieved successfully',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        hasInitialDetails: { type: 'boolean' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    );