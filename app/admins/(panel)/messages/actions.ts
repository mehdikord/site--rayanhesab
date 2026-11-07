'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/admins/lib/auth';
import type { ActionResult } from '@/app/admins/_components/Confirm';
import type { ContactStatus } from '@prisma/client';

function toBigInt(v: string | FormDataEntryValue | null): bigint | undefined {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : BigInt(s);
}
function clean(s: string | FormDataEntryValue | null): string | null {
  const t = String(s ?? '').trim();
  return t === '' ? null : t;
}

const STATUSES: ContactStatus[] = ['new', 'read', 'replied', 'archived'];

export async function updateContactMessage(fd: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const id = toBigInt(fd.get('id'));
  if (!id) return { ok: false, message: 'پیام یافت نشد.' };

  const status = String(fd.get('status') ?? 'new') as ContactStatus;
  if (!STATUSES.includes(status)) return { ok: false, message: 'وضعیت معتبر نیست.' };

  const handledByRaw = fd.get('handledBy');
  const handledBy =
    handledByRaw && String(handledByRaw).trim() !== ''
      ? (toBigInt(handledByRaw) ?? BigInt(session.id))
      : null;

  const current = await prisma.contactMessage.findUnique({ where: { id }, select: { handledAt: true } });
  if (!current) return { ok: false, message: 'مورد یافت نشد.' };
  const closed = (status === 'replied' || status === 'archived');

  await prisma.contactMessage.update({
    where: { id },
    data: {
      status,
      adminNote: clean(fd.get('adminNote')),
      handledBy,
      // Keep the first close time; clear it if the item is reopened.
      handledAt: closed ? (current.handledAt ?? new Date()) : null,
    },
  });

  revalidatePath('/admins/messages');
  revalidatePath('/admins');
  return { ok: true };
}

export async function deleteContactMessage(messageId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.contactMessage.delete({ where: { id: BigInt(messageId) } });
  revalidatePath('/admins/messages');
  return { ok: true };
}
