import type { User, Session } from 'better-auth';

export interface CacheOptions {
    ex?: number;
}

export interface AuthContext {
    user: User | null;
    session: Session | null;
}

export interface RequestWithAuth extends Request {
    auth?: AuthContext;
}

export type TTLType = 'recent' | 'priority' | 'config' | 'post';

export interface PaginationQuery {
    page?: string;
    limit?: string;
}

export interface RequestParams {
    requestId: string;
}

export interface PostParams {
    postId: string;
}

export interface UserParams {
    userId: string;
}