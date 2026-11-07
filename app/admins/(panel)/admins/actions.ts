'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/admins/lib/auth';
import type { ActionResult } from '@/app/admins/_components/Confirm';
import { Prisma } from '@prisma/client';
import { EMAIL_RE, normalizeMobile } from '@/app/lib/validation';

function toBigInt(v: string | FormDataEntryValue | null): bigint | undefined {
  const s = String(v ?? '').trim();
  return s === '' ? undefined : BigInt(s);
}
function clean(s: string | FormDataEntryValue | null): string | null {
  const t = String(s ?? '').trim();
  return t === '' ? null : t;
}

function touch() {
  revalidatePath('/admins/admins');
  revalidatePath('/admins');
}

/**
 * Add a new admin (password required) or edit an existing one.
 * When editing and the password field is empty, the existing hash is
 * kept — the current password is never reset implicitly.
 */
export async function upsertAdmin(fd: FormData): Promise<ActionResult> {
  const session = await requireAdmin();
  const id = toBigInt(fd.get('id'));

  const name = clean(fd.get('name'));
  const mobile = normalizeMobile(String(fd.get('mobile') ?? ''));
  const email = clean(fd.get('email'))?.toLowerCase() ?? null;
  if (!name || !mobile || !email) {
    return { ok: false, message: 'نام، موبایل معتبر و ایمیل الزامی است.' };
  }
  if (!EMAIL_RE.test(email)) return { ok: false, message: 'ایمیل معتبر نیست.' };

  const pwd = clean(fd.get('password'));
  if (pwd && pwd.length < 8) {
    return { ok: false, message: 'رمز عبور باید حداقل ۸ کاراکتر باشد.' };
  }
  const isActive = fd.get('isActive') === '1';

  try {
    if (id) {
      if (id === BigInt(session.id) && !isActive) {
        return { ok: false, message: 'نمی‌توانید حساب خود را غیرفعال کنید.' };
      }
      const data: {
        name: string;
        mobile: string;
        email: string;
        isActive: boolean;
        password?: string;
      } = { name, mobile, email, isActive };
      if (pwd) {
        data.password = await bcrypt.hash(pwd, 10);
      }
      await prisma.admin.update({ where: { id }, data });
    } else {
      if (!pwd) return { ok: false, message: 'برای مدیر جدید رمز عبور الزامی است.' };
      await prisma.admin.create({
        data: {
          name,
          mobile,
          email,
          password: await bcrypt.hash(pwd, 10),
          isActive: true,
        },
      });
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, message: 'این موبایل یا ایمیل قبلاً ثبت شده است.' };
    }
    throw e;
  }

  touch();
  return { ok: true };
}

/** Delete an admin; an admin cannot delete their own account. */
export async function deleteAdmin(adminId: string): Promise<ActionResult> {
  const session = await requireAdmin();
  if (adminId === session.id) {
    return { ok: false, message: 'نمی‌توانید حساب خود را حذف کنید.' };
  }
  const remaining = await prisma.admin.count({
    where: { isActive: true, id: { not: BigInt(adminId) } },
  });
  if (remaining === 0) {
    return { ok: false, message: 'حداقل یک مدیر فعال باید باقی بماند.' };
  }
  await prisma.admin.delete({ where: { id: BigInt(adminId) } });
  touch();
  return { ok: true };
}
