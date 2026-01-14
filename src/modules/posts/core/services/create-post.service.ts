import { Injectable, Inject } from '@nestjs/common';
import { CategoryNotFoundError } from '../exceptions/category-not-found.error';
import { IPostRepository } from '../ports/post.repository.port';
import { ICategoryRepository } from '../ports/category.repository.port';
import { Post } from '../entities/post.entity';
import { ICachePort } from '@common/ports/cache.port';
import { UserRole } from '@common/types';

interface CreatePostCommand {
  authorId: string;
  title: string;
  content: string;
  categoryId: number;
}

@Injectable()
export class CreatePostService {
  constructor(
    @Inject(IPostRepository)
    private readonly postRepository: IPostRepository,
    @Inject(ICategoryRepository)
    private readonly categoryRepository: ICategoryRepository,
    @Inject(ICachePort)
    private readonly cache: ICachePort,
  ) {}

  async execute(command: CreatePostCommand): Promise<Post> {
    const category = await this.categoryRepository.findById(command.categoryId);

    if (!category) {
      throw new CategoryNotFoundError(command.categoryId);
    }

    const newPost = new Post(
      '', // ID will be generated
      command.title,
      command.content,
      {
        id: command.authorId,
        name: '', // Placeholder
        role: 'PROFESSOR' as UserRole, // Placeholder
      },
      category,
      new Date(),
      new Date(),
    );

    const createdPost = await this.postRepository.create(newPost);

    await this.cache.delMatch('posts:list:*');

    return createdPost;
  }
}
