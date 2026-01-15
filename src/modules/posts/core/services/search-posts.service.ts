import { Injectable } from '@nestjs/common';
import { IPostRepository } from '@modules/posts/core/ports/post.repository.port';
import { Post } from '@modules/posts/core/entities/post.entity';

@Injectable()
export class SearchPostsService {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(term: string): Promise<Post[]> {
    return this.postRepository.search(term);
  }
}
