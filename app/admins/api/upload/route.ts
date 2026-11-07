import { NextResponse, type NextRequest } from 'next/server';
import { getAdminSession } from '@/app/admins/lib/auth';
import { saveUpload } from '@/app/lib/storage';

const FOLDERS = new Set(['services', 'courses', 'articles', 'team', 'instructors', 'users', 'general']);

/** Admin-only image upload. Responds with { url } on success. */
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ ok: false, message: 'ابتدا وارد شوید.' }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: 'درخواست نامعتبر است.' }, { status: 400 });
  }
  const file = form.get('file');
  const folderRaw = String(form.get('folder') ?? 'general');
  const folder = FOLDERS.has(folderRaw) ? folderRaw : 'general';
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: 'فایلی انتخاب نشده است.' }, { status: 400 });
  }

  const saved = await saveUpload(file, { kind: 'image', folder, maxBytes: 5 * 1024 * 1024 });
  if (!saved.ok) return NextResponse.json(saved, { status: 400 });
  return NextResponse.json({ ok: true, url: saved.url });
}
