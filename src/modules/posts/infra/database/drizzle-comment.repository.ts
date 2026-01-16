import { Injectable, Inject } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { comments, users } from '@infra/database/schema';
import { DRIZZLE } from '@infra/database/drizzle.provider';
import { ICommentRepository } from '@modules/posts/core/ports/comment.repository.port';
import { Comment } from '@modules/posts/core/entities/comment.entity';
import { CommentMapper } from '@modules/posts/infra/mappers/comment.mapper';

@Injectable()
export class DrizzleCommentRepository implements ICommentRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<
      typeof import('@infra/database/schema')
    >,
  ) {}

  async findByPostId(postId: string): Promise<Comment[]> {
    const results = await this.db
      .select({
        id: comments.id,
        content: comments.content,
        postId: comments.postId,
        creationDate: comments.creationDate,
        author: {
          id: users.id,
          name: users.name,
          role: users.role,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(desc(comments.creationDate));

    return results.map((result) => CommentMapper.toDomain(result));
  }

  async create(comment: Comment): Promise<Comment> {
    const [inserted] = await this.db
      .insert(comments)
      .values({
        content: comment.content,
        postId: comment.postId,
        authorId: comment.author.id,
        creationDate: comment.creationDate,
      })
      .returning();

    const [created] = await this.db
      .select({
        id: comments.id,
        content: comments.content,
        postId: comments.postId,
        creationDate: comments.creationDate,
        author: {
          id: users.id,
          name: users.name,
          role: users.role,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.id, inserted.id))
      .limit(1);

    if (!created) {
      throw new Error('Failed to create comment');
    }

    return CommentMapper.toDomain(created);
  }
}
