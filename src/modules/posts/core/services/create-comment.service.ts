import { Injectable } from '@nestjs/common';
import { ICommentRepository } from '../ports/comment.repository.port';
import { IPostRepository } from '../ports/post.repository.port';
import { CreateCommentDto } from '../../api/dtos/create-comment.dto';
import { UserRole } from '@common/types';
import { Comment } from '../entities/comment.entity';
import { PostNotFoundError } from '../exceptions/post-not-found.error';

interface CreateCommentParams extends CreateCommentDto {
  postId: string;
  authorId: string;
  authorRole: UserRole;
}

@Injectable()
export class CreateCommentService {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly postRepository: IPostRepository,
  ) {}

  async execute(params: CreateCommentParams): Promise<Comment> {
    const { postId, authorId, authorRole, content } = params;

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new PostNotFoundError(postId);
    }

    const comment = new Comment(
      '',
      content,
      postId,
      {
        id: authorId,
        name: '',
        role: authorRole,
      },
      new Date(),
    );

    return this.commentRepository.create(comment);
  }
}
