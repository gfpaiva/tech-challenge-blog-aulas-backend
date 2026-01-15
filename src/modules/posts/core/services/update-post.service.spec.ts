import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePostService } from './update-post.service';
import { IPostRepository } from '../ports/post.repository.port';
import { ICategoryRepository } from '../ports/category.repository.port';
import { ICachePort } from '@common/ports/cache.port';
import { Post } from '../entities/post.entity';
import { PostNotFoundError } from '../exceptions/post-not-found.error';
import { ForbiddenActionException } from '../exceptions/forbidden-action.exception';
import { CategoryNotFoundError } from '../exceptions/category-not-found.error';
import { UserRole } from '@common/types';

describe('UpdatePostService', () => {
    let service: UpdatePostService;
    let postRepo: IPostRepository;
    let categoryRepo: ICategoryRepository;
    let cache: ICachePort;

    const mockPost: Post = {
        id: 'post-id',
        title: 'Old Title',
        content: 'Old Content',
        author: {
            id: 'author-id',
            name: 'Author Name',
            role: 'PROFESSOR' as UserRole,
        },
        category: {
            id: 1,
            name: 'Category Name',
        },
        creationDate: new Date(),
        updateDate: new Date(),
    };

    const mockCategory = {
        id: 2,
        name: 'New Category',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdatePostService,
                {
                    provide: IPostRepository,
                    useValue: {
                        findById: jest.fn(),
                        update: jest.fn(),
                    },
                },
                {
                    provide: ICategoryRepository,
                    useValue: {
                        findById: jest.fn(),
                    },
                },
                {
                    provide: ICachePort,
                    useValue: {
                        del: jest.fn(),
                        delMatch: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<UpdatePostService>(UpdatePostService);
        postRepo = module.get<IPostRepository>(IPostRepository);
        categoryRepo = module.get<ICategoryRepository>(ICategoryRepository);
        cache = module.get<ICachePort>(ICachePort);
    });

    it('should update post successfully and invalidate cache', async () => {
        (postRepo.findById as jest.Mock).mockResolvedValue(mockPost);
        (categoryRepo.findById as jest.Mock).mockResolvedValue(mockCategory);
        (postRepo.update as jest.Mock).mockResolvedValue({
            ...mockPost,
            title: 'New Title',
            category: mockCategory,
        });

        const result = await service.execute({
            id: 'post-id',
            authorId: 'author-id',
            title: 'New Title',
            categoryId: 2,
        });

        expect(postRepo.findById).toHaveBeenCalledWith('post-id');
        expect(categoryRepo.findById).toHaveBeenCalledWith(2);
        expect(postRepo.update).toHaveBeenCalledWith('post-id', expect.objectContaining({
            title: 'New Title',
            category: { id: 2 },
        }));
        expect(cache.del).toHaveBeenCalledWith('post:detail:post-id');
        expect(cache.delMatch).toHaveBeenCalledWith('posts:list:*');
        expect(result.title).toBe('New Title');
        expect(result.category.id).toBe(2);
    });

    it('should throw PostNotFoundError if post does not exist', async () => {
        (postRepo.findById as jest.Mock).mockResolvedValue(null);

        await expect(service.execute({
            id: 'post-id',
            authorId: 'author-id',
        })).rejects.toThrow(PostNotFoundError);
    });

    it('should throw ForbiddenActionException if user is not the author', async () => {
        (postRepo.findById as jest.Mock).mockResolvedValue(mockPost);

        await expect(service.execute({
            id: 'post-id',
            authorId: 'other-author',
        })).rejects.toThrow(ForbiddenActionException);
    });

    it('should throw CategoryNotFoundError if new category does not exist', async () => {
        (postRepo.findById as jest.Mock).mockResolvedValue(mockPost);
        (categoryRepo.findById as jest.Mock).mockResolvedValue(null);

        await expect(service.execute({
            id: 'post-id',
            authorId: 'author-id',
            categoryId: 999,
        })).rejects.toThrow(CategoryNotFoundError);
    });
});
