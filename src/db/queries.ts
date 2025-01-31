import { db } from ".";
import { sectionSequence } from "./schema";
import { eq } from "drizzle-orm";



export const getConfig = db.query.sectionSequence.findFirst({
    where: eq(sectionSequence.id, "1"),
}).prepare('getConfig')


export const getRecentPosts = db.query.posts.findMany({
    where: (table, { eq, and, isNull }) => and(eq(table.public, true), isNull(table.deletedAt)),
    orderBy: (table, { desc }) => desc(table.createdAt),
    limit: 3,
}).prepare('getRecentPosts')

export const getPriorityPosts = db.query.priority.findMany({
    orderBy: (table, { desc }) => desc(table.priority),
    with: {
        post: true
    },
    limit: 3,
}).prepare('getPriorityPosts')


export const getPostContent = db.query.postContent.findFirst({
    where: (table, { eq, sql }) => eq(table.postId, sql.placeholder('postId')),
}).prepare('getPostContent')

export const getPost = db.query.posts.findFirst({
    where: (table, { eq, sql }) => eq(table.id, sql.placeholder('postId')),
}).prepare('getPost')

export const getUserFamily = db.query.familyData.findFirst({
    where: (table, { eq, sql }) => eq(table.userId, sql.placeholder("userId"))
}).prepare('getUserFamily')