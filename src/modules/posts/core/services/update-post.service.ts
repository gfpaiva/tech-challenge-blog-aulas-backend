import { Injectable, Inject } from '@nestjs/common';
import { IPostRepository } from '../ports/post.repository.port';
import { Post } from '../entities/post.entity';
import { PostNotFoundError } from '../exceptions/post-not-found.error';
import { ForbiddenActionException } from '../exceptions/forbidden-action.exception';
import { CategoryNotFoundError } from '../exceptions/category-not-found.error';
import {
  ICategoryRepository,
  Category,
} from '../ports/category.repository.port';
import { ICachePort } from '@common/ports/cache.port';
import { ILoggerPort } from '@common/ports/logger.port';

export interface UpdatePostCommand {
  id: string;
  authorId: string;
  title?: string;
  content?: string;
  categoryId?: number;
}

@Injectable()
export class UpdatePostService {
  constructor(
    @Inject(IPostRepository)
    private readonly postRepo: IPostRepository,
    @Inject(ICategoryRepository)
    private readonly categoryRepo: ICategoryRepository,
    @Inject(ICachePort)
    private readonly cache: ICachePort,
    private readonly logger: ILoggerPort,
  ) {}

  async execute(command: UpdatePostCommand): Promise<Post> {
    const { id, authorId, categoryId, ...data } = command;

    const post = await this.postRepo.findById(id);

    if (!post) {
      throw new PostNotFoundError(id);
    }

    if (post.author.id !== authorId) {
      this.logger.warn(
        `Update blocked: User ${authorId} is not owner of ${id}`,
        'UpdatePostService',
      );
      throw new ForbiddenActionException();
    }

    let category: Category | null = null;
    if (categoryId) {
      category = await this.categoryRepo.findById(categoryId);
      if (!category) {
        throw new CategoryNotFoundError(categoryId);
      }
    }

    const updatedPost = await this.postRepo.update(id, {
      ...data,
      ...(category && { category }),
      updateDate: new Date(),
    });

    await Promise.all([
      this.cache.del(`post:detail:${id}`),
      this.cache.delMatch('posts:list:*'),
    ]);

    return updatedPost;
  }
}
