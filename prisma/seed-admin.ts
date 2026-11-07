/**
 * Create or update an admin account.
 *
 *   npm run seed:admin -- --name "Admin" --mobile 09120000000 --password "secret123" [--email admin@example.com]
 *
 * Values can also come from ADMIN_NAME / ADMIN_MOBILE / ADMIN_PASSWORD / ADMIN_EMAIL.
 * When an admin with the same mobile exists, its name and password are updated
 * and it is re-activated (existing sessions are invalidated by the new password).
 */
import { parseArgs } from 'node:util';
import bcrypt from 'bcryptjs';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';
import { EMAIL_RE, normalizeMobile } from '../app/lib/validation.ts';

const { values } = parseArgs({
  options: {
    name: { type: 'string' },
    mobile: { type: 'string' },
    password: { type: 'string' },
    email: { type: 'string' },
  },
});

const name = (values.name ?? process.env.ADMIN_NAME ?? '').trim();
const mobile = normalizeMobile(values.mobile ?? process.env.ADMIN_MOBILE ?? '');
const password = values.password ?? process.env.ADMIN_PASSWORD ?? '';
const emailArg = (values.email ?? process.env.ADMIN_EMAIL ?? '').trim().toLowerCase();

function fail(msg: string): never {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

if (!name) fail('name is required (--name).');
if (!mobile) fail('a valid Iranian mobile is required (--mobile 09xxxxxxxxx).');
if (password.length < 8) fail('password must be at least 8 characters (--password).');
if (emailArg && !EMAIL_RE.test(emailArg)) fail('email is not valid (--email).');
if (!process.env.DATABASE_URL) fail('DATABASE_URL is not set.');

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) });

try {
  const hash = await bcrypt.hash(password, 10);
  const existing = await prisma.admin.findUnique({ where: { mobile } });

  if (existing) {
    await prisma.admin.update({
      where: { id: existing.id },
      data: { name, password: hash, isActive: true, ...(emailArg ? { email: emailArg } : {}) },
    });
    console.log(`✓ Updated admin #${existing.id} (${mobile}).`);
  } else {
    // email is required and unique in the schema; derive one when not given.
    const email = emailArg || `admin-${mobile}@rayanhesab.local`;
    const created = await prisma.admin.create({
      data: { name, mobile, email, password: hash, isActive: true },
    });
    console.log(`✓ Created admin #${created.id} (${mobile}, ${email}).`);
  }
} catch (e) {
  fail(e instanceof Error ? e.message : String(e));
} finally {
  await prisma.$disconnect();
}
