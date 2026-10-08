# Module: documents

Path: apps/api/src/modules/documents/
Status: active

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST   | /api/documents/upload | user | upload file (multipart, field `file`) |
| GET    | /api/documents | user | list documents (filter `?type=`) |
| GET    | /api/documents/stats | user | usage stats |
| GET    | /api/documents/:id | user | single document metadata |
| GET    | /api/documents/:id/stream | user | inline file content (piped) |
| GET    | /api/documents/:id/download | user | presigned download URL |
| DELETE | /api/documents/:id | user | delete (MinIO + soft delete) |

All `:id` params validated via ParseUUIDPipe (API-001).

## Storage

MinIO bucket `documents`. Key format: `{userId}/{type}/{ts}-{hash8}.{ext}`.
SHA-256 hash stored in DB for dedup potential.

## Upload enforcement

`PlanLimitsService.checkDocumentLimit(userId, file)` runs first:
- extension vs plan.allowedFormats
- size vs plan.maxUploadMB
- count vs plan.maxDocuments
- total storage vs plan.maxStorageMB

## Streaming (API-002 fixed 2026-10-08)

Before: `minio.getFile` loaded entire buffer into RAM, then `res.end(buffer)`.
After: `minio.getObjectStream` returns a ReadableStream, controller pipes
directly to `res`. No full-file buffering.

## Delete (API-003 fixed 2026-10-08)

Before: only soft delete in DB; MinIO objects accumulated as orphans.
After: best-effort `minio.removeFile(storageKey)` then soft delete.
MinIO failure is logged but does not block the DB delete.

## Hard limits (independent of plan)

- MAX_FILE_SIZE = 50 MB
- ALLOWED_MIME_TYPES = pdf, jpeg, png, webp, msword, docx, xlsx, txt
