import { randomBytes } from 'node:crypto'
import type { RecordingShare, ShareType, ErrorCode } from '@just-recordings/shared'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { db } from '../index.js'
import {
  type RecordingShare as DbRecordingShare,
  type NewRecordingShare,
  recordingShares,
  recordings,
} from '../schema.js'

/**
 * Generate a cryptographically secure share token
 * Returns a 43-character URL-safe base64 string (32 bytes of entropy)
 */
export function generateShareToken(): string {
  return randomBytes(32).toString('base64url')
}

function toRecordingShare(row: DbRecordingShare, baseUrl?: string): RecordingShare {
  const share: RecordingShare = {
    id: row.id,
    recordingId: row.recordingId,
    shareToken: row.shareToken,
    shareType: row.shareType as ShareType,
    viewCount: row.viewCount,
    maxViews: row.maxViews,
    createdAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
  }

  // Compute isActive based on revocation, expiration, and view limits
  share.isActive = isShareActive(share)

  // Add shareUrl if baseUrl provided
  if (baseUrl) {
    share.shareUrl = `${baseUrl}/share/${row.shareToken}`
  }

  return share
}

function isShareActive(share: RecordingShare): boolean {
  if (share.revokedAt) return false
  if (share.expiresAt && new Date(share.expiresAt) < new Date()) return false
  if (share.maxViews && share.viewCount >= share.maxViews) return false
  return true
}

export interface ShareValidation {
  valid: true
  share: RecordingShare
  recordingId: string
}

export interface ShareValidationError {
  valid: false
  error: ErrorCode
}

export type ShareValidationResult = ShareValidation | ShareValidationError

/**
 * Validate a share token and return the share if valid
 */
export async function validateShare(token: string): Promise<ShareValidationResult> {
  const rows = await db
    .select()
    .from(recordingShares)
    .where(eq(recordingShares.shareToken, token))

  if (rows.length === 0) {
    return { valid: false, error: 'SHARE_NOT_FOUND' }
  }

  const share = toRecordingShare(rows[0])

  if (share.revokedAt) {
    return { valid: false, error: 'SHARE_REVOKED' }
  }

  if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
    return { valid: false, error: 'SHARE_EXPIRED' }
  }

  if (share.maxViews && share.viewCount >= share.maxViews) {
    return { valid: false, error: 'SHARE_VIEW_LIMIT_REACHED' }
  }

  return { valid: true, share, recordingId: rows[0].recordingId }
}

/**
 * Create a new share for a recording
 */
export async function createShare(
  recordingId: string,
  shareType: ShareType,
  baseUrl?: string
): Promise<RecordingShare> {
  const shareToken = generateShareToken()
  const maxViews = shareType === 'single_view' ? 1 : null

  const row: NewRecordingShare = {
    recordingId,
    shareToken,
    shareType,
    maxViews,
  }

  const result = await db.insert(recordingShares).values(row).returning()
  return toRecordingShare(result[0], baseUrl)
}

/**
 * Get a share by its token
 */
export async function getShareByToken(
  token: string,
  baseUrl?: string
): Promise<RecordingShare | null> {
  const rows = await db
    .select()
    .from(recordingShares)
    .where(eq(recordingShares.shareToken, token))

  if (rows.length === 0) {
    return null
  }

  return toRecordingShare(rows[0], baseUrl)
}

/**
 * Get all shares for a recording
 */
export async function getSharesByRecordingId(
  recordingId: string,
  baseUrl?: string
): Promise<RecordingShare[]> {
  const rows = await db
    .select()
    .from(recordingShares)
    .where(eq(recordingShares.recordingId, recordingId))

  return rows.map((row) => toRecordingShare(row, baseUrl))
}

/**
 * Revoke a share (soft delete by setting revokedAt)
 */
export async function revokeShare(shareId: string, recordingId: string): Promise<boolean> {
  const result = await db
    .update(recordingShares)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(recordingShares.id, shareId),
        eq(recordingShares.recordingId, recordingId),
        isNull(recordingShares.revokedAt)
      )
    )
    .returning({ id: recordingShares.id })

  return result.length > 0
}

/**
 * Increment the view count for a share atomically
 */
export async function incrementViewCount(shareId: string): Promise<void> {
  await db
    .update(recordingShares)
    .set({ viewCount: sql`${recordingShares.viewCount} + 1` })
    .where(eq(recordingShares.id, shareId))
}

/**
 * Check if a user owns a recording
 */
export async function userOwnsRecording(recordingId: string, userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: recordings.id })
    .from(recordings)
    .where(and(eq(recordings.id, recordingId), eq(recordings.userId, userId)))

  return rows.length > 0
}
