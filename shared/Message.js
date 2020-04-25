const MessageType = {
  NOTIFY_CHANGE: 'NOTIFY_CHANGE',
};

class Message {
  constructor(type, data = null) {
    this.type = type;
    this.data = data;
  }
}

export {Message, MessageType};
