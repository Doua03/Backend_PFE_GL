class NotifierDecorator {
  constructor(notifier) {
    this.wrappedNotifier = notifier;
  }

  async send(to, subject, message) {
    return await this.wrappedNotifier.send(to, subject, message);
  }
}

class SocketNotifierDecorator extends NotifierDecorator {
  constructor(notifier, io) {
    super(notifier);
    this.io = io;
  }

  async send(to, subject, message) {
    const result = await super.send(to, subject, message);
    if (this.io) {
      this.io.emit('notification', {
        to: to,
        title: subject,
        body: message,
        timestamp: new Date()
      });
    }
    return result;
  }
}

class LoggingNotifierDecorator extends NotifierDecorator {
  constructor(notifier) {
    super(notifier);
  }

  async send(to, subject, message) {
    const result = await super.send(to, subject, message);
    console.log(`[AUDIT] Notification envoyée à ${to} le ${new Date().toISOString()}`);
    return result;
  }
}

module.exports = { 
  SocketNotifierDecorator, 
  LoggingNotifierDecorator 
};
