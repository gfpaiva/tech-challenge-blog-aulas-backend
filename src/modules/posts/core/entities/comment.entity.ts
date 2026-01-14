import { UserRole } from '@common/types';

export class Comment {
  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly postId: string,
    public readonly author: {
      id: string;
      name: string;
      role: UserRole;
    },

    public readonly creationDate: Date,
  ) {}
}
