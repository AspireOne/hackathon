export class AiRateLimiter {
  constructor(interval) {
    this.interval = interval; // Minimum interval between AI calls
    this.lastCallTimestamp = 0; // Timestamp of the last AI call
    this.buffer = []; // Buffer for storing pending AI calls
    this.isProcessing = false; // To prevent concurrent processing
  }

  requestAiCall(aiCallFunction, ...args) {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      if (now - this.lastCallTimestamp >= this.interval && !this.isProcessing) {
        this.isProcessing = true;
        resolve(this.processAiCall(aiCallFunction, ...args));
      } else {
        this.buffer.push({ aiCallFunction, args, resolve, reject });
      }
    });
  }

  async processAiCall(aiCallFunction, ...args) {
    try {
      const result = await aiCallFunction(...args);
      this.lastCallTimestamp = Date.now();
      this.isProcessing = false;
      this.processBuffer();
      return result;
    } catch (error) {
      console.error('Error during AI call:', error);
      this.isProcessing = false;
      this.processBuffer();
      throw error; // rethrow the error to be handled by the caller
    }
  }

  processBuffer() {
    if (this.buffer.length > 0 && !this.isProcessing) {
      // Set a timeout to process the next request in the buffer after the interval
      const timeout = this.interval - (Date.now() - this.lastCallTimestamp);
      setTimeout(() => {
        const bufferedCall = this.buffer.shift();
        this.requestAiCall(bufferedCall.aiCallFunction, ...bufferedCall.args)
          .then(bufferedCall.resolve)
          .catch(bufferedCall.reject);
      }, timeout > 0 ? timeout : 0);
    }
  }
}
