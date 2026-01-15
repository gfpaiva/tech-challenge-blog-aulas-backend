import { Test, TestingModule } from '@nestjs/testing';
import { ListPostsService } from './list-posts.service';
import {
  IPostRepository,
  PaginatedPostsResult,
} from '../ports/post.repository.port';
import { ICachePort } from '@common/ports/cache.port';

describe('ListPostsService', () => {
  let service: ListPostsService;
  let postRepository: IPostRepository;
  let cache: ICachePort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListPostsService,
        {
          provide: IPostRepository,
          useValue: {
            findAll: jest.fn(),
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

    service = module.get<ListPostsService>(ListPostsService);
    postRepository = module.get<IPostRepository>(IPostRepository);
    cache = module.get<ICachePort>(ICachePort);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const params = { page: 1, limit: 10 };
    const cacheKey = `posts:list:page:1:limit:10`;
    const mockPosts: PaginatedPostsResult = {
      posts: [
        {
          id: 'post-1',
          title: 'Post 1',
          content: 'Content 1',
          author: { id: 'u1', name: 'N1', role: 'PROFESSOR' },
          category: { id: 1, name: 'C1' },
          creationDate: new Date(),
          updateDate: new Date(),
        },
      ] as any,
      total: 1,
    };

    it('should return cached data if available', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(JSON.stringify(mockPosts));
      const result = await service.execute(params);

      expect(cache.get).toHaveBeenCalledWith(cacheKey);
      expect(postRepository.findAll).not.toHaveBeenCalled();
      expect(result.total).toEqual(mockPosts.total);
      expect(result.posts[0].id).toEqual(mockPosts.posts[0].id);
    });

    it('should fetch from repository and cache if not in cache', async () => {
      jest.spyOn(cache, 'get').mockResolvedValue(null);
      jest.spyOn(postRepository, 'findAll').mockResolvedValue(mockPosts);

      const result = await service.execute(params);

      expect(cache.get).toHaveBeenCalledWith(cacheKey);
      expect(postRepository.findAll).toHaveBeenCalledWith(params);
      expect(cache.set).toHaveBeenCalledWith(
        cacheKey,
        JSON.stringify(mockPosts),
        3600,
      );
      expect(result).toEqual(mockPosts);
    });
  });
});
