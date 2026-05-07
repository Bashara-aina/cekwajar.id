/**
 * minimax-extract.ts
 * Core extraction engine for all data pipeline workers.
 * Uses MiniMax M27 (via MiniMax-Text-01) for structured HTML → JSON extraction.
 *
 * @module scripts/utils/minimax-extract
 */

import { OpenAI } from 'openai';

// ─── Error Types ─────────────────────────────────────────────────────────────

export class MinimaxExtractError extends Error {
  input_length: number;
  schema: string;
  attempt: number;
  raw_response: string;

  constructor(opts: {
    input_length: number;
    schema: string;
    attempt: number;
    raw_response: string;
    message: string;
  }) {
    super(opts.message);
    this.name = 'MinimaxExtractError';
    this.input_length = opts.input_length;
    this.schema = opts.schema;
    this.attempt = opts.attempt;
    this.raw_response = opts.raw_response;
  }
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a structured data extraction engine for cekwajar.id,
an Indonesian financial audit platform. Your ONLY job is to
extract structured data from raw input and return it as a
valid JSON array. Rules:
- Return ONLY a valid JSON array. No markdown. No explanation.
- If a field value cannot be found, use null.
- Numbers must be raw integers or floats, never formatted strings.
  BAD: 'Rp 8.500.000' → GOOD: 8500000
- Dates must be ISO 8601 strings.
- If no data can be extracted, return an empty array: []
- Never invent data. Only extract what is present in the input.`;

const API_BASE = 'https://api.minimax.io/v1';
const DEFAULT_MODEL = 'MiniMax-Text-01';
const DEFAULT_TEMP = 0.1;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_CHUNK_SIZE = 8000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function chunkString(text: string, size: number): string[] {
  const chunks: string[] = [];
  // Split on paragraph or double-newline boundaries when possible
  const paragraphs = text.split(/\n\n+/);
  let current = '';
  for (const para of paragraphs) {
    if ((current.length + para.length + 2) > size && current.length > 0) {
      chunks.push(current.trim());
      current = para;
    } else {
      current = current ? `${current}\n\n${para}` : para;
    }
  }
  if (current.trim().length > 0) chunks.push(current.trim());
  return chunks;
}

function parseResponse(raw: string): unknown[] {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error('Response was not an array');
  }
  return parsed;
}

// ─── Core Extract Function ───────────────────────────────────────────────────

export async function minimaxExtract<T>(
  input: string,
  schema: string,
  options?: {
    model?: string;
    temperature?: number;
    maxRetries?: number;
    chunkSize?: number;
    apiKey?: string;
  }
): Promise<T[]> {
  const apiKey = options?.apiKey ?? process.env.MINIMAX_API_KEY ?? '';
  if (!apiKey) throw new Error('MINIMAX_API_KEY is not set');

  const model = options?.model ?? DEFAULT_MODEL;
  const temperature = options?.temperature ?? DEFAULT_TEMP;
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES;
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;

  const client = new OpenAI({ baseURL: API_BASE, apiKey });

  // Chunk if needed
  let chunks: string[];
  if (input.length <= chunkSize) {
    chunks = [input];
  } else {
    chunks = chunkString(input, chunkSize);
  }

  const allResults: T[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    let attempt = 0;
    let lastError: Error | null = null;
    let lastRaw: string = '';

    while (attempt < maxRetries) {
      attempt++;
      try {
        const response = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content:
                i > 0
                  ? `${schema}\n\nINPUT (chunk ${i + 1}/${chunks.length}):\n${chunk}`
                  : `${schema}\n\nINPUT:\n${chunk}`,
            },
          ],
          temperature,
          max_tokens: 4096,
        });

        const raw = response.choices[0]?.message?.content ?? '';
        lastRaw = raw;
        const parsed = parseResponse(raw) as T[];
        allResults.push(...parsed);
        break;
      } catch (err: unknown) {
        lastError =
          err instanceof Error
            ? err
            : new Error(String(err) ?? 'Unknown error');
        const message = (lastError as Error).message ?? '';

        // Retry on rate limit
        if (message.includes('429') || message.includes('rate_limit')) {
          const waitMs = Math.pow(2, attempt) * 1000;
          await new Promise((r) => setTimeout(r, waitMs));
          continue;
        }

        // Retry once with stricter prompt on parse errors
        if (
          message.includes('Unexpected token') ||
          message.includes('JSON') ||
          message.includes('parse')
        ) {
          if (attempt === 1) {
            // Try again with stricter prompt
            try {
              const response = await client.chat.completions.create({
                model,
                messages: [
                  { role: 'system', content: SYSTEM_PROMPT },
                  {
                    role: 'user',
                    content:
                      `${schema}\n\nINPUT:\n${chunk}\n\nIMPORTANT: Return ONLY the JSON array, nothing else. No markdown. No explanation.`,
                  },
                ],
                temperature: 0.0,
                max_tokens: 4096,
              });
              const raw = response.choices[0]?.message?.content ?? '';
              lastRaw = raw;
              const parsed = parseResponse(raw) as T[];
              allResults.push(...parsed);
              break;
            } catch (retryErr: unknown) {
              lastError =
                retryErr instanceof Error
                  ? retryErr
                  : new Error(String(retryErr) ?? 'Unknown error');
              attempt++; // count this as another attempt
              continue;
            }
          }
        }

        // 3rd failure: throw
        if (attempt >= maxRetries) {
          throw new MinimaxExtractError({
            input_length: input.length,
            schema,
            attempt,
            raw_response: lastRaw,
            message: `Failed after ${attempt} attempts: ${lastError?.message}`,
          });
        }
      }
    }
  }

  return allResults;
}

// ─── Classification Helper ──────────────────────────────────────────────────

export async function minimaxClassify(
  text: string,
  categories: string[],
  context?: string,
  options?: { model?: string; apiKey?: string }
): Promise<{ category: string; confidence: number }> {
  const apiKey = options?.apiKey ?? process.env.MINIMAX_API_KEY ?? '';
  if (!apiKey) throw new Error('MINIMAX_API_KEY is not set');

  const model = options?.model ?? DEFAULT_MODEL;
  const client = new OpenAI({ baseURL: API_BASE, apiKey });

  const prompt = `Classify the following text into exactly ONE category.\nCategories: ${categories.join(', ')}\n\n${context ? `Context: ${context}\n\n` : ''}Text: ${text}\n\nReturn ONLY a JSON object with "category" (string) and "confidence" (number 0-1). No markdown, no explanation.`;

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You are a text classification engine. Return ONLY a JSON object with "category" and "confidence" keys. No markdown. No explanation.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 256,
  });

  const raw = response.choices[0]?.message?.content ?? '';
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  const parsed = JSON.parse(cleaned);
  return parsed as { category: string; confidence: number };
}

// ─── Summarize Helper ────────────────────────────────────────────────────────

export async function minimaxSummarize(
  text: string,
  maxWords: number,
  options?: { model?: string; apiKey?: string }
): Promise<string> {
  const apiKey = options?.apiKey ?? process.env.MINIMAX_API_KEY ?? '';
  if (!apiKey) throw new Error('MINIMAX_API_KEY is not set');

  const model = options?.model ?? DEFAULT_MODEL;
  const client = new OpenAI({ baseURL: API_BASE, apiKey });

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: `You are a text summarization engine. Summarize the input in no more than ${maxWords} words. Return ONLY the summary text, no quotes or markdown.`,
      },
      { role: 'user', content: text },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content?.trim() ?? '';
}

// ─── Sanity Test (runs when executed directly) ───────────────────────────────

async function runSanityCheck() {
  console.log('[minimax-extract] Running sanity check...');
  const testHtml = `
    <table>
      <tr><th>Nama</th><th>Gaji</th><th>Umur</th></tr>
      <tr><td>Budi Santoso</td><td>Rp 8.500.000</td><td>28</td></tr>
      <tr><td>Ani Wijaya</td><td>Rp 12.000.000</td><td>35</td></tr>
      <tr><td>Dewi Kusuma</td><td>Rp 15.750.000</td><td>42</td></tr>
    </table>
  `;

  const schema =
    'Extract an array of objects with fields: name (string), salary (number, in IDR, no formatting), age (number).';

  try {
    const results = await minimaxExtract<{
      name: string;
      salary: number;
      age: number;
    }>(testHtml, schema);

    console.log(`[minimax-extract] PASS — extracted ${results.length} rows`);
    console.log('Raw results:', JSON.stringify(results, null, 2));
  } catch (err) {
    if (err instanceof MinimaxExtractError) {
      console.log('[minimax-extract] FAIL — extraction error after retries');
      console.log('Input length:', err.input_length);
      console.log('Schema:', err.schema);
      console.log('Attempt:', err.attempt);
      console.log('Raw response:', err.raw_response);
    } else {
      console.log('[minimax-extract] FAIL — unexpected error:', err);
    }
  }
}

// Only run sanity check when executed directly as a script
const isMain =
  typeof import.meta.url === 'undefined'
    ? process.argv[1]?.endsWith('minimax-extract.ts')
    : import.meta.url === `file://${process.argv[1]}`;

if (isMain) {
  runSanityCheck().catch(console.error);
}