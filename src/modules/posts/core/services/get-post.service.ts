import { Injectable } from '@nestjs/common';
import { Post } from '../entities/post.entity';
import { IPostRepository } from '../ports/post.repository.port';
import { ICachePort } from '@common/ports/cache.port';
import { PostNotFoundError } from '../exceptions/post-not-found.error';

@Injectable()
export class GetPostService {
  private static TTL_SECONDS = 3600; // 1 hour

  constructor(
    private readonly postRepository: IPostRepository,
    private readonly cache: ICachePort,
  ) {}

  async execute(id: string): Promise<Post> {
    const cacheKey = `post:detail:${id}`;

    const cachedPost = await this.cache.get(cacheKey);
    if (cachedPost) {
      return JSON.parse(cachedPost) as Post;
    }

    const post = await this.postRepository.findById(id);
    if (!post) {
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
