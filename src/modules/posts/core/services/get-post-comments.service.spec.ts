import { Test, TestingModule } from '@nestjs/testing';
import { GetPostCommentsService } from './get-post-comments.service';
import { ICommentRepository } from '../ports/comment.repository.port';
import { GetPostService } from './get-post.service';
import { PostNotFoundError } from '../exceptions/post-not-found.error';

describe('GetPostCommentsService', () => {
  let service: GetPostCommentsService;
  let commentRepository: jest.Mocked<ICommentRepository>;
  let getPostService: jest.Mocked<GetPostService>;

  const postId = 'post-id';
  const mockComments = [];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPostCommentsService,
        {
          provide: ICommentRepository,
          useValue: {
            findByPostId: jest.fn(),
          },
        },
        {
          provide: GetPostService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GetPostCommentsService>(GetPostCommentsService);
    commentRepository = module.get(ICommentRepository);
    getPostService = module.get(GetPostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return comments if post exists', async () => {
    getPostService.execute.mockResolvedValue(null as any);
    commentRepository.findByPostId.mockResolvedValue(mockComments);

    const result = await service.execute(postId);

    expect(getPostService.execute).toHaveBeenCalledWith(postId);
    expect(commentRepository.findByPostId).toHaveBeenCalledWith(postId);
    expect(result).toEqual(mockComments);
  });

  it('should throw PostNotFoundError if post does not exist', async () => {
    getPostService.execute.mockRejectedValue(new PostNotFoundError(postId));

    await expect(service.execute(postId)).rejects.toThrow(PostNotFoundError);
    expect(commentRepository.findByPostId).not.toHaveBeenCalled();
  });
});
