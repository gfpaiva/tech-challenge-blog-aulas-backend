import { Test, TestingModule } from '@nestjs/testing';
import { CreatePostService } from './create-post.service';
import { IPostRepository } from '../ports/post.repository.port';
import { ICategoryRepository } from '../ports/category.repository.port';
import { ICachePort } from '@common/ports/cache.port';
import { Post } from '../entities/post.entity';
import { CategoryNotFoundError } from '../exceptions/category-not-found.error';
import { UserRole } from '@common/types';

describe('CreatePostService', () => {
    let service: CreatePostService;
    let postRepository: IPostRepository;
    let categoryRepository: ICategoryRepository;
    let cacheManager: ICachePort;

    const mockCategory = { id: 1, name: 'Tech' };
    const mockPost = new Post(
        'uuid-123',
        'Title',
        'Content',
        { id: 'user-1', name: 'John', role: 'PROFESSOR' as UserRole },
        mockCategory,
        new Date(),
        new Date(),
    );

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreatePostService,
                {
                    provide: IPostRepository,
                    useValue: {
                        create: jest.fn().mockResolvedValue(mockPost),
                    },
                },
                {
                    provide: ICategoryRepository,
                    useValue: {
                        findById: jest.fn().mockResolvedValue(mockCategory),
                    },
                },
                {
                    provide: ICachePort,
                    useValue: {
                        del: jest.fn().mockResolvedValue(undefined),
                        delMatch: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        service = module.get<CreatePostService>(CreatePostService);
        postRepository = module.get<IPostRepository>(IPostRepository);
        categoryRepository = module.get<ICategoryRepository>(ICategoryRepository);
        cacheManager = module.get<ICachePort>(ICachePort);
    });

    it('should create a post successfully and invalidate cache', async () => {
        const command = {
            authorId: 'user-1',
            title: 'Title',
            content: 'Content',
            categoryId: 1,
        };

        const result = await service.execute(command);

        expect(result).toBe(mockPost);
        expect(categoryRepository.findById).toHaveBeenCalledWith(1);
        expect(postRepository.create).toHaveBeenCalled();
        expect(cacheManager.delMatch).toHaveBeenCalledWith('posts:list:*');
    });

    it('should throw CategoryNotFoundError if category does not exist', async () => {
        jest.spyOn(categoryRepository, 'findById').mockResolvedValue(null);

        const command = {
            authorId: 'user-1',
            title: 'Title',
            content: 'Content',
            categoryId: 999,
        };

        await expect(service.execute(command)).rejects.toThrow(CategoryNotFoundError);
        expect(postRepository.create).not.toHaveBeenCalled();
        expect(cacheManager.del).not.toHaveBeenCalled();
    });
});
