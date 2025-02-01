import { db } from "@/db";
import { familyData, requests, sectionSequence, user, userDetails } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ActionError, defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro:schema";
import { and, arrayContains, eq, or } from "drizzle-orm";
import { admin } from "./admin";
import { utapi } from "@/utconfig/uploadthing";
import { UTFile } from "uploadthing/server";


export const server = {
    init: defineAction({
        accept: 'form',
        input: z.object({
            name: z.string(),
            email: z.string().email(),
            password: z.string(),
        }),
        handler: async (input, context) => {

            const noAdmin = await db.query.user.findFirst({
                where: (table, { eq }) => eq(table.role, 'admin')
            })

            if (noAdmin) {
                throw new ActionError({
                    code: 'CONFLICT',
                    message: 'Admin already exists'
                })
            }

            const data = await auth.api.signUpEmail({
                body: {
                    name: input.name,
                    email: input.email,
                    password: input.password,
                }
            })

            await db.update(user).set({
                role: 'admin'
            }).where(eq(user.id, data.user.id))

            const sequence = await db.select().from(sectionSequence).limit(1)

            if (sequence.length === 0) {
                await db.insert(sectionSequence).values({
                    id: '1',
                    sequence: [1, 2, 3, 4]
                })
            }

            return {
                success: true
            }
        }
    }),
    initDetails: defineAction({
        accept: 'json',
        input: z.object({
            personalDetails: z.object({
                firstName: z.string(),
                lastName: z.string(),
                phone: z.string().regex(/^\d{11}$/, {
                    message: 'Phone number must be 11 digits'
                }),
                address: z.string(),
                birthDate: z.string().date().refine(date => new Date(date) < new Date(), {
                    message: 'Birth date must be in the past'
                }),
                gender: z.string()
            }),
            familyMembers: z.array(z.object({
                fullName: z.string(),
                birthDate: z.string().date().refine(date => new Date(date) < new Date(), {
                    message: 'Birth date must be in the past'
                }),
                gender: z.string(),
                relationship: z.string()
            })).min(1, {
                message: 'Please add at least one family member'
            })
        }),
        handler: async (input, context) => {
            console.log(input)

            AuthMiddleware(context)

            await new Promise(resolve => setTimeout(resolve, 2000))

            await db.transaction(async tx => {
                await tx.insert(userDetails).values({
                    ...input.personalDetails,
                    userId: context.locals.user?.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })

                await tx.insert(familyData).values({
                    data: input.familyMembers,
                    userId: context.locals.user?.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            })

            return {
                success: true
            }
        }
    }),
    createRequest: defineAction({
        accept: 'form',
        input: z.object({
            requestType: z.string(),
            otherRequestType: z.string().optional(),
            requestDetails: z.string().optional(),
            idPicture: z.instanceof(File).refine(file => file.type.startsWith('image/') && file.size <= 1 * 1024 * 1024, {
                message: 'Please upload a valid image file (max 1MB)'
            }),
        }).refine(data => data.requestType === 'other' ? !!data.otherRequestType : true, {
            message: 'Please specify the type of request',
            path: ['otherRequestType']
        }),
        handler: async (input, context) => {
            try {
                if (!input.idPicture.type.startsWith('image/')) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Please upload a valid image file'
                    });
                }

                if (input.idPicture.size > 1 * 1024 * 1024) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'File size must be less than 1MB'
                    });
                }

                AuthMiddleware(context)

                console.log('Request received:', {
                    ...input,
                    idPicture: {
                        type: input.idPicture.type,
                        size: input.idPicture.size
                    }
                })

                const dataRes = await db.transaction(async tx => {

                    const reqNumber = await tx.$count(requests, and(eq(requests.userId, context.locals.user?.id as string), or(eq(requests.status, 'submitted'), eq(requests.status, 'reviewed'))))

                    if (reqNumber >= 3) {
                        throw new ActionError({
                            code: 'BAD_REQUEST',
                            message: 'You have reached the maximum number of requests'
                        })
                    }

                    const idPic = await utapi.uploadFiles(new UTFile([input.idPicture], input.idPicture.name, { type: input.idPicture.type }))

                    if (!idPic.data) {
                        throw new ActionError({
                            code: 'BAD_REQUEST',
                            message: 'Failed to upload image'
                        })
                    }

                    const request = await tx.insert(requests).values({
                        type: input.requestType,
                        details: input.requestDetails ?? '',
                        status: 'submitted',
                        idPicture: idPic.data.key,
                        userId: context.locals.user?.id,
                        createdAt: new Date(),
                    })

                    return {
                        success: true,
                        message: 'Request submitted successfully'
                    }

                })
            } catch (error) {
                console.error('Error processing request:', error)
                throw error
            }
        }
    }),
    admin
}

function AuthMiddleware(context: ActionAPIContext) {
    if (!context.locals.user) {
        throw new ActionError({
            code: 'UNAUTHORIZED',
            message: 'Unauthorized'
        })
    }
}