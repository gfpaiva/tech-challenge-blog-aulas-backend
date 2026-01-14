export interface Category {
    id: number;
    name: string;
}

export abstract class ICategoryRepository {
    abstract findById(id: number): Promise<Category | null>;
}
