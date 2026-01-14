import { Comment } from '../entities/comment.entity';

export abstract class ICommentRepository {
  abstract findByPostId(postId: string): Promise<Comment[]>;
}
