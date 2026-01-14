import { Injectable } from '@nestjs/common';
import {
  IPostRepository,
  PaginatedPostsResult,
} from '@modules/posts/core/ports/post.repository.port';
import { ICachePort } from '@common/ports/cache.port';

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
      return JSON.parse(cachedData) as PaginatedPostsResult;
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
