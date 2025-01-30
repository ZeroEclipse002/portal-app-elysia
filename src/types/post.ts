export interface Post {
    id: string;
    title: string;
    shortDescription: string;
    type: 'news' | string; // Using union type since 'news' seems to be one possible value
    public: boolean;
    createdAt: string;
    updatedAt: string;
    userId: string;
}

export interface MainPost extends Post {
    type: "main";
}

export interface Priority {
    id: string;
    priority: number;
    postId: string;
    post: Post;
}

export interface RecentPost extends Post {
    type: "recent";
}

export interface PostError {
    error: string;
}


// If you need an array type
export type Posts = Post[];
