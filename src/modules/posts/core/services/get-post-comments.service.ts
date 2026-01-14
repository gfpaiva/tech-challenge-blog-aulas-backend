import { Injectable } from '@nestjs/common';
import { Comment } from '../entities/comment.entity';
import { ICommentRepository } from '../ports/comment.repository.port';
import { GetPostService } from './get-post.service';

@Injectable()
export class GetPostCommentsService {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly getPostService: GetPostService,
  ) {}

  async execute(postId: string): Promise<Comment[]> {
    await this.getPostService.execute(postId);

    return this.commentRepository.findByPostId(postId);
  }
}
