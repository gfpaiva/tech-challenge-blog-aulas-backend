import { Test, TestingModule } from '@nestjs/testing';
import { GetPostService } from './get-post.service';
import { IPostRepository } from '../ports/post.repository.port';
import { ICachePort } from '@common/ports/cache.port';
import { PostNotFoundError } from '../exceptions/post-not-found.error';
import { Post } from '../entities/post.entity';

describe('GetPostService', () => {
  let service: GetPostService;
  let repository: jest.Mocked<IPostRepository>;
  let cache: jest.Mocked<ICachePort>;

  const mockPost: Post = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Post',
    content: 'Test content',
    author: { id: 'user-1', name: 'Author', role: 'PROFESSOR' },
    category: { id: 1, name: 'Category' },
    creationDate: new Date(),
    updateDate: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPostService,
        {
          provide: IPostRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: ICachePort,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GetPostService>(GetPostService);
    repository = module.get(IPostRepository);
    cache = module.get(ICachePort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return post from cache if available', async () => {
    cache.get.mockResolvedValue(JSON.stringify(mockPost));

    const result = await service.execute(mockPost.id);

    expect(result).toEqual(mockPost);
    expect(cache.get).toHaveBeenCalledWith(`post:detail:${mockPost.id}`);
    expect(repository.findById).not.toHaveBeenCalled();
  });

  it('should return post from repository and save to cache if not in cache', async () => {
    cache.get.mockResolvedValue(null);
    repository.findById.mockResolvedValue(mockPost);

    const result = await service.execute(mockPost.id);

    expect(result).toEqual(mockPost);
    expect(repository.findById).toHaveBeenCalledWith(mockPost.id);
    expect(cache.set).toHaveBeenCalledWith(
      `post:detail:${mockPost.id}`,
      JSON.stringify(mockPost),
      3600,
    );
  });

  it('should throw PostNotFoundError if post does not exist', async () => {
    cache.get.mockResolvedValue(null);
    repository.findById.mockResolvedValue(null);

    await expect(service.execute('unknown-id')).rejects.toThrow(
      PostNotFoundError,
    );
  });
});
