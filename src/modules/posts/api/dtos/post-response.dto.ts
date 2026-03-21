import { Post } from '../../core/entities/post.entity';

export class AuthorDto {
  id: string;
  name: string;
  role: string;
}

export class CategoryDto {
  id: number;
  name: string;
}

export class PostDto {
  id: string;
  title: string;
  content: string;
  author: AuthorDto;
  category: CategoryDto;
  creationDate: Date;
  updateDate: Date;

  private static readonly CONTENT_PREVIEW_LENGTH = 100;

  static fromDomain(post: Post): PostDto {
    const content =
      post.content.length > PostDto.CONTENT_PREVIEW_LENGTH
        ? `${post.content.substring(0, PostDto.CONTENT_PREVIEW_LENGTH)}...`
        : post.content;

    return {
      id: post.id,
      title: post.title,
      content,
      author: post.author,
      category: post.category,
      creationDate: post.creationDate,
      updateDate: post.updateDate,
    };
  }
}

export class PostResponseDto {
  data: PostDto[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
  };

  static fromDomain(
    posts: Post[],
    total: number,
    page: number,
    limit: number,
  ): PostResponseDto {
    return {
      data: posts.map((post) => PostDto.fromDomain(post)),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
