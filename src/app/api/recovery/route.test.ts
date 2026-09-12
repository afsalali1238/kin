import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT } from './route';
import { initialRecovery } from '@/lib/app-types';
import { MAX_RECOVERY_BODY_BYTES } from '@/lib/recovery-schema';

const idA = 'aaaaaaaa-0000-4000-8000-000000000001';
const validState = { ...initialRecovery, region: 'neck', assessed: true };

const putRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/recovery', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

// DB-dependent expectations run only where the sandbox/CI has no DATABASE_URL:
// there, a valid write reaches the DB layer and degrades to the documented
// 503 "saved locally" response instead of losing data.
const noDb = !process.env.DATABASE_URL;

describe('PUT /api/recovery', () => {
  it('rejects malformed JSON with 400', async () => {
    expect((await PUT(putRequest('{not json'))).status).toBe(400);
  });

  it('rejects schema violations before touching the DB', async () => {
    expect((await PUT(putRequest({ id: idA, state: { ...validState, phase: 9 } }))).status).toBe(400);
  });

  it('rejects oversized bodies with 413', async () => {
    const big = { id: idA, state: { ...validState, extra: 'x'.repeat(MAX_RECOVERY_BODY_BYTES) } };
    expect((await PUT(putRequest(big))).status).toBe(413);
  });

  it('rejects writes with a malformed recovery id', async () => {
    expect((await PUT(putRequest({ id: 'not-a-uuid', state: validState }))).status).toBe(400);
  });

  it.runIf(noDb)('accepts a valid payload and degrades to 503 when the DB is unavailable', async () => {
    expect((await PUT(putRequest({ id: idA, state: validState }))).status).toBe(503);
  });

  it.runIf(noDb)('rate-limits repeated writes from the same id to 429', async () => {
    const uniqueId = 'aaaaaaaa-0000-4000-8000-000000000099';
    let last = 0;
    for (let i = 0; i < 35; i++) last = (await PUT(putRequest({ id: uniqueId, state: validState }))).status;
    expect(last).toBe(429);
  });
});

describe('GET /api/recovery', () => {
  it('rejects a malformed id with 400', async () => {
    expect((await GET(new NextRequest('http://localhost/api/recovery?id=bad'))).status).toBe(400);
  });
});
