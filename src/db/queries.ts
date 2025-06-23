import { db } from ".";
import { sectionSequence } from "./schema";
import { eq, sql } from "drizzle-orm";



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

export const getRequests = db.query.requests.findMany({
    where: (table, { eq, sql }) => eq(table.userId, sql.placeholder("userId")),
    limit: sql.placeholder('limit'),
    offset: sql.placeholder('offset'),
}).prepare('getRequests')

export const getRequest = db.query.requests.findFirst({
    where: (table, { eq, sql }) => eq(table.id, sql.placeholder("requestId")),
    with: {
        user: {
            columns: {
                name: true
            },
            with: {
                details: true,
            }
        }
    }
}).prepare('getRequest')

export const getAllRequests = db.query.requests.findMany({
    orderBy: (table, { desc }) => desc(table.createdAt),
    limit: sql.placeholder('limit'),
    offset: sql.placeholder('offset'),
}).prepare('getAllRequests')

export const getRequestLogs = db.query.requestUpdates.findMany({
    where: (table, { eq, sql }) => eq(table.requestId, sql.placeholder("requestId")),
    orderBy: (table, { desc }) => desc(table.createdAt),
    with: {
        form: true
    }
}).prepare('getRequestLogs')


export const getPosts = db.query.posts.findMany({
    with: {
        user: {
            columns: {
                name: true,
            },
        },
        priority: {
            columns: {
                priority: true,
            },
        },
    },
}).prepare('getPosts')

export const getPriorityPostsAdmin = db.query.posts.findMany({
    with: {
        user: {
            columns: {
                name: true,
            },
        },
        priority: {
            columns: {
                priority: true,
            },
        },
    },
    columns: {
        id: true,
        title: true,
    }
}).prepare('getPriorityPostsAdmin')





export const getHighlights = db.query.highlights.findMany().prepare('getHighlights')

export const getDownloadableResources = db.query.downloadableContent.findMany().prepare('getDownloadableResources')

export const GetAllNews = db.query.posts.findMany({
    where: (table, { eq, and }) => and(eq(table.public, true), eq(table.type, 'news')),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: 9,
    offset: sql.placeholder('page'),
}).prepare('getAllNews')

export const GetAllAnnouncements = db.query.posts.findMany({
    where: (table, { eq, and }) => and(eq(table.public, true), eq(table.type, 'announcement')),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: 9,
    offset: sql.placeholder('page'),
}).prepare('getAllAnnouncements')


export const getLatestAnnouncementAndNews = db.execute(sql`
  SELECT * FROM (
    (SELECT * FROM posts WHERE type = 'announcement' ORDER BY created_at DESC LIMIT 1)
    UNION ALL
    (SELECT * FROM posts WHERE type = 'news' ORDER BY created_at DESC LIMIT 1)
  ) AS latest_posts
`)


export const getUsers = db.query.user.findMany({
    where: (table, { ilike, sql }) => ilike(table.name, sql.placeholder('search')),
    columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        approved: true,
    },
    with: {
        family: {
            columns: {
                id: true,
            },
        },
    },
    limit: 5,
    offset: sql.placeholder('page'),
    orderBy: (table, { asc }) => [asc(table.approved)], // Sort unapproved users first
}).prepare('getUsers')


export const getMembers = db.query.familyData.findMany({
    where: (table, { eq, sql }) => eq(table.userId, sql.placeholder("userId")),
}).prepare('getMembers')