import { betterAuth } from "better-auth";
import { BETTER_AUTH_SECRET } from "astro:env/server";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
export const auth = betterAuth({
    secret: BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: schema
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                required: false,
                defaultValue: 'user',
                input: false
            },
            approved: {
                type: 'boolean',
                required: false,
                defaultValue: false,
                input: false
            }
        }
    },

})