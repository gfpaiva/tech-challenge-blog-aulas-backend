import { Injectable } from '@nestjs/common';
import { Post } from '../entities/post.entity';
import { IPostRepository } from '../ports/post.repository.port';
import { ICachePort } from '@common/ports/cache.port';
import { ILoggerPort } from '@common/ports/logger.port';
import { PostNotFoundError } from '../exceptions/post-not-found.error';

import { PersistencePost, PostMapper } from '../../infra/mappers/post.mapper';

@Injectable()
export class GetPostService {
  private static TTL_SECONDS = 3600; // 1 hour

  constructor(
    private readonly postRepository: IPostRepository,
    private readonly cache: ICachePort,
    private readonly logger: ILoggerPort,
  ) {}

  async execute(id: string): Promise<Post> {
    const cacheKey = `post:detail:${id}`;

    const cachedPost = await this.cache.get(cacheKey);
    if (cachedPost) {
      const rawPost = JSON.parse(cachedPost) as PersistencePost;
      return PostMapper.toDomain(rawPost);
    }

    const post = await this.postRepository.findById(id);
    if (!post) {
      this.logger.warn(`Post not found: ${id}`, 'GetPostService');
      throw new PostNotFoundError(id);
    }

    await this.cache.set(
      cacheKey,
      JSON.stringify(post),
      GetPostService.TTL_SECONDS,
    );

    return post;
  }
}
