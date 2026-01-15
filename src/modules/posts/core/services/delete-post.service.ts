import { Injectable } from '@nestjs/common';
import { IPostRepository } from '../ports/post.repository.port';
import { ICachePort } from '@common/ports/cache.port';
import { PostNotFoundError } from '../exceptions/post-not-found.error';
import { ForbiddenActionException } from '../exceptions/forbidden-action.exception';

@Injectable()
export class DeletePostService {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly cache: ICachePort,
  ) {}

  async execute(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findById(postId);

    if (!post) {
      throw new PostNotFoundError(postId);
    }

    if (post.author.id !== userId) {
      throw new ForbiddenActionException('You can only delete your own posts');
    }

    await this.postRepository.delete(postId);

    await Promise.all([
      this.cache.del(`post:detail:${postId}`),
      this.cache.delMatch('posts:list:*'),
    ]);
  }
}
