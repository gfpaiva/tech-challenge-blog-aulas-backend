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

    static fromDomain(post: Post): PostDto {
        return {
            id: post.id,
            title: post.title,
            content: post.content,
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

    static fromDomain(posts: Post[], total: number, page: number, limit: number): PostResponseDto {
        return {
            data: posts.map(PostDto.fromDomain),
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit),
            },
        };
    }
}
