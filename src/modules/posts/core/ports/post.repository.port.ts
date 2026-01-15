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
  abstract search(term: string): Promise<Post[]>;
  abstract findById(id: string): Promise<Post | null>;
  abstract update(id: string, data: Partial<Post>): Promise<Post>;
  abstract delete(id: string): Promise<void>;
  abstract create(data: Post): Promise<Post>;
}
