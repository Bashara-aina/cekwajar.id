/**
 * supabase-upsert.ts
 * Write layer for all data pipeline workers.
 * Uses Supabase service role client for privileged writes.
 *
 * @module scripts/utils/supabase-upsert
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Clients ───────────────────────────────────────────────────────────────

function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

  if (!url || !serviceRoleKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// ─── Upsert Batch ──────────────────────────────────────────────────────────

const BATCH_SIZE = 500;

export async function upsertBatch<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  conflictKey: string
): Promise<{
  inserted: number;
  updated: number;
  errors: unknown[];
}> {
  if (rows.length === 0) return { inserted: 0, updated: 0, errors: [] };

  const client = getServiceClient();
  let inserted = 0;
  let updated = 0;
  const errors: unknown[] = [];

  // Process in chunks of 500
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(rows.length / BATCH_SIZE);
    console.log(
      `Upserting batch ${batchNum}/${totalBatches} (${batch.length} rows) into ${table}...`
    );

    const { data, error } = await client
      .from(table)
      .upsert(batch, { onConflict: conflictKey });

    if (error) {
      console.error(`Error upserting batch into ${table}:`, error);
      errors.push(error);
      continue;
    }

    if (data) {
      // count inserted vs updated based on how many rows came back
      // Supabase returns the full array on upsert with returning mode
      inserted += (Array.isArray(data) ? data.length : 0);
    }

    // For upsert, we can't easily distinguish inserted vs updated without
    // examining each row. We'll count all as inserted for now.
    updated += batch.length;
  }

  return { inserted, updated, errors };
}

// ─── Data Freshness Logging ──────────────────────────────────────────────────

export async function logDataFreshness(
  table: string,
  source: string,
  rowsAffected: number
): Promise<void> {
  const client = getServiceClient();

  const { error } = await client.from('data_freshness').upsert(
    {
      table_name: table,
      source,
      last_updated: new Date().toISOString(),
      rows_count: rowsAffected,
      status: 'fresh',
      next_scheduled: null,
    },
    { onConflict: 'table_name' }
  );

  if (error) {
    console.error(`Error logging freshness for ${table}:`, error);
  } else {
    console.log(`Logged freshness for ${table} (${rowsAffected} rows)`);
  }
}

// ─── Get Stale Tables ───────────────────────────────────────────────────────

export async function getStaleTable(
  maxAgeHours: number
): Promise<string[]> {
  const client = getServiceClient();

  const cutoff = new Date(
    Date.now() - maxAgeHours * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await client
    .from('data_freshness')
    .select('table_name, last_updated')
    .or(`last_updated.lt.${cutoff},status.eq.stale,status.eq.error`);

  if (error) {
    console.error('Error fetching stale tables:', error);
    return [];
  }

  return (data ?? []).map((r: { table_name: string }) => r.table_name);
}

// ─── Combined Upsert + Log Helper ────────────────────────────────────────────

export async function upsertAndLog<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  conflictKey: string,
  source: string
): Promise<{
  inserted: number;
  updated: number;
  errors: unknown[];
}> {
  const result = await upsertBatch(table, rows, conflictKey);
  if (result.errors.length === 0) {
    await logDataFreshness(table, source, rows.length);
  }
  return result;
}