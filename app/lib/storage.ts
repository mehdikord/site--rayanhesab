/**
 * Server-only file storage on the local disk.
 *
 *   <STORAGE_DIR>/public/...   served to everyone at /uploads/...
 *   <STORAGE_DIR>/private/...  served only through admin-guarded routes
 *
 * STORAGE_DIR defaults to ./storage. Keep it outside the build output and on a
 * persistent volume in production. File types are detected from the content
 * (magic bytes), never from the client-provided name or MIME type.
 */
import { randomBytes } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const STORAGE_ROOT = path.resolve(
  /*turbopackIgnore: true*/ process.env.STORAGE_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), 'storage'),
);

export type FileKind = 'image' | 'document';

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function mimeForExt(ext: string): string {
  return MIME_BY_EXT[ext.toLowerCase()] ?? 'application/octet-stream';
}

function startsWith(buf: Buffer, bytes: number[], offset = 0): boolean {
  return bytes.every((b, i) => buf[offset + i] === b);
}

/** Detect the real extension of an upload from its first bytes. */
function sniff(buf: Buffer, kind: FileKind, originalName: string): string | null {
  if (kind === 'image') {
    if (startsWith(buf, [0xff, 0xd8, 0xff])) return 'jpg';
    if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'png';
    if (startsWith(buf, [0x47, 0x49, 0x46, 0x38])) return 'gif';
    if (startsWith(buf, [0x52, 0x49, 0x46, 0x46]) && startsWith(buf, [0x57, 0x45, 0x42, 0x50], 8)) return 'webp';
    return null;
  }
  if (startsWith(buf, [0x25, 0x50, 0x44, 0x46])) return 'pdf'; // %PDF
  if (startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) return 'doc'; // OLE2
  // DOCX is a zip container; accept it only when the name says .docx.
  if (startsWith(buf, [0x50, 0x4b, 0x03, 0x04]) && /\.docx$/i.test(originalName)) return 'docx';
  return null;
}

export type SaveResult =
  | { ok: true; relPath: string; url: string | null; ext: string }
  | { ok: false; message: string };

/**
 * Validate and store an uploaded file.
 * Images go to the public area (returns a /uploads/... URL); documents go to
 * the private area (url is null; use relPath with an admin route).
 */
export async function saveUpload(
  file: File,
  opts: { kind: FileKind; folder: string; maxBytes: number },
): Promise<SaveResult> {
  if (!file || typeof file.arrayBuffer !== 'function' || file.size === 0) {
    return { ok: false, message: 'فایلی انتخاب نشده است.' };
  }
  if (file.size > opts.maxBytes) {
    return { ok: false, message: `حجم فایل نباید بیشتر از ${Math.round(opts.maxBytes / 1024 / 1024)} مگابایت باشد.` };
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf, opts.kind, file.name ?? '');
  if (!ext) {
    return {
      ok: false,
      message: opts.kind === 'image' ? 'فقط تصاویر JPG، PNG، WebP یا GIF مجاز است.' : 'فقط فایل PDF یا Word مجاز است.',
    };
  }

  const area = opts.kind === 'image' ? 'public' : 'private';
  const now = new Date();
  const sub = path.posix.join(
    opts.folder.replace(/[^a-z0-9_-]/gi, ''),
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, '0'),
  );
  const name = `${randomBytes(12).toString('hex')}.${ext}`;
  const relPath = path.posix.join(sub, name);
  const dir = path.join(/*turbopackIgnore: true*/ STORAGE_ROOT, area, sub);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), buf, { flag: 'wx' });

  return { ok: true, relPath, url: area === 'public' ? `/uploads/${relPath}` : null, ext };
}

/**
 * Resolve a stored file safely (no path traversal) and read it.
 * Returns null when it does not exist.
 */
export async function readStored(
  area: 'public' | 'private',
  relPath: string,
): Promise<{ data: Buffer; ext: string; size: number } | null> {
  if (!/^[a-z0-9_\-/]+\.[a-z0-9]{2,5}$/i.test(relPath) || relPath.includes('..')) return null;
  const base = path.join(/*turbopackIgnore: true*/ STORAGE_ROOT, area);
  const full = path.resolve(/*turbopackIgnore: true*/ base, relPath);
  if (!full.startsWith(base + path.sep)) return null;
  try {
    const st = await stat(full);
    if (!st.isFile()) return null;
    const data = await readFile(full);
    return { data, ext: path.extname(full).slice(1).toLowerCase(), size: st.size };
  } catch {
    return null;
  }
}
