import { Elysia, type Context } from 'elysia';
import { auth } from '@/lib/auth';
import type { User, Session } from 'better-auth';

export const betterAuthView = (context: Context) => {
    const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
    if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
        return auth.handler(context.request);
    } else {
        context.error(405);
    }
};

export const userMiddleware = async (request: Request) => {
    const session = await auth.api.getSession({ headers: request.headers });
    return {
        user: session?.user ?? null,
        session: session?.session ?? null
    };
};

export const userInfo = (user: User | null, session: Session | null) => ({
    user,
    session
});

export const authRoutes = new Elysia()
    .derive(({ request }) => userMiddleware(request))
    .all("/api/auth/*", betterAuthView, {
        detail: {
            tags: ['Authentication'],
            description: 'Handle authentication routes through Better Auth',
            responses: {
                200: { description: 'Authentication operation successful' },
                405: { description: 'Method not allowed' }
            }
        }
    })
    .get("/api/user", ({ user, session }) => userInfo(user, session), {
        detail: {
            tags: ['User'],
            description: 'Get current user information',
            responses: {
                200: {
                    description: 'User information retrieved successfully',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    user: { type: 'object', nullable: true },
                                    session: { type: 'object', nullable: true }
                                }
                            }
                        }
                    }
                }
            }
        }
    });