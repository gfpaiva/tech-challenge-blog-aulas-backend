export abstract class ICachePort {
    abstract get(key: string): Promise<string | null>;
    abstract set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    abstract del(key: string): Promise<void>;
}
