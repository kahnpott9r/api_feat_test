import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import * as amqp from 'amqplib';
import { EventEmitter } from 'events';

export class CustomRMQClient extends ClientProxy {
  unwrap<T>(): T {
    throw new Error('Method not implemented.');
  }
  private server: amqp.ChannelModel;
  private channel: amqp.Channel;
  private readonly queue: string;
  private isConnected = false;
  private reconnectDelay = 300000; // 5 minutes delay before reconnecting
  private eventEmitter = new EventEmitter();

  constructor(
    private readonly options: {
      urls: string[];
      queue: string;
      heartbeat?: number;
    },
  ) {
    super();
    this.queue = options.queue;
  }

  async connect(): Promise<void> {
    try {
      const connectionOptions = {
        heartbeat: this.options.heartbeat ?? 0, // Default to 0 if not provided
      };

      this.server = await amqp.connect(this.options.urls[0], connectionOptions);
      this.server.on('close', () => this.handleDisconnect());
      this.server.on('error', (err) => this.handleError(err));

      this.channel = await this.server.createChannel();
      await this.channel.checkQueue(this.queue);

      this.isConnected = true;
      this.eventEmitter.emit('connected');
      console.log('RabbitMQ connection established');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ', { err: error });
      await this.reconnect();
    }
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.server) {
      await this.server.close();
    }
  }

  async reconnect() {
    console.log(
      `Reconnecting to RabbitMQ in ${this.reconnectDelay / 1000} seconds...`,
    );
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('Failed to reconnect to RabbitMQ', error);
        await this.reconnect();
      }
    }, this.reconnectDelay);
  }

  handleDisconnect() {
    console.error('RabbitMQ connection closed');
    this.isConnected = false;
    this.eventEmitter.emit('disconnected');
    this.reconnect().then();
  }

  handleError(error: any) {
    console.error('RabbitMQ connection error:', error);
    this.isConnected = false;
    this.eventEmitter.emit('disconnected');
    this.reconnect().then();
  }

  on(event: string, listener: (...args: any[]) => void) {
    this.eventEmitter.on(event, listener);
  }

  getChannel(): Promise<amqp.Channel> {
    return Promise.resolve(this.channel);
  }

  getQueue(): string {
    return this.queue;
  }

  async dispatchEvent<T = any>(packet: ReadPacket): Promise<T> {
    const message = JSON.stringify(packet);

    // Send the message to the queue
    this.channel.sendToQueue(this.queue, Buffer.from(message));

    // Return a resolved promise with the appropriate type
    return {} as T;
  }

  protected publish(
    packet: ReadPacket,
    callback: (packet: WritePacket) => void,
  ): () => void {
    try {
      const success = this.channel.sendToQueue(
        this.queue,
        Buffer.from(JSON.stringify(packet)),
      );
      if (success) {
        callback({ response: null });
      } else {
        callback({ err: new Error('Message was not sent to the queue') });
      }
    } catch (err) {
      callback({ err });
    }
    return () => {
      // No-op function for unsubscribe
    };
  }
}
