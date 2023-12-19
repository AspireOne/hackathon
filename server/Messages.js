/**
 * Messages class is used to manage a list of messages with a maximum limit.
 */
export class Messages {
  /**
   * The maximum number of messages that can be stored.
   * @type {number}
   */
  maxMessages = 50;

  /**
   * The list of messages.
   * @type {Array}
   */
  messages = [];

  /**
   * Creates a new Messages instance.
   * @param {Object} params - The parameters for creating a Messages instance.
   * @param {number} params.max - The maximum number of messages that can be stored.
   */
  constructor({ max }) {
    this.messages = [];
    this.maxMessages = max;
  }

  /**
   * Adds a new message to the list. If the list exceeds the maximum limit, the oldest message is removed.
   * @param {Object} message - The message to add.
   */
  add(message) {
    this.messages.push(message);
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
  }

  /**
   * Gets a specified number of recent messages. If no amount is specified, all messages are returned.
   * @param {number} [amount] - The number of messages to get.
   * @returns {Array} The list of messages.
   */
  get(amount) {
    return amount ? this.messages.slice(-amount) : this.messages;
  }

  /**
   * Gets the last message from the list.
   * @returns {Object} The last message.
   */
  getLast() {
    return this.messages[this.messages.length - 1];
  }
}