import CacheEntry from "./cache-entry";

export default class CacheStore {
  private data: Map<string, CacheEntry> = new Map<string, CacheEntry>();

  public get<T = object>(key: string): CacheEntry<T> {
    if (!this.has(key)) {
      throw new Error(`Key ${key} is not cached`);
    }

    return this.data.get(key);
  }

  public set<T = object>(key: string, value: T): void {
    if (this.has(key)) {
      this.data.delete(key);
    }

    const entry = new CacheEntry<T>(value);

    this.data.set(key, entry);
  }

  public has(key: string): boolean {
    return this.data.has(key);
  }

  public isFresh(key: string): boolean {
    return this.has(key) && !this.get(key).isExpired;
  }
}
