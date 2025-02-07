import { relations, sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, boolean, pgEnum, check, unique, jsonb, serial, uuid } from "drizzle-orm/pg-core";

export type FamilyData = {
    fullName: string;
    birthDate: string;
    gender: string;
    relationship: string;
}

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

export const userDetails = pgTable("user_details", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: 'set null' }).unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    phone: text("phone"),
    address: text("address"),
    birthDate: text("birth_date"),
    gender: text("gender"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
})

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

export const familyData = pgTable("family_data", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: 'set null' }).unique(),
    data: jsonb("data").$type<FamilyData[]>().notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull()
})

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
    postId: t.text("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }).unique(),
}),
    (table) => [{
        checkLimit: check("priority_check", sql`${table.priority} >= 0 AND ${table.priority} <= 10`),
    }]
)

export const requests = pgTable("requests", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: 'set null' }),
    type: text("type").notNull(),
    details: text("details").notNull(),
    idPicture: text("id_picture").notNull(),
    status: text("status", { enum: ['submitted', 'reviewed', 'approved', 'rejected'] }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow()
})

export const requestUpdates = pgTable("request_updates", {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id").references(() => requests.id, { onDelete: 'cascade' }),
    message: text("message").notNull(),
    type: text("type", { enum: ['urgent', 'normal'] }).notNull(),
    updateClose: boolean("update_close").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
})

export const requestUpdatesChat = pgTable("request_updates_chat", {
    id: uuid("id").primaryKey().defaultRandom(),
    requestLogId: uuid("request_id").references(() => requestUpdates.id, { onDelete: 'cascade' }),
    userId: text("user_id").references(() => user.id, { onDelete: 'cascade' }),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
})


export const sectionSequence = pgTable("section_sequence", {
    id: text("id").primaryKey(),
    sequence: integer("sequence").array().notNull().default([1, 2, 3, 4]),
})

export const highlights = pgTable("highlights", {
    id: serial("id").primaryKey(),
    image: text("image").notNull(),
    link: text("link"),
    caption: text("caption").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow()
})

export const downloadableContent = pgTable("downloadable_content", {
    id: serial("id").primaryKey(),
    fileLink: text("file").notNull(),
    fileId: text("file_id").notNull(),
    caption: text("caption").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow()
})

export const feedBack = pgTable("feed_back", {
    id: serial("id").primaryKey(),
    subject: text("subject").notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: 'set null' }),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow()
})

export const concernBoard = pgTable("concern_board", {
    id: serial("id").primaryKey(),
    userId: text("user_id").references(() => user.id, { onDelete: 'set null' }),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow()
})

export const postRelations = relations(posts, ({ one }) => ({
    user: one(user, {
        fields: [posts.userId],
        references: [user.id]
    }),
    priority: one(priority, {
        fields: [posts.id],
        references: [priority.postId]
    })
}))

export const userRelations = relations(user, ({ many, one }) => ({
    posts: many(posts),
    feedBack: many(feedBack),
    concerns: many(concernBoard),
    family: one(familyData, {
        fields: [user.id],
        references: [familyData.userId]
    }),
    requests: many(requests),
    chatrequests: many(requestUpdatesChat)
}))

export const familyDataRelations = relations(familyData, ({ one }) => ({
    user: one(user, {
        fields: [familyData.userId],
        references: [user.id]
    })
}))

export const feedBackRelations = relations(feedBack, ({ one }) => ({
    user: one(user, {
        fields: [feedBack.userId],
        references: [user.id]
    })
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

export const requestRelations = relations(requests, ({ one, many }) => ({
    user: one(user, {
        fields: [requests.userId],
        references: [user.id]
    }),
    updates: many(requestUpdates)
}))

export const requestUpdatesChatRelations = relations(requestUpdatesChat, ({ one }) => ({
    requestLog: one(requestUpdates, {
        fields: [requestUpdatesChat.requestLogId],
        references: [requestUpdates.id]
    }),
    user: one(user, {
        fields: [requestUpdatesChat.userId],
        references: [user.id]
    })
}))

export const requestUpdateRelations = relations(requestUpdates, ({ one, many }) => ({
    request: one(requests, {
        fields: [requestUpdates.requestId],
        references: [requests.id]
    }),
    chatrecord: many(requestUpdatesChat)
}))

export const concernRelations = relations(concernBoard, ({ one }) => ({
    user: one(user, {
        fields: [concernBoard.userId],
        references: [user.id]
    })
}))




export type Post = typeof posts.$inferSelect
export type PostContent = typeof postContent.$inferSelect
export interface PostWithUser extends Post {
    user: {
        name: string
    }
}

export type ConcernType = typeof concernBoard.$inferSelect
export type HighlightsType = typeof highlights.$inferSelect
export type ChatType = typeof requestUpdatesChat.$inferSelect
export type DownloadableResourcesType = typeof downloadableContent.$inferSelect
export type Ticket = typeof requests.$inferSelect
export type TicketUpdate = typeof requestUpdates.$inferSelect
export type PriorityPost = typeof priority.$inferSelect

export interface PriorityPostWithPost extends Omit<PriorityPost, 'id'> {
    post: Pick<Post, 'title'>
}