import { Test, TestingModule } from '@nestjs/testing';
import { CreateCommentService } from './create-comment.service';
import { ICommentRepository } from '../ports/comment.repository.port';
import { IPostRepository } from '../ports/post.repository.port';
import { PostNotFoundError } from '../exceptions/post-not-found.error';
import { UserRole } from '@common/types';
import { Comment } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';

describe('CreateCommentService', () => {
  let service: CreateCommentService;
  let commentRepository: ICommentRepository;
  let postRepository: IPostRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCommentService,
        {
          provide: ICommentRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: IPostRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreateCommentService>(CreateCommentService);
    commentRepository = module.get<ICommentRepository>(ICommentRepository);
    postRepository = module.get<IPostRepository>(IPostRepository);
  });

  it('should create a comment successfully', async () => {
    const params = {
      content: 'Great post!',
      postId: 'post-1',
      authorId: 'user-1',
      authorRole: 'ALUNO' as UserRole,
    };

    const mockPost = { id: 'post-1' } as Post;
    jest.spyOn(postRepository, 'findById').mockResolvedValue(mockPost);

    const createdComment = new Comment(
      'comment-1',
      params.content,
      params.postId,
      {
        id: params.authorId,
        name: 'John Doe',
        role: params.authorRole,
      },
      new Date(),
    );

    jest.spyOn(commentRepository, 'create').mockResolvedValue(createdComment);

    const result = await service.execute(params);

    expect(postRepository.findById).toHaveBeenCalledWith(params.postId);
    expect(commentRepository.create).toHaveBeenCalledWith(expect.any(Comment));
    expect(result).toBeDefined();
    expect(result.content).toBe(params.content);
  });

  it('should throw PostNotFoundError if post does not exist', async () => {
    const params = {
      content: 'Great post!',
      postId: 'post-1',
      authorId: 'user-1',
      authorRole: 'ALUNO' as UserRole,
    };

    jest.spyOn(postRepository, 'findById').mockResolvedValue(null);

    await expect(service.execute(params)).rejects.toThrow(PostNotFoundError);
  });
});
