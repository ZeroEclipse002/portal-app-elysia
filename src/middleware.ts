import { auth } from "@/lib/auth";
import { defineMiddleware, sequence } from "astro:middleware";
import { db } from "./db";


const authMiddleware = defineMiddleware(async (context, next) => {
    try {
        const session = await auth.api.getSession({
            headers: context.request.headers,
        });

        // Set each property individually
        // @ts-ignore
        context.locals.user = session?.user ?? null;
        context.locals.session = session?.session ?? null;
        context.locals.init = false;

        return next();
    } catch (error) {
        console.error(error);
        context.locals.user = null;
        context.locals.session = null;
        context.locals.init = false;
        return next();
    }
});

const initMiddleware = defineMiddleware(async (context, next) => {
    try {
        const adminExists = await db.query.user.findFirst({
            where: (table, { eq }) => eq(table.role, 'admin')
        });

        context.locals.init = !adminExists;

        if (!adminExists &&
            !context.url.pathname.startsWith('/init')) {
            return context.redirect('/init');
        }

        return next();
    } catch (error) {
        console.error(error);
        context.locals.init = false;
        return next();
    }
});

const adminMiddleware = defineMiddleware(async (context, next) => {

    if (context.url.pathname.startsWith('/admin')) {
        if (!context.locals.user) {
            return context.redirect('/');
        }

        if (context.locals.user.role !== 'admin') {
            return context.redirect('/');
        }
    }

    return next();


});


export const onRequest = sequence(authMiddleware);