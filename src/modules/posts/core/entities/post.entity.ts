export class Post {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly content: string,
        public readonly author: {
            id: string;
            name: string;
            role: 'PROFESSOR' | 'ALUNO';
        },
        public readonly category: {
            id: number;
            name: string;
        },
        public readonly creationDate: Date,
        public readonly updateDate: Date,
    ) { }
}
