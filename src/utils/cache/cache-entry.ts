const getTimestamp = () => Date.now() / 1000;

export default class CacheEntry<T = any> {
  public readonly value: T;
  public readonly createdAt: number;
  public readonly expiresAt: number;

  constructor(value: T, expiresAt: number = 3600) {
    const now = getTimestamp();

    this.value = value;
    this.expiresAt = now + expiresAt;
    this.createdAt = now;
  }

  get isExpired(): boolean {
    return getTimestamp() > this.expiresAt;
  }
}
