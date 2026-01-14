import { Injectable } from '@nestjs/common';
import {
  IPostRepository,
  PaginatedPostsResult,
} from '@modules/posts/core/ports/post.repository.port';
import { ICachePort } from '@common/ports/cache.port';

import {
  PersistencePost,
  PostMapper,
} from '@modules/posts/infra/mappers/post.mapper';

@Injectable()
export class ListPostsService {
  private static TTL_SECONDS = 3600; // 1 hour

  constructor(
    private readonly postRepository: IPostRepository,
    private readonly cache: ICachePort,
  ) {}

  async execute(params: {
    page: number;
    limit: number;
  }): Promise<PaginatedPostsResult> {
    const { page, limit } = params;
    const cacheKey = `posts:list:page:${page}:limit:${limit}`;

    const cachedData = await this.cache.get(cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData) as {
        posts: PersistencePost[];
        total: number;
      };
      return {
        ...parsedData,
        posts: parsedData.posts.map((post) => PostMapper.toDomain(post)),
      };
    }

    const result = await this.postRepository.findAll({ page, limit });

    await this.cache.set(
      cacheKey,
      JSON.stringify(result),
      ListPostsService.TTL_SECONDS,
    );

    return result;
  }
}
