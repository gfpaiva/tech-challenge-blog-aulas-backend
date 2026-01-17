import { Injectable, Inject } from '@nestjs/common';
import { desc, sql, eq, ilike, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { posts, users, categories } from '@infra/database/schema';
import { DRIZZLE } from '@infra/database/drizzle.provider';
import {
  FindAllPostsParams,
  IPostRepository,
  PaginatedPostsResult,
} from '@modules/posts/core/ports/post.repository.port';
import { Post } from '@modules/posts/core/entities/post.entity';
import { PostMapper } from '@modules/posts/infra/mappers/post.mapper';

@Injectable()
export class DrizzlePostRepository implements IPostRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<
      typeof import('@infra/database/schema')
    >,
  ) {}

  private getBaseQuery() {
    return this.db
      .select({
        id: posts.id,
        title: posts.title,
        content: posts.content,
        creationDate: posts.creationDate,
        updateDate: posts.updateDate,
        author: {
          id: users.id,
          name: users.name,
          role: users.role,
        },
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(categories, eq(posts.categoryId, categories.id));
  }

  async findAll(params: FindAllPostsParams): Promise<PaginatedPostsResult> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [results, totalCount] = await Promise.all([
      this.getBaseQuery()
        .orderBy(desc(posts.creationDate))
        .limit(limit)
        .offset(offset),

      this.db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .then((res) => Number(res[0]?.count || 0)),
    ]);

    const mappedPosts = results.map((result) => PostMapper.toDomain(result));

    return {
      posts: mappedPosts,
      total: totalCount,
    };
  }

  async search(term: string): Promise<Post[]> {
    const results = await this.getBaseQuery()
      .where(
        or(ilike(posts.title, `%${term}%`), ilike(posts.content, `%${term}%`)),
      )
      .limit(50); // Safety limit

    return results.map((result) => PostMapper.toDomain(result));
  }

  async findById(id: string): Promise<Post | null> {
    const [result] = await this.getBaseQuery().where(eq(posts.id, id)).limit(1);

    if (!result) {
      return null;
    }

    return PostMapper.toDomain(result);
  }

  async update(id: string, data: Partial<Post>): Promise<Post> {
    const updateValues: Record<string, any> = {
      updateDate: new Date(),
    };

    if (data.title) updateValues.title = data.title;
    if (data.content) updateValues.content = data.content;
    if (data.category?.id) updateValues.categoryId = data.category.id;

    await this.db.update(posts).set(updateValues).where(eq(posts.id, id));

    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Failed to update post');
    }
    return updated;
  }

  async create(data: Post): Promise<Post> {
    const [inserted] = await this.db
      .insert(posts)
      .values({
        title: data.title,
        content: data.content,
        authorId: data.author.id,
        categoryId: data.category.id,
      })
      .returning();

    const created = await this.findById(inserted.id);
    if (!created) {
      throw new Error('Failed to create post');
    }
    return created;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(posts).where(eq(posts.id, id));
  }
}
