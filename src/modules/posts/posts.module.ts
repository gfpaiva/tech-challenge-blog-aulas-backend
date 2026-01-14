import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infra/database/database.module';
import { CacheModule } from '@infra/cache/cache.module';

import { PostsController } from './api/controllers/posts.controller';
import { ListPostsService } from './core/services/list-posts.service';
import { IPostRepository } from './core/ports/post.repository.port';
import { DrizzlePostRepository } from './infra/database/drizzle-post.repository';

@Module({
    imports: [DatabaseModule, CacheModule],
    controllers: [PostsController],
    providers: [
        ListPostsService,
        {
            provide: IPostRepository,
            useClass: DrizzlePostRepository,
        },
    ],
})
export class PostsModule { }
