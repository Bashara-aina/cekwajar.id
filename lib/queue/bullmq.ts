import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';

// Redis connection config - use Upstash in production, local in dev
const redisConfig = process.env.UPSTASH_REDIS_REST_URL
  ? {
      connection: {
        host: process.env.UPSTASH_REDIS_REST_URL.replace('https://', '').split('.')[0],
        port: parseInt(process.env.UPSTASH_REDIS_REST_URL.split(':')[1] || '6379'),
        tls: {},
      },
    }
  : {
      connection: new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: null,
      }),
    };

// Queue names
export const QUEUES = {
  OCR: 'payslip-ocr',
  BPS_DATA: 'bps-data-scraping',
  WORLD_BANK: 'worldbank-data',
  PROPERTY_SCRAPE: 'property-scraper',
  NUMBEO_SCRAPE: 'numbeo-scraper',
  EMAIL_SEND: 'email-send',
  PDF_GENERATE: 'pdf-generate',
} as const;

// Job priorities
export const PRIORITY = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  CRITICAL: 4,
} as const;

// Create a queue
export function createQueue(name: string) {
  return new Queue(name, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection: redisConfig.connection as any,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 500 },
    },
  });
}

// Job data interfaces
export interface PayslipOCRJob {
  userId: string;
  imageUrl: string;
  transactionId: string;
}

export interface BPSDataJob {
  indicator: string;
  year?: number;
}

export interface WorldBankJob {
  indicator: string;
  country: string;
  dateRange?: { start: number; end: number };
}

export interface EmailJob {
  to: string;
  template: 'payment_confirmation' | 'receipt' | 'verification';
  data: Record<string, unknown>;
}

export interface PDFGenerateJob {
  type: 'receipt' | 'report' | 'benchmark';
  data: Record<string, unknown>;
  outputFormat: 'buffer' | 'stream';
}

// Queue instances (singleton)
const _queues: Record<string, Queue> = {};

export function getQueue(name: string): Queue {
  if (!_queues[name]) {
    _queues[name] = createQueue(name);
  }
  return _queues[name];
}

// Add job to queue
export async function addJob<T>(
  queueName: string,
  data: T,
  options?: {
    priority?: number;
    delay?: number;
    jobId?: string;
  }
) {
  const queue = getQueue(queueName);
  return queue.add(queueName, data, {
    priority: options?.priority ?? PRIORITY.NORMAL,
    delay: options?.delay,
    jobId: options?.jobId,
  });
}

// Get job status
export async function getJobStatus(queueName: string, jobId: string): Promise<{ status: string; progress: number; attempts: number } | null> {
  const queue = getQueue(queueName);
  const job = await queue.getJob(jobId);

  if (!job) return null;

  const state = await job.getState();
  return {
    status: state,
    progress: (job.progress as number) || 0,
    attempts: job.attemptsMade || 0,
  };
}

// Create a worker
export function createWorker(
  name: string,
  processor: (job: Job) => Promise<unknown>,
  options?: { concurrency?: number }
) {
  return new Worker(name, processor, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connection: redisConfig.connection as any,
    concurrency: options?.concurrency ?? 5,
  });
}

// Export Redis config for health checks
export { redisConfig };
