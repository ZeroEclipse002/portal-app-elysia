import { db } from "@/db";
import { postContent, posts, priority, sectionSequence } from "@/db/schema";
import { generateId } from "@/lib/utils";
import { ActionError, defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro:schema";
import { eq, inArray, sql, SQL } from "drizzle-orm";

export const admin = {
    createPost: defineAction({
        accept: 'json',
        input: z.object({
            title: z.string(),
            type: z.enum(['announcement', 'news']),
            shortDescription: z.string(),
            image: z.string().regex(/^https?:\/\/.+/).optional(),
        }),
        handler: async (input, context) => {

            if (!context.locals.user) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be logged in to create a post'
                })
            }

            if (context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to create a post'
                })
            }

            const newPost = await db.transaction(async (tx) => {

                const [post] = await tx.insert(posts).values({
                    id: generateId(),
                    title: input.title,
                    type: input.type as 'announcement' | 'news',
                    userId: context.locals.user?.id ?? '',
                    image: input.image,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    shortDescription: input.shortDescription,
                }).returning()

                if (!post) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to create post'
                    })
                }

                await tx.insert(postContent).values({
                    postId: post.id,
                    content: null,
                })

                return {
                    success: true,
                    postId: post.id
                }

            })

            return newPost

        }
    }),
    updatePostVisibility: defineAction({
        accept: 'json',
        input: z.object({
            postId: z.string(),
            public: z.boolean(),
        }),
        handler: async (input, context) => {
            if (!context.locals.user) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be logged in to update post visibility'
                })
            }

            if (context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to update post visibility'
                })
            }

            const [post] = await db.update(posts).set({
                public: input.public
            }).where(eq(posts.id, input.postId)).returning()

            if (!post) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update post visibility'
                })
            }

            return {
                success: true,
                postId: post.id
            }
        }
    }),
    editPostContent: defineAction({
        accept: 'json',
        input: z.object({
            postId: z.string().regex(/^pst-\d{4}-\d{2}-\d{2}-[a-zA-Z0-9]{4}$/),
            content: z.array(z.any())
        }),
        handler: async (input, context) => {

            if (!context.locals.user) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be logged in to edit post content'
                })
            }

            if (context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to edit post content'
                })
            }

            const content = await db.transaction(async (tx) => {
                const [postResult] = await tx.select().from(posts).where(eq(posts.id, input.postId))

                if (!postResult) {
                    throw new ActionError({
                        code: 'NOT_FOUND',
                        message: 'Post not found'
                    })
                }

                await tx.update(postContent).set({
                    content: input.content,
                }).where(eq(postContent.postId, input.postId)).returning()

                const [post] = await tx.update(posts).set({
                    updatedAt: new Date()
                }).where(eq(posts.id, input.postId)).returning()

                if (!post) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to update post content'
                    })
                }

                return {
                    success: true,
                    postId: post.id
                }


            })

            return content

        }
    }),
    editGridLayout: defineAction({
        accept: 'json',
        input: z.object({
            layout: z.array(z.number())
        }),
        handler: async (input, context) => {
            if (!context.locals.user) {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be logged in to edit grid layout'
                })
            }

            if (context.locals.user.role !== 'admin') {
                throw new ActionError({
                    code: 'UNAUTHORIZED',
                    message: 'You must be an admin to edit grid layout'
                })
            }

            const [grid] = await db.update(sectionSequence).set({
                sequence: input.layout
            }).where(eq(sectionSequence.id, '1')).returning()

            if (!grid) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Failed to update grid layout'
                })
            }

            return {
                success: true,
                gridId: grid.id
            }

        }
    }),
    deletePost: defineAction({
        accept: 'json',
        input: z.object({
            postId: z.string()
        }),
        handler: async (input, context) => {
            authMiddleware(context)

            const [prio] = await db.select().from(priority).where(eq(priority.postId, input.postId))

            if (prio) {
                throw new ActionError({
                    code: 'BAD_REQUEST',
                    message: 'Post is priority post'
                })
            }

            const [post] = await db.update(posts).set({
                deletedAt: new Date()
            }).where(eq(posts.id, input.postId)).returning()

            if (!post) {
                throw new ActionError({
                    code: 'NOT_FOUND',
                    message: 'Post not found'
                })
            }

            return {
                success: true,
                postId: post.id
            }
        }
    }),
    editPostDetails: defineAction({
        accept: 'form',
        input: z.object({
            postId: z.string(),
            title: z.string(),
            shortDescription: z.string(),
            type: z.enum(['announcement', 'news']),
            image: z.string().regex(/^https?:\/\/.+/).optional(),
        }),
        handler: async (input, context) => {
            authMiddleware(context)

            const [post] = await db.update(posts).set({
                title: input.title,
                shortDescription: input.shortDescription,
                type: input.type as 'announcement' | 'news',
                image: input.image,
            }).where(eq(posts.id, input.postId)).returning()

            return {
                success: true,
                postId: post.id
            }
        }
    }),
    managePriority: defineAction({
        accept: 'json',
        input: z.object({
            postId: z.string().optional(),
            priority: z.array(z.object({
                id: z.string(),
                priority: z.number()
            })).optional(),
            priorityNumber: z.number().optional(),
            mode: z.enum(['add', 'remove', 'arrange'])
        }),
        handler: async (input, context) => {
            authMiddleware(context)

            if (input.mode === 'add') {

                if (!input.postId) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Post ID is required'
                    })
                }

                const maxValue = await db.select({ max: sql<number>`max(${priority.priority})` }).from(priority).execute()

                if (maxValue[0].max >= 10) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Maximum priority value reached'
                    })
                }

                const [data] = await db.insert(priority).values({
                    postId: input.postId,
                    priority: maxValue[0].max + 1
                }).returning()
            }

            if (input.mode === 'remove') {

                if (!input.postId) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Post ID is required'
                    })
                }

                const [data] = await db.delete(priority).where(eq(priority.postId, input.postId)).returning()
            }

            if (input.mode === 'arrange') {

                if (!input.priority) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Priority is required'
                    })
                }

                const sqlChunks: SQL[] = []

                const ids: string[] = [];
                sqlChunks.push(sql`(case`);
                for (const prio of input.priority) {
                    sqlChunks.push(sql`when ${priority.id} = ${prio.id} then ${prio.priority}`);
                    ids.push(prio.id);
                }

                sqlChunks.push(sql`end)`);

                const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));

                const [data] = await db.update(priority).set({
                    priority: finalSql
                }).where(inArray(priority.postId, ids)).returning()

                if (!data) {
                    throw new ActionError({
                        code: 'INTERNAL_SERVER_ERROR',
                        message: 'Failed to arrange priority'
                    })
                }

                return {
                    success: true,
                    data: data
                }
            }
        }
    })
}


const authMiddleware = (context: ActionAPIContext) => {
    if (!context.locals.user) {
        throw new ActionError({
            code: 'UNAUTHORIZED',
            message: 'You must be logged in to delete a post'
        })
    }

    if (context.locals.user.role !== 'admin') {
        throw new ActionError({
            code: 'UNAUTHORIZED',
            message: 'You must be an admin to delete a post'
        })
    }
}