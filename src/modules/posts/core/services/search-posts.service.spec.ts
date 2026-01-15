import { Test, TestingModule } from '@nestjs/testing';
import { SearchPostsService } from './search-posts.service';
import { IPostRepository } from '../ports/post.repository.port';
import { Post } from '../entities/post.entity';

describe('SearchPostsService', () => {
  let service: SearchPostsService;
  let repo: IPostRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchPostsService,
        {
          provide: IPostRepository,
          useValue: {
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SearchPostsService>(SearchPostsService);
    repo = module.get<IPostRepository>(IPostRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call repository.search with correct term', async () => {
    const term = 'test';
    const expectedPosts: Post[] = [
      { id: '1', title: 'test post', content: 'content' } as Post,
    ];

    jest.spyOn(repo, 'search').mockResolvedValue(expectedPosts);

    const result = await service.execute(term);

    expect(repo.search).toHaveBeenCalledWith(term);
    expect(result).toEqual(expectedPosts);
  });
});
