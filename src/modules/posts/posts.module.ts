import { Module } from '@nestjs/common';
import { DatabaseModule } from '@infra/database/database.module';
import { CacheModule } from '@infra/cache/cache.module';

import { PostsController } from './api/controllers/posts.controller';
import { ListPostsService } from './core/services/list-posts.service';
import { GetPostService } from './core/services/get-post.service';
import { IPostRepository } from './core/ports/post.repository.port';
import { DrizzlePostRepository } from './infra/database/drizzle-post.repository';

import { GetPostCommentsService } from './core/services/get-post-comments.service';
import { ICommentRepository } from './core/ports/comment.repository.port';
import { DrizzleCommentRepository } from './infra/database/drizzle-comment.repository';
import { CreatePostService } from './core/services/create-post.service';
import { CreateCommentService } from './core/services/create-comment.service';
import { UpdatePostService } from './core/services/update-post.service';
import { DeletePostService } from './core/services/delete-post.service';
import { SearchPostsService } from './core/services/search-posts.service';
import { ICategoryRepository } from './core/ports/category.repository.port';
import { DrizzleCategoryRepository } from './infra/database/drizzle-category.repository';

@Module({
  imports: [DatabaseModule, CacheModule],
  controllers: [PostsController],
  providers: [
    ListPostsService,
    GetPostService,
    CreatePostService,
    CreateCommentService,
    GetPostCommentsService,
    UpdatePostService,
    DeletePostService,
    SearchPostsService,
    {
      provide: IPostRepository,
      useClass: DrizzlePostRepository,
    },
    {
      provide: ICategoryRepository,
      useClass: DrizzleCategoryRepository,
    },
    {
      provide: ICommentRepository,
      useClass: DrizzleCommentRepository,
    },
  ],
})
export class PostsModule {}
