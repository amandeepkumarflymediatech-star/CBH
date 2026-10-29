/**
 * Background Job Manager for Excel Bulk Imports
 * Stores asynchronous job state in memory attached to globalThis
 * so that state survives between API requests within the Node.js process.
 */

export interface BulkUploadJob {
  id: string;
  status: 'pending' | 'parsing' | 'syncing' | 'completed' | 'failed';
  fileName: string;
  fileSizeBytes: number;
  sheetName: string;
  upsertMode: 'merge' | 'append' | 'replace';
  totalRows: number;
  processedRows: number;
  progressPercent: number; // 0 - 100
  addedCount: number;
  updatedCount: number;
  skippedCount: number;
  catalogTotal: number;
  message?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __cbh_bulk_upload_jobs: Map<string, BulkUploadJob> | undefined;
}

function getJobsStore(): Map<string, BulkUploadJob> {
  if (!globalThis.__cbh_bulk_upload_jobs) {
    globalThis.__cbh_bulk_upload_jobs = new Map<string, BulkUploadJob>();
  }
  return globalThis.__cbh_bulk_upload_jobs;
}

export function createBulkUploadJob(params: {
  fileName: string;
  fileSizeBytes: number;
  sheetName: string;
  upsertMode: 'merge' | 'append' | 'replace';
}): BulkUploadJob {
  const store = getJobsStore();
  const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  
  const job: BulkUploadJob = {
    id,
    status: 'pending',
    fileName: params.fileName,
    fileSizeBytes: params.fileSizeBytes,
    sheetName: params.sheetName,
    upsertMode: params.upsertMode,
    totalRows: 0,
    processedRows: 0,
    progressPercent: 0,
    addedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    catalogTotal: 0,
    message: 'Queued for background processing...',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  store.set(id, job);

  // Clean up older jobs keeping only the last 30
  if (store.size > 30) {
    const keys = Array.from(store.keys());
    for (let i = 0; i < keys.length - 30; i++) {
      store.delete(keys[i]);
    }
  }

  return job;
}

export function getBulkUploadJob(id: string): BulkUploadJob | null {
  const store = getJobsStore();
  return store.get(id) || null;
}

export function updateBulkUploadJob(
  id: string,
  updates: Partial<BulkUploadJob>
): BulkUploadJob | null {
  const store = getJobsStore();
  const existing = store.get(id);
  if (!existing) return null;

  const updated: BulkUploadJob = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  if (updates.status === 'completed' || updates.status === 'failed') {
    updated.completedAt = Date.now();
  }

  store.set(id, updated);
  return updated;
}

export function getActiveBulkUploadJob(): BulkUploadJob | null {
  const store = getJobsStore();
  const jobs = Array.from(store.values());
  // Find the most recent active job
  const active = jobs
    .filter((j) => ['pending', 'parsing', 'syncing'].includes(j.status))
    .sort((a, b) => b.createdAt - a.createdAt);
  return active[0] || null;
}

