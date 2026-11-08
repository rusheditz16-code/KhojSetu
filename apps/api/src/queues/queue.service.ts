import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { TelemetryService } from '../telemetry/telemetry.service';

export enum JobType {
  NOTIFICATION_DISPATCH = 'NOTIFICATION_DISPATCH',
  IMAGE_PROCESS = 'IMAGE_PROCESS',
  PGVECTOR_EMBEDDING = 'PGVECTOR_EMBEDDING',
}

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueService.name);
  private redisConnection: Redis | null = null;
  private backgroundQueue: Queue | null = null;
  private worker: Worker | null = null;
  public isRedisActive = false;

  constructor(private readonly telemetry: TelemetryService) {}

  async onModuleInit() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      this.redisConnection = new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        lazyConnect: true,
        connectTimeout: 2000,
      });

      await this.redisConnection.connect();
      this.isRedisActive = true;
      this.logger.log('⚡ Connected to Redis for BullMQ background job processing.');

      // Initialize BullMQ Queue
      this.backgroundQueue = new Queue('khojsetu-jobs', {
        connection: this.redisConnection,
      });

      // Initialize BullMQ Worker
      this.worker = new Worker(
        'khojsetu-jobs',
        async (job: Job) => {
          return this.processJob(job);
        },
        { connection: this.redisConnection },
      );

      this.worker.on('completed', (job: Job) => {
        this.logger.log(`Job ${job.id} (${job.name}) completed successfully.`);
      });

      this.worker.on('failed', (job: Job, err: Error) => {
        this.logger.error(`Job ${job?.id} (${job?.name}) failed: ${err.message}`);
      });
    } catch (err) {
      this.isRedisActive = false;
      this.logger.warn(`Redis not available (${err.message}). Using synchronous inline job execution.`);
    }
  }

  async addJob(type: JobType, data: any): Promise<void> {
    if (this.isRedisActive && this.backgroundQueue) {
      await this.backgroundQueue.add(type, data, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
      });
      this.logger.log(`📥 Enqueued BullMQ job: ${type}`);
    } else {
      // Synchronous fallback
      await this.processJob({ name: type, data, id: 'sync-inline' } as Job);
    }
  }

  private async processJob(job: Job): Promise<any> {
    return this.telemetry.traceAsync(`bullmq.worker.${job.name}`, async (span) => {
      span.setAttribute('job.id', job.id || 'unknown');
      span.setAttribute('job.name', job.name);

      switch (job.name) {
        case JobType.NOTIFICATION_DISPATCH:
          this.logger.log(`Processing async notification dispatch: ${job.data?.title}`);
          return { dispatched: true, to: job.data?.userId };

        case JobType.IMAGE_PROCESS:
          this.logger.log(`Processing image optimization job for key: ${job.data?.photoKey}`);
          return { optimized: true, bytes: job.data?.size };

        case JobType.PGVECTOR_EMBEDDING:
          this.logger.log(`Generating pgvector text/image embedding for item: ${job.data?.itemId}`);
          // Simulated 128-dimensional embedding generation
          const vector = Array.from({ length: 128 }, () => Math.random().toFixed(4));
          return { vectorGenerated: true, dimensions: 128 };

        default:
          this.logger.warn(`Unknown job type: ${job.name}`);
          return { unhandled: true };
      }
    });
  }

  async onModuleDestroy() {
    if (this.worker) await this.worker.close();
    if (this.backgroundQueue) await this.backgroundQueue.close();
    if (this.redisConnection) await this.redisConnection.quit();
  }
}
