'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import type { ExperienceLevel, EmploymentType } from '@prisma/client';
import { EMAIL_RE, normalizeMobile } from '@/app/lib/validation';
import { clientIp, rateLimit } from '@/app/lib/rate-limit';
import { saveUpload } from '@/app/lib/storage';

export interface PublicActionResult {
  ok: boolean;
  message?: string;
}

/* ── input sanitization helpers ─────────────────────────────── */

function text(v: unknown, max: number): string {
  return String(v ?? '').trim().slice(0, max);
}

function optionalEmail(v: string): string | null {
  const t = text(v, 255).toLowerCase();
  if (!t) return null;
  return EMAIL_RE.test(t) ? t : null;
}

const TOO_MANY: PublicActionResult = {
  ok: false,
  message: 'تعداد درخواست‌های شما زیاد است؛ کمی بعد دوباره تلاش کنید.',
};

/** 5 submissions of each form per IP per 10 minutes. */
async function allow(form: string): Promise<{ ok: boolean; ip: string | null }> {
  const ip = await clientIp();
  return { ok: rateLimit(`form:${form}:${ip ?? 'unknown'}`, 5, 10 * 60_000), ip };
}

/* ── consultation ─────────────────────────────────────────────── */

export interface ConsultationInput {
  name: string;
  phone: string;
  /** Service slug; empty string = no specific service. */
  serviceSlug?: string;
  message: string;
}

export async function submitConsultation(input: ConsultationInput): Promise<PublicActionResult> {
  const name = text(input.name, 255);
  const phone = normalizeMobile(text(input.phone, 30));
  const message = text(input.message, 2000);
  const serviceSlug = text(input.serviceSlug ?? '', 255);

  if (!name) return { ok: false, message: 'نام الزامی است.' };
  if (!phone) return { ok: false, message: 'شماره موبایل معتبر وارد کنید.' };
  if (!message) return { ok: false, message: 'توضیحات الزامی است.' };
  const gate = await allow('consultation');
  if (!gate.ok) return TOO_MANY;

  const [service] = serviceSlug
    ? await prisma.service.findMany({ where: { slug: serviceSlug, isActive: true }, select: { id: true }, take: 1 })
    : [undefined];

  try {
    await prisma.consultationRequest.create({
      data: {
        name,
        mobile: phone,
        message,
        service: service ? { connect: { id: service.id } } : undefined,
        ipAddress: gate.ip,
      },
    });
  } catch {
    return { ok: false, message: 'خطا در ثبت درخواست؛ دوباره تلاش کنید.' };
  }

  revalidatePath('/admins/consultations');
  revalidatePath('/admins');
  return { ok: true, message: 'درخواست شما ثبت شد.' };
}

/* ── contact ──────────────────────────────────────────────────── */

export interface ContactInput {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
}

export async function submitContactMessage(input: ContactInput): Promise<PublicActionResult> {
  const name = text(input.name, 255);
  const phone = normalizeMobile(text(input.phone, 30));
  const email = optionalEmail(input.email ?? '');
  const subject = text(input.subject, 255);
  const message = text(input.message, 2000);

  if (!name) return { ok: false, message: 'نام الزامی است.' };
  if (!phone) return { ok: false, message: 'شماره موبایل معتبر وارد کنید.' };
  if (!subject) return { ok: false, message: 'موضوع پیام را انتخاب کنید.' };
  if (!message) return { ok: false, message: 'متن پیام الزامی است.' };
  const gate = await allow('contact');
  if (!gate.ok) return TOO_MANY;

  try {
    await prisma.contactMessage.create({
      data: {
        name,
        mobile: phone,
        email,
        subject,
        message,
        ipAddress: gate.ip,
      },
    });
  } catch {
    return { ok: false, message: 'خطا در ثبت پیام؛ دوباره تلاش کنید.' };
  }

  revalidatePath('/admins/messages');
  revalidatePath('/admins');
  return { ok: true, message: 'پیام شما ثبت شد.' };
}

/* ── talent application ───────────────────────────────────────── */

const EXPERIENCE_VALUES: ExperienceLevel[] = [
  'none',
  'one_to_three',
  'three_to_five',
  'five_to_ten',
  'over_five',
  'over_ten',
];
const EMPLOYMENT_VALUES: EmploymentType[] = [
  'full_time',
  'part_time',
  'project',
  'remote',
  'internship',
];

/**
 * Talent application from the accountant recruitment form. Receives FormData
 * so the optional resume file (PDF/Word, max 5MB) can be uploaded with it.
 */
export async function submitTalentApplication(fd: FormData): Promise<PublicActionResult> {
  const get = (k: string) => String(fd.get(k) ?? '');
  const fullName = text(get('fullName'), 255);
  const phone = normalizeMobile(text(get('phone'), 30));
  const email = optionalEmail(get('email'));
  const city = text(get('city'), 255);
  const position = text(get('position'), 255);
  const skills = text(get('skills'), 1000);
  const intro = text(get('intro'), 2000);
  const experience = EXPERIENCE_VALUES.find((v) => v === get('experience')) ?? null;
  const employmentType = EMPLOYMENT_VALUES.find((v) => v === get('employmentType')) ?? null;
  const resume = fd.get('resume');

  if (!fullName) return { ok: false, message: 'نام و نام خانوادگی الزامی است.' };
  if (!phone) return { ok: false, message: 'شماره موبایل معتبر وارد کنید.' };
  if (!city) return { ok: false, message: 'شهر محل سکونت را وارد کنید.' };
  if (!position) return { ok: false, message: 'موقعیت شغلی مورد نظر را انتخاب کنید.' };
  if (!experience) return { ok: false, message: 'سابقه کار را انتخاب کنید.' };
  if (!employmentType) return { ok: false, message: 'نوع همکاری را انتخاب کنید.' };
  if (!skills) return { ok: false, message: 'مهارت‌های خود را وارد کنید.' };
  if (!intro) return { ok: false, message: 'معرفی کوتاه الزامی است.' };
  const gate = await allow('talent');
  if (!gate.ok) return TOO_MANY;

  let resumePath: string | null = null;
  if (resume instanceof File && resume.size > 0) {
    const saved = await saveUpload(resume, { kind: 'document', folder: 'resumes', maxBytes: 5 * 1024 * 1024 });
    if (!saved.ok) return { ok: false, message: saved.message };
    resumePath = saved.relPath;
  }

  try {
    await prisma.talentApplication.create({
      data: {
        fullName,
        mobile: phone,
        email,
        city,
        position,
        experience,
        employmentType,
        skills,
        intro,
        resumePath,
      },
    });
  } catch {
    return { ok: false, message: 'خطا در ثبت درخواست؛ دوباره تلاش کنید.' };
  }

  revalidatePath('/admins/recruitment');
  revalidatePath('/admins');
  return { ok: true, message: 'درخواست همکاری شما ثبت شد.' };
}

/* ── employer request (company + job request) ─────────────────── */

export interface EmployerInput {
  company: string;
  contactName: string;
  phone: string;
  email?: string;
  position: string;
  skills: string;
  experience: ExperienceLevel;
  employmentType: EmploymentType;
  /** Free-text salary range (e.g. "توافقی" or a range in Toman). */
  salary?: string;
  city: string;
  description?: string;
}

export async function submitEmployerRequest(input: EmployerInput): Promise<PublicActionResult> {
  const company = text(input.company, 255);
  const contactName = text(input.contactName, 255);
  const phone = normalizeMobile(text(input.phone, 30));
  const email = optionalEmail(input.email ?? '');
  const position = text(input.position, 255);
  const skills = text(input.skills, 1000);
  const salary = text(input.salary ?? '', 255) || null;
  const city = text(input.city, 255);
  const description = text(input.description ?? '', 2000) || null;
  const experience = EXPERIENCE_VALUES.includes(input.experience as ExperienceLevel)
    ? (input.experience as ExperienceLevel)
    : 'none';
  const employmentType = EMPLOYMENT_VALUES.includes(input.employmentType as EmploymentType)
    ? (input.employmentType as EmploymentType)
    : 'full_time';

  if (!company) return { ok: false, message: 'نام شرکت الزامی است.' };
  if (!contactName) return { ok: false, message: 'نام رابط الزامی است.' };
  if (!phone) return { ok: false, message: 'شماره موبایل معتبر وارد کنید.' };
  if (!position) return { ok: false, message: 'عنوان شغلی را مشخص کنید.' };
  if (!skills) return { ok: false, message: 'مهارت‌های مورد نیاز را وارد کنید.' };
  if (!city) return { ok: false, message: 'شهر را وارد کنید.' };
  const gate = await allow('employer');
  if (!gate.ok) return TOO_MANY;

  try {
    // Reuse the company when the same contact submits again for the same
    // company name; otherwise create a new company record.
    let companyId = await prisma.company
      .findFirst({ where: { mobile: phone, name: company }, select: { id: true } })
      .then((c) => c?.id ?? null);

    if (!companyId) {
      const created = await prisma.company.create({
        data: {
          name: company,
          contactName,
          mobile: phone,
          email,
          city: city || null,
          description,
        },
      });
      companyId = created.id;
    }

    await prisma.jobRequest.create({
      data: {
        companyId,
        position,
        city,
        requiredExperience: experience,
        employmentType,
        salaryRange: salary,
        skills,
        description,
      },
    });
  } catch {
    return { ok: false, message: 'خطا در ثبت درخواست؛ دوباره تلاش کنید.' };
  }

  revalidatePath('/admins/recruitment');
  revalidatePath('/admins');
  return { ok: true, message: 'درخواست جذب شما ثبت شد.' };
}
