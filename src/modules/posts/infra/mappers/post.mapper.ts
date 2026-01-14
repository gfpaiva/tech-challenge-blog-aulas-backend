import { UserRole } from '@common/types';
import { Post } from '@modules/posts/core/entities/post.entity';

export type PersistencePost = {
  id: string;
  title: string;
  content: string;
  creationDate: Date;
  updateDate: Date;
  author: {
    id: string | null;
    name: string | null;
    role: UserRole | null;
  } | null;

  category: {
    id: number | null;
    name: string | null;
  } | null;
};

export class PostMapper {
  static toDomain(raw: PersistencePost): Post {
    return new Post(
      raw.id,
      raw.title,
      raw.content,
      {
        id: raw.author?.id ?? '',
        name: raw.author?.name ?? 'Unknown',
        role: raw.author?.role ?? 'ALUNO',
      },
      {
        id: raw.category?.id ?? 0,
        name: raw.category?.name ?? 'Uncategorized',
      },
      raw.creationDate,
      raw.updateDate,
    );
  }
}
