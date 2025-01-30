import { relations, sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, boolean, pgEnum, check, unique, jsonb, serial } from "drizzle-orm/pg-core";

export const postType = pgEnum("post_type", ["announcement", "news"]);

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull(),
    image: text('image'),
    role: text('role').notNull(),
    approved: boolean('approved').notNull().default(false),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull().references(() => user.id)
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull().references(() => user.id),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull(),
    updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at'),
    updatedAt: timestamp('updated_at'),
});


export const posts = pgTable("posts", (t) => ({
    id: t.text("id").primaryKey(),
    title: t.text("title").notNull(),
    type: t.text("type", { enum: postType.enumValues }).notNull(),
    image: t.text("image"),
    public: t.boolean("public").notNull().default(false),
    shortDescription: t.text("short_description"),
    deletedAt: t.timestamp("deleted_at"),
    createdAt: t.timestamp("created_at").notNull(),
    updatedAt: t.timestamp("updated_at").notNull(),
    userId: t.text("user_id").notNull().references(() => user.id, { onDelete: 'set null' })
}))

export const postContent = pgTable("post_content", {
    id: serial("id").primaryKey(),
    content: jsonb("content"),
    postId: text("post_id").notNull().references(() => posts.id, { onDelete: 'set null' })
})

export const priority = pgTable("priority", (t) => ({
    id: t.serial("id").primaryKey(),
    priority: t.integer("priority").notNull().default(0).unique(),
    postId: t.text("post_id").notNull().references(() => posts.id, { onDelete: 'set null' }).unique(),
}),
    (table) => [{
        checkLimit: check("priority_check", sql`${table.priority} >= 0 AND ${table.priority} <= 10`),
    }]
)


export const postRelations = relations(posts, ({ one }) => ({
    user: one(user, {
        fields: [posts.userId],
        references: [user.id]
    }),
}))

export const postContentRelations = relations(postContent, ({ one }) => ({
    post: one(posts, {
        fields: [postContent.postId],
        references: [posts.id]
    })
}))

export const priorityRelations = relations(priority, ({ one }) => ({
    post: one(posts, {
        fields: [priority.postId],
        references: [posts.id]
    })
}))

export const sectionSequence = pgTable("section_sequence", {
    id: text("id").primaryKey(),
    sequence: integer("sequence").array().notNull().default([1, 2, 3, 4]),
})


export type Post = typeof posts.$inferSelect
export type PostContent = typeof postContent.$inferSelect
export interface PostWithUser extends Post {
    user: {
        name: string
    }
}

export type PriorityPost = typeof priority.$inferSelect

export interface PriorityPostWithPost extends Omit<PriorityPost, 'id'> {
    post: Pick<Post, 'title'>
}