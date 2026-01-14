import { Controller, Get, Query } from '@nestjs/common';
import { ListPostsService } from '@modules/posts/core/services/list-posts.service';
import { ListPostsDto } from '../dtos/list-posts.dto';
import { PostResponseDto } from '../dtos/post-response.dto';

@Controller('posts')
export class PostsController {
    constructor(private readonly listPostsService: ListPostsService) { }

    @Get()
    async findAll(@Query() query: ListPostsDto): Promise<PostResponseDto> {
        const { page, limit } = query;
        const result = await this.listPostsService.execute({ page, limit });

        return PostResponseDto.fromDomain(result.posts, result.total, page, limit);
    }
}
