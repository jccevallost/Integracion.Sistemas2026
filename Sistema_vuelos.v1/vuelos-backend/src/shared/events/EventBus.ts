import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';
import amqp, { type Channel, type ChannelModel, type ConsumeMessage } from 'amqplib';

export interface DomainEvent<P = unknown> {
  eventId: string;
  eventType: string;
  eventVersion: number;
  occurredAt: string;
  producer: string;
  correlationId?: string;
  payload: P;
}

const BUS_INSTANCE_ID = randomUUID();

class EventBusWithRabbitMq extends EventEmitter {
  private connection?: ChannelModel;
  private channel?: Channel;
  private connecting?: Promise<Channel | null>;
  private consuming = false;
  private readonly processedEventIds = new Set<string>();

  private readonly enabled =
    process.env.EVENT_BUS_DRIVER === 'rabbitmq' || Boolean(process.env.RABBITMQ_URL);
  private readonly url = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';
  private readonly exchange = process.env.RABBITMQ_EXCHANGE ?? 'vuelos.events';
  private readonly retryExchange =
    process.env.RABBITMQ_RETRY_EXCHANGE ?? `${this.exchange}.retry`;
  private readonly dlqExchange =
    process.env.RABBITMQ_DLQ_EXCHANGE ?? `${this.exchange}.dlq`;
  private readonly retryDelayMs = Number(process.env.RABBITMQ_RETRY_DELAY_MS ?? 5000);
  private readonly maxRetries = Number(process.env.RABBITMQ_MAX_RETRIES ?? 3);
  private readonly idempotencyWindow = Number(process.env.EVENT_BUS_IDEMPOTENCY_WINDOW ?? 1000);
  private readonly queueName =
    process.env.RABBITMQ_QUEUE ??
    `${process.env.OTEL_SERVICE_NAME ?? process.env.SERVICE_NAME ?? 'vuelos-service'}.events`;
  private readonly retryQueueName = `${this.queueName}.retry`;
  private readonly dlqQueueName = `${this.queueName}.dlq`;

  publish<P>(event: Omit<DomainEvent<P>, 'eventId' | 'occurredAt'>): void {
    const full: DomainEvent<P> = {
      eventId: randomUUID(),
      occurredAt: new Date().toISOString(),
      ...event,
    };

    this.dispatch(full, false);

    if (this.enabled) {
      void this.publishToRabbitMq(full);
    }
  }

  subscribe<P>(eventType: string, handler: (e: DomainEvent<P>) => void): void {
    this.on(eventType, handler);
    if (this.enabled) {
      void this.ensureConsumer();
    }
  }

  subscribeAll(handler: (e: DomainEvent) => void): void {
    this.on('*', handler);
    if (this.enabled) {
      void this.ensureConsumer();
    }
  }

  private async connect(): Promise<Channel | null> {
    if (!this.enabled) return null;
    if (this.channel) return this.channel;
    if (this.connecting) return this.connecting;

    this.connecting = (async () => {
      try {
        this.connection = await amqp.connect(this.url);
        this.connection.on('error', (err) => {
          console.error(`[event-bus] RabbitMQ connection error: ${err.message}`);
        });
        this.connection.on('close', () => {
          console.warn('[event-bus] RabbitMQ connection closed; using in-process fallback');
          this.connection = undefined;
          this.channel = undefined;
          this.connecting = undefined;
          this.consuming = false;
        });

        this.channel = await this.connection.createChannel();
        await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
        await this.channel.assertExchange(this.retryExchange, 'topic', { durable: true });
        await this.channel.assertExchange(this.dlqExchange, 'topic', { durable: true });
        console.log(`[event-bus] RabbitMQ connected exchange=${this.exchange}`);
        return this.channel;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[event-bus] RabbitMQ unavailable (${msg}); using in-process fallback`);
        this.connection = undefined;
        this.channel = undefined;
        this.connecting = undefined;
        return null;
      }
    })();

    return this.connecting;
  }

  private async publishToRabbitMq(event: DomainEvent): Promise<void> {
    const channel = await this.connect();
    if (!channel) return;

    try {
      channel.publish(
        this.exchange,
        event.eventType,
        Buffer.from(JSON.stringify(event)),
        {
          appId: BUS_INSTANCE_ID,
          contentType: 'application/json',
          messageId: event.eventId,
          persistent: true,
          timestamp: Math.floor(Date.now() / 1000),
          type: event.eventType,
          headers: { retryCount: 0 },
        },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[event-bus] RabbitMQ publish failed: ${msg}`);
    }
  }

  private async ensureConsumer(): Promise<void> {
    if (this.consuming) return;
    const channel = await this.connect();
    if (!channel) return;

    try {
      await channel.assertQueue(this.queueName, { durable: true });
      await channel.assertQueue(this.retryQueueName, {
        durable: true,
        messageTtl: this.retryDelayMs,
        deadLetterExchange: this.exchange,
      });
      await channel.assertQueue(this.dlqQueueName, { durable: true });
      await channel.bindQueue(this.queueName, this.exchange, '#');
      await channel.bindQueue(this.retryQueueName, this.retryExchange, '#');
      await channel.bindQueue(this.dlqQueueName, this.dlqExchange, '#');
      await channel.consume(this.queueName, (message) => this.handleMessage(message), {
        noAck: false,
      });
      this.consuming = true;
      console.log(`[event-bus] RabbitMQ consuming queue=${this.queueName}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[event-bus] RabbitMQ consumer failed: ${msg}`);
    }
  }

  private handleMessage(message: ConsumeMessage | null): void {
    if (!message || !this.channel) return;
    if (message.properties.appId === BUS_INSTANCE_ID) {
      this.channel.ack(message);
      return;
    }

    try {
      const event = JSON.parse(message.content.toString('utf-8')) as DomainEvent;
      if (this.wasProcessed(event.eventId)) {
        this.channel.ack(message);
        return;
      }
      this.dispatch(event, true);
      this.markProcessed(event.eventId);
      this.channel.ack(message);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.retryOrDeadLetter(message, msg);
    }
  }

  private dispatch(event: DomainEvent, rethrow: boolean): void {
    try {
      this.emit(event.eventType, event);
      this.emit('*', event);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[event-bus] Local handler failed: ${msg}`);
      if (rethrow) throw err;
    }
  }

  private wasProcessed(eventId: string): boolean {
    return this.processedEventIds.has(eventId);
  }

  private markProcessed(eventId: string): void {
    this.processedEventIds.add(eventId);
    if (this.processedEventIds.size <= this.idempotencyWindow) return;
    const oldest = this.processedEventIds.values().next().value as string | undefined;
    if (oldest) this.processedEventIds.delete(oldest);
  }

  private retryOrDeadLetter(message: ConsumeMessage, reason: string): void {
    if (!this.channel) return;
    const retryCount = Number(message.properties.headers?.retryCount ?? 0);
    const routingKey = message.fields.routingKey || message.properties.type || 'unknown';
    const nextRetryCount = retryCount + 1;
    const headers = {
      ...(message.properties.headers ?? {}),
      retryCount: nextRetryCount,
      lastError: reason,
    };

    if (retryCount < this.maxRetries) {
      this.channel.publish(this.retryExchange, routingKey, message.content, {
        appId: message.properties.appId,
        contentType: message.properties.contentType,
        messageId: message.properties.messageId,
        persistent: true,
        timestamp: Math.floor(Date.now() / 1000),
        type: message.properties.type,
        headers,
      });
      this.channel.ack(message);
      console.warn(
        `[event-bus] Event retry scheduled routingKey=${routingKey} retry=${nextRetryCount}/${this.maxRetries}: ${reason}`,
      );
      return;
    }

    this.channel.publish(this.dlqExchange, routingKey, message.content, {
      appId: message.properties.appId,
      contentType: message.properties.contentType,
      messageId: message.properties.messageId,
      persistent: true,
      timestamp: Math.floor(Date.now() / 1000),
      type: message.properties.type,
      headers,
    });
    this.channel.ack(message);
    console.error(`[event-bus] Event moved to DLQ routingKey=${routingKey}: ${reason}`);
  }
}

export const EventBus = new EventBusWithRabbitMq();
EventBus.setMaxListeners(100);
