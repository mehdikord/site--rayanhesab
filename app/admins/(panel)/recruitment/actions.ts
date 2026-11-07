'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { parseLocalInputValue } from '@/app/lib/datetime';
import { requireAdmin } from '@/app/admins/lib/auth';
import type { ActionResult } from '@/app/admins/_components/Confirm';
import type {
  CompanyStatus,
  JobRequestStatus,
  TalentApplicationStatus,
  ReferralStatus,
} from '@prisma/client';
import { Prisma } from '@prisma/client';

function toBigInt(v: string | FormDataEntryValue | null): bigint | undefined {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : BigInt(s);
}
function clean(s: string | FormDataEntryValue | null): string | null {
  const t = String(s ?? '').trim();
  return t === '' ? null : t;
}
/** datetime-local value (business timezone) → Date. */
function toDateTime(v: string | FormDataEntryValue | null): Date | null {
  return parseLocalInputValue(String(v ?? ''));
}

function touch() {
  revalidatePath('/admins/recruitment');
  revalidatePath('/admins');
}

/* ───────────────────────── Companies ───────────────────────── */

const COMPANY_STATUSES: CompanyStatus[] = ['pending', 'approved', 'rejected'];

export async function updateCompany(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));
  if (!id) return { ok: false, message: 'شرکت یافت نشد.' };

  const status = String(fd.get('status') ?? 'pending') as CompanyStatus;
  if (!COMPANY_STATUSES.includes(status)) return { ok: false, message: 'وضعیت معتبر نیست.' };

  await prisma.company.update({
    where: { id },
    data: {
      name: clean(fd.get('name')) ?? undefined,
      contactName: clean(fd.get('contactName')) ?? undefined,
      mobile: clean(fd.get('mobile')) ?? undefined,
      email: clean(fd.get('email')),
      city: clean(fd.get('city')),
      address: clean(fd.get('address')),
      website: clean(fd.get('website')),
      description: clean(fd.get('description')),
      status,
      adminNote: clean(fd.get('adminNote')),
    },
  });

  touch();
  return { ok: true };
}

export async function deleteCompany(companyId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.company.delete({ where: { id: BigInt(companyId) } });
  touch();
  return { ok: true };
}

/* ───────────────────────── Job requests ───────────────────────── */

const JOB_STATUSES: JobRequestStatus[] = [
  'new',
  'reviewing',
  'open',
  'filled',
  'closed',
  'cancelled',
];

export async function updateJobRequest(fd: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const id = toBigInt(fd.get('id'));
  if (!id) return { ok: false, message: 'درخواست یافت نشد.' };

  const status = String(fd.get('status') ?? 'new') as JobRequestStatus;
  if (!JOB_STATUSES.includes(status)) return { ok: false, message: 'وضعیت معتبر نیست.' };

  // The form has no handler picker: whoever saves the request handles it.
  const handledBy = fd.has('handledBy')
    ? (toBigInt(fd.get('handledBy')) ?? null)
    : BigInt(session.id);

  await prisma.jobRequest.update({
    where: { id },
    data: { status, adminNote: clean(fd.get('adminNote')), handledBy },
  });

  touch();
  return { ok: true };
}

export async function deleteJobRequest(jobRequestId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.jobRequest.delete({ where: { id: BigInt(jobRequestId) } });
  touch();
  return { ok: true };
}

/* ───────────────────────── Talent applications ───────────────────────── */

const TALENT_STATUSES: TalentApplicationStatus[] = [
  'new',
  'reviewing',
  'approved',
  'introduced',
  'hired',
  'rejected',
];

export async function updateTalentApplication(fd: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const id = toBigInt(fd.get('id'));
  if (!id) return { ok: false, message: 'آپلیکیشن یافت نشد.' };

  const status = String(fd.get('status') ?? 'new') as TalentApplicationStatus;
  if (!TALENT_STATUSES.includes(status)) return { ok: false, message: 'وضعیت معتبر نیست.' };

  const current = await prisma.talentApplication.findUnique({
    where: { id },
    select: { status: true, reviewedAt: true, reviewedBy: true },
  });
  if (!current) return { ok: false, message: 'آپلیکیشن یافت نشد.' };

  const statusChanged = current.status !== status;
  await prisma.talentApplication.update({
    where: { id },
    data: {
      status,
      adminNote: clean(fd.get('adminNote')),
      // Record who reviewed it and when, at the moment the status moves.
      reviewedBy: statusChanged ? BigInt(session.id) : current.reviewedBy,
      reviewedAt: status === 'new' ? null : statusChanged ? new Date() : current.reviewedAt,
    },
  });

  touch();
  return { ok: true };
}

export async function deleteTalentApplication(
  applicationId: string,
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.talentApplication.delete({ where: { id: BigInt(applicationId) } });
  touch();
  return { ok: true };
}

/* ───────────────────────── Referrals ───────────────────────── */

const REFERRAL_STATUSES: ReferralStatus[] = [
  'introduced',
  'interview',
  'hired',
  'rejected',
];

export async function upsertReferral(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = toBigInt(fd.get('id'));
  const jobRequestId = toBigInt(fd.get('jobRequestId'));
  const talentApplicationId = toBigInt(fd.get('talentApplicationId'));
  if (!jobRequestId || !talentApplicationId) {
    return { ok: false, message: 'انتخاب کار و کاندیدا الزامی است.' };
  }

  const status = (fd.get('status') || 'introduced') as ReferralStatus;
  if (!REFERRAL_STATUSES.includes(status)) return { ok: false, message: 'وضعیت معتبر نیست.' };

  const data = {
    status,
    interviewAt: toDateTime(fd.get('interviewAt')),
    note: clean(fd.get('note')),
  };

  if (id) {
    await prisma.talentReferral.update({ where: { id }, data });
  } else {
    try {
      await prisma.talentReferral.create({
        data: { ...data, jobRequestId, talentApplicationId },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return { ok: false, message: 'این معرف قبلاً ثبت شده است.' };
      }
      throw e;
    }
  }

  touch();
  return { ok: true };
}

export async function deleteReferral(referralId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.talentReferral.delete({ where: { id: BigInt(referralId) } });
  touch();
  return { ok: true };
}
