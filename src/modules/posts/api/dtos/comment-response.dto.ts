import { Comment } from '../../core/entities/comment.entity';
import { AuthorDto } from './post-response.dto';

export class CommentDto {
  id: string;
  content: string;
  postId: string;
  author: AuthorDto;
  creationDate: Date;

  static fromDomain(comment: Comment): CommentDto {
    return {
      id: comment.id,
      content: comment.content,
      postId: comment.postId,
      author: comment.author,
      creationDate: comment.creationDate,
    };
  }
}
