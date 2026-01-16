import {
  Controller,
  Get,
  Put,
  Query,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  Body,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ListPostsService } from '@modules/posts/core/services/list-posts.service';
import { GetPostService } from '@modules/posts/core/services/get-post.service';
import { CreatePostService } from '@modules/posts/core/services/create-post.service';
import { UpdatePostService } from '@modules/posts/core/services/update-post.service';
import { GetPostCommentsService } from '@modules/posts/core/services/get-post-comments.service';
import { DeletePostService } from '@modules/posts/core/services/delete-post.service';
import { SearchPostsService } from '@modules/posts/core/services/search-posts.service';
import {
  ListPostsDto,
  PostResponseDto,
  PostDetailResponseDto,
  CommentDto,
  CreatePostDto,
  UpdatePostDto,
  SearchPostDto,
} from '../dtos';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';

import { UserRole } from '@common/types';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly listPostsService: ListPostsService,
    private readonly getPostService: GetPostService,
    private readonly createPostService: CreatePostService,
    private readonly updatePostService: UpdatePostService,
    private readonly getCommentsService: GetPostCommentsService,
    private readonly deletePostService: DeletePostService,
    private readonly searchPostsService: SearchPostsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: { id: string; role: UserRole },
  ): Promise<PostDetailResponseDto> {
    const post = await this.createPostService.execute({
      ...dto,
      authorId: user.id,
      authorRole: user.role,
    });
    return PostDetailResponseDto.fromDomain(post);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: { id: string },
  ): Promise<PostDetailResponseDto> {
    const post = await this.updatePostService.execute({
      ...dto,
      id,
      authorId: user.id,
    });
    return PostDetailResponseDto.fromDomain(post);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string },
  ): Promise<void> {
    await this.deletePostService.execute(id, user.id);
  }

  @Get()
  async findAll(@Query() query: ListPostsDto): Promise<PostResponseDto> {
    const { page, limit } = query;
    const result = await this.listPostsService.execute({ page, limit });

    return PostResponseDto.fromDomain(result.posts, result.total, page, limit);
  }

  @Get('search')
  async search(@Query() query: SearchPostDto): Promise<PostResponseDto> {
    const { q } = query;
    const posts = await this.searchPostsService.execute(q);
    return PostResponseDto.fromDomain(posts, posts.length, 1, 50);
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
