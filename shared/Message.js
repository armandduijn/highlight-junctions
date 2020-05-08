/**
 * Message types
 *
 * @readonly
 * @enum {string}
 */
const MessageType = {
  NOTIFY_CHANGE: 'NOTIFY_CHANGE',
};

class Message {
  /**
   * Creates a Message
   *
   * @param {MessageType} type - The message type
   * @param {*} data - The optional payload
   */
  constructor(type, data = null) {
    this.type = type;
    this.data = data;
  }
}

export {Message, MessageType};
