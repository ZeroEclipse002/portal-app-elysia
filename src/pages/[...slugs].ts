import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { authRoutes } from '@/apiroutes/auth'
import { feedRoutes } from '@/apiroutes/feed'
import { requestRoutes } from '@/apiroutes/requests'
import { adminRoutes } from '@/apiroutes/admin'
import { cron, Patterns } from '@elysiajs/cron'

const app = new Elysia()
    .use(swagger({
        documentation: {
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT'
                    }
                }
            }
        }
    }))
    .use(authRoutes)
    .use(feedRoutes)
    .use(requestRoutes)
    .use(adminRoutes)
    .onError(({ code, request }) => {
        if (code === 'NOT_FOUND') {
            return new Response(null, {
                status: 302,
                headers: {
                    'Location': '/404' + '?page=' + new URL(request.url).pathname
                }
            })
        }
    })

const handle = ({ request }: { request: Request }) => app.handle(request)

export const GET = handle
export const POST = handle

export type appClient = typeof app