import { Post } from '../entities/post.entity';

export interface FindAllPostsParams {
  page: number;
  limit: number;
}

export interface PaginatedPostsResult {
  posts: Post[];
  total: number;
}

export abstract class IPostRepository {
  abstract findAll(params: FindAllPostsParams): Promise<PaginatedPostsResult>;
  abstract findById(id: string): Promise<Post | null>;
}
