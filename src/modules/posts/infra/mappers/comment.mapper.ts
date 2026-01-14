import { UserRole } from '@common/types';
import { Comment } from '@modules/posts/core/entities/comment.entity';

export type PersistenceComment = {
  id: string;
  content: string;
  postId: string;
  creationDate: Date;
  author: {
    id: string | null;
    name: string | null;
    role: UserRole | null;
  } | null;
};

export class CommentMapper {
  static toDomain(raw: PersistenceComment): Comment {
    return new Comment(
      raw.id,
      raw.content,
      raw.postId,
      {
        id: raw.author?.id ?? '',
        name: raw.author?.name ?? 'Unknown',
        role: raw.author?.role ?? 'ALUNO',
      },
      raw.creationDate,
    );
  }
}
