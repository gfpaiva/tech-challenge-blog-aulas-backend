import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { categories } from '@infra/database/schema';
import { DRIZZLE } from '@infra/database/drizzle.provider';
import { ICategoryRepository, Category } from '@modules/posts/core/ports/category.repository.port';

@Injectable()
export class DrizzleCategoryRepository implements ICategoryRepository {
    constructor(
        @Inject(DRIZZLE)
        private readonly db: NodePgDatabase<
            typeof import('@infra/database/schema')
        >,
    ) {}

    async findById(id: number): Promise<Category | null> {
        const [result] = await this.db
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);

        if (!result) {
            return null;
        }

        return {
            id: result.id,
            name: result.name,
        };
    }
}
