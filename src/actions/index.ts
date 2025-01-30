import { db } from "@/db";
import { sectionSequence, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { ActionError, defineAction } from "astro:actions";
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
    admin
}