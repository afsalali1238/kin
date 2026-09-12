import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { recoveryStates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { MAX_RECOVERY_BODY_BYTES, RECOVERY_ID_PATTERN, recoveryPayloadSchema } from '@/lib/recovery-schema';
import { checkRecoveryRateLimit } from '@/lib/rate-limit';

/**
 * Health data, anonymous identifier: the id is an unguessable UUID, the state
 * is bounded-validated before anything touches the DB, payloads are capped,
 * and requests are rate-limited per (IP, id). A database outage degrades to
 * device-local sync (503) rather than data loss — the client keeps
 * localStorage as its source of truth either way.
 */
function clientKey(req: NextRequest, id: string): string {
  const realIp = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip');
  let ip = realIp ? realIp.trim() : '';

  if (!ip) {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
      ip = parts.length > 0 ? parts[parts.length - 1] : '';
    }
  }

  const isIp = /^([0-9]{1,3}\.){3}[0-9]{1,3}$|^[a-fA-F0-9:]+$/.test(ip);
  const safeIp = isIp ? ip : 'unknown';
  return `${safeIp}:${id}`;
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id') || '';
  if (!RECOVERY_ID_PATTERN.test(id)) return NextResponse.json({ error: 'Invalid recovery identifier' }, { status: 400 });
  if (!checkRecoveryRateLimit(clientKey(req, id), 'read')) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
  }
  try {
    const [row] = await db.select().from(recoveryStates).where(eq(recoveryStates.id, id));
    return NextResponse.json({ state: row?.state ?? null });
  } catch {
    return NextResponse.json({ error: 'Saved locally; sync temporarily unavailable' }, { status: 503 });
  }
}

export async function PUT(req: NextRequest) {
  let raw: unknown;
  try {
    const text = await req.text();
    if (text.length > MAX_RECOVERY_BODY_BYTES) return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
    raw = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'Invalid recovery data' }, { status: 400 });
  }
  const parsed = recoveryPayloadSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid recovery data' }, { status: 400 });
  if (!checkRecoveryRateLimit(clientKey(req, parsed.data.id), 'write')) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': '60' } });
  }
  try {
    await db
      .insert(recoveryStates)
      .values({ id: parsed.data.id, state: parsed.data.state })
      .onConflictDoUpdate({ target: recoveryStates.id, set: { state: parsed.data.state, updatedAt: new Date() } });
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ error: 'Saved locally; sync temporarily unavailable' }, { status: 503 });
  }
}
