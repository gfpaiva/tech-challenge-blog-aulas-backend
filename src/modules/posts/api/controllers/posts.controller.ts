import {
  Controller,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ListPostsService } from '@modules/posts/core/services/list-posts.service';
import { GetPostService } from '@modules/posts/core/services/get-post.service';
import { CreatePostService } from '@modules/posts/core/services/create-post.service';
import { GetPostCommentsService } from '@modules/posts/core/services/get-post-comments.service';
import {
  ListPostsDto,
  PostResponseDto,
  PostDetailResponseDto,
  CommentDto,
  CreatePostDto,
} from '../dtos';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly listPostsService: ListPostsService,
    private readonly getPostService: GetPostService,
    private readonly createPostService: CreatePostService,
    private readonly getCommentsService: GetPostCommentsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: { id: string },
  ): Promise<PostDetailResponseDto> {
    const post = await this.createPostService.execute({
      ...dto,
      authorId: user.id,
    });
    return PostDetailResponseDto.fromDomain(post);
  }

  @Get()
  async findAll(@Query() query: ListPostsDto): Promise<PostResponseDto> {
    const { page, limit } = query;
    const result = await this.listPostsService.execute({ page, limit });

    return PostResponseDto.fromDomain(result.posts, result.total, page, limit);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PostDetailResponseDto> {
    const post = await this.getPostService.execute(id);
    return PostDetailResponseDto.fromDomain(post);
  }

  @Get(':id/comments')
  async getComments(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CommentDto[]> {
    const result = await this.getCommentsService.execute(id);
    return result.map((comment) => CommentDto.fromDomain(comment));
  }
}
