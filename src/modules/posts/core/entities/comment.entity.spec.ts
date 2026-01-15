import { Comment } from './comment.entity';
import { UserRole } from '@common/types';

describe('Comment Entity', () => {
  it('should create a comment instance', () => {
    const comment = new Comment(
      'comment-1',
      'This is a comment',
      'post-1',
      {
        id: 'user-1',
        name: 'User One',
        role: 'ALUNO' as UserRole,
      },
      new Date(),
    );

    expect(comment.id).toBe('comment-1');
    expect(comment.content).toBe('This is a comment');
    expect(comment.postId).toBe('post-1');
    expect(comment.author.id).toBe('user-1');
  });
});
