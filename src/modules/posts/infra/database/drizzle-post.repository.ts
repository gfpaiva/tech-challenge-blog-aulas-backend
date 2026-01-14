import { Injectable, Inject } from '@nestjs/common';
import { desc, sql, eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { posts, users, categories } from '@infra/database/schema';
import { DRIZZLE } from '@infra/database/drizzle.provider';
import {
    FindAllPostsParams,
    IPostRepository,
    PaginatedPostsResult,
} from '@modules/posts/core/ports/post.repository.port';
import { PostMapper } from '@modules/posts/infra/mappers/post.mapper';


@Injectable()
export class DrizzlePostRepository implements IPostRepository {
    constructor(
        @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof import('@infra/database/schema')>,
    ) { }

    async findAll(params: FindAllPostsParams): Promise<PaginatedPostsResult> {
        const { page, limit } = params;
        const offset = (page - 1) * limit;

        const [results, totalCount] = await Promise.all([
            this.db
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
                .leftJoin(categories, eq(posts.categoryId, categories.id))
                .orderBy(desc(posts.creationDate))
                .limit(limit)
                .offset(offset),

            this.db
                .select({ count: sql<number>`count(*)` })
                .from(posts)
                .then((res) => Number(res[0]?.count || 0)),
        ]);

        const mappedPosts = results.map(PostMapper.toDomain);

        return {
            posts: mappedPosts,
            total: totalCount,
        };
    }
}
