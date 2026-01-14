import { Post } from '../../core/entities/post.entity';

export class PostDetailResponseDto {
  id: string;
  title: string;
  content: string;
  creationDate: Date;
  updateDate: Date;
  author: {
    id: string;
    name: string;
    role: string;
  };
  category: {
    id: number;
    name: string;
  };

  static fromDomain(post: Post): PostDetailResponseDto {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      creationDate: post.creationDate,
      updateDate: post.updateDate,
      author: post.author,
      category: post.category,
    };
  }
}
