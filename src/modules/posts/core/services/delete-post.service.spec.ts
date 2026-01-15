import { Test, TestingModule } from '@nestjs/testing';
import { DeletePostService } from './delete-post.service';
import { IPostRepository } from '../ports/post.repository.port';
import { ICachePort } from '@common/ports/cache.port';
import { PostNotFoundError } from '../exceptions/post-not-found.error';
import { ForbiddenActionException } from '../exceptions/forbidden-action.exception';
import { Post } from '../entities/post.entity';

describe('DeletePostService', () => {
    let service: DeletePostService;
    let postRepository: IPostRepository;
    let cache: ICachePort;

    const mockPostRepository = {
        findById: jest.fn(),
        delete: jest.fn(),
    };

    const mockCacheService = {
        del: jest.fn(),
        delMatch: jest.fn(),
    };

    const mockPost: Post = {
        id: 'post-id',
        title: 'Test Post',
        content: 'Content',
        author: { id: 'author-id', name: 'Author', role: 'PROFESSOR' },
        category: { id: 1, name: 'Category' },
        creationDate: new Date(),
        updateDate: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeletePostService,
                { provide: IPostRepository, useValue: mockPostRepository },
                { provide: ICachePort, useValue: mockCacheService },
            ],
        }).compile();

        service = module.get<DeletePostService>(DeletePostService);
        postRepository = module.get<IPostRepository>(IPostRepository);
        cache = module.get<ICachePort>(ICachePort);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should delete post successfully when user is author', async () => {
        mockPostRepository.findById.mockResolvedValue(mockPost);
        mockPostRepository.delete.mockResolvedValue(undefined);

        await service.execute('post-id', 'author-id');

        expect(postRepository.findById).toHaveBeenCalledWith('post-id');
        expect(postRepository.delete).toHaveBeenCalledWith('post-id');
        expect(cache.del).toHaveBeenCalledWith('post:detail:post-id');
        expect(cache.delMatch).toHaveBeenCalledWith('posts:list:*');
    });

    it('should throw PostNotFoundError if post does not exist', async () => {
        mockPostRepository.findById.mockResolvedValue(null);

        await expect(service.execute('post-id', 'author-id')).rejects.toThrow(
            new PostNotFoundError('post-id'),
        );

        expect(postRepository.findById).toHaveBeenCalledWith('post-id');
        expect(postRepository.delete).not.toHaveBeenCalled();
        expect(cache.del).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenActionException if user is not author', async () => {
        mockPostRepository.findById.mockResolvedValue(mockPost);

        await expect(service.execute('post-id', 'other-user')).rejects.toThrow(
            ForbiddenActionException,
        );

        expect(postRepository.findById).toHaveBeenCalledWith('post-id');
        expect(postRepository.delete).not.toHaveBeenCalled();
    });
});
