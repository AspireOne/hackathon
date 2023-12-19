export class RateLimiter {
  constructor(rateLimit, interval) {
    this.rateLimit = rateLimit; // Messages per interval
    this.interval = interval; // Interval in milliseconds
    this.users = new Map(); // Stores user message timestamps
  }

  attempt(userId) {
    if (!this.users.has(userId)) {
      this.users.set(userId, []);
    }

    const now = Date.now();
    const timestamps = this.users.get(userId);
    const messagesInInterval = timestamps.filter(timestamp => now - timestamp < this.interval);

    if (messagesInInterval.length < this.rateLimit) {
      timestamps.push(now); // Record new timestamp
      if (timestamps.length > this.rateLimit) {
        timestamps.shift(); // Keep the array size equal to rateLimit
      }
      return { allowed: true};
    } else {
      // Rate limit exceeded
      return { allowed: false };
    }
  }
}
