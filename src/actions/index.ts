import { db } from "@/db";
import { familyData, sectionSequence, user, userDetails } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ActionError, defineAction, type ActionAPIContext } from "astro:actions";
import { z } from "astro:schema";
import { eq } from "drizzle-orm";
import { admin } from "./admin";


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