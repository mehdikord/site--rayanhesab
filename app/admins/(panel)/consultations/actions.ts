'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/admins/lib/auth';
import type { ActionResult } from '@/app/admins/_components/Confirm';
import type { ConsultationStatus } from '@prisma/client';

function toBigInt(v: string | FormDataEntryValue | null): bigint | undefined {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : BigInt(s);
}
function clean(s: string | FormDataEntryValue | null): string | null {
  const t = String(s ?? '').trim();
  return t === '' ? null : t;
}

const STATUSES: ConsultationStatus[] = ['new', 'in_progress', 'done', 'cancelled'];

export async function updateConsultation(fd: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const id = toBigInt(fd.get('id'));
  if (!id) return { ok: false, message: 'درخواست یافت نشد.' };

  const status = String(fd.get('status') ?? 'new') as ConsultationStatus;
  if (!STATUSES.includes(status)) return { ok: false, message: 'وضعیت معتبر نیست.' };

  const handledByRaw = fd.get('handledBy');
  const handledBy =
    handledByRaw && String(handledByRaw).trim() !== ''
      ? (toBigInt(handledByRaw) ?? BigInt(session.id))
      : null;

  const current = await prisma.consultationRequest.findUnique({ where: { id }, select: { handledAt: true } });
  if (!current) return { ok: false, message: 'مورد یافت نشد.' };
  const closed = (status === 'done' || status === 'cancelled');

  await prisma.consultationRequest.update({
    where: { id },
    data: {
      status,
      adminNote: clean(fd.get('adminNote')),
      handledBy,
      // Keep the first close time; clear it if the item is reopened.
      handledAt: closed ? (current.handledAt ?? new Date()) : null,
    },
  });

  revalidatePath('/admins/consultations');
  revalidatePath('/admins');
  return { ok: true };
}

export async function deleteConsultation(requestId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.consultationRequest.delete({ where: { id: BigInt(requestId) } });
  revalidatePath('/admins/consultations');
  return { ok: true };
}
