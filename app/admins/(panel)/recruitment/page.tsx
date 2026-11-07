import { prisma } from '@/app/lib/prisma';
import { PageTitle, Card, CardHeader } from '@/app/admins/_components/kit';
import { RecruitmentManager, type CompanyRow, type JobRow, type TalentRow, type ReferralRow } from './_RecruitmentManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'جذب نیرو' };

export default async function RecruitmentPage() {
  const [companies, jobs, talents, referrals, allTalentApps, allJobs] = await Promise.all([
    prisma.company.findMany({
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: { jobRequests: { select: { id: true } } },
    }),
    prisma.jobRequest.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        company: { select: { name: true, contactName: true, mobile: true } },
        admin: { select: { name: true } },
        _count: { select: { referrals: true } },
      },
    }),
    prisma.talentApplication.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        user: { select: { name: true } },
        admin: { select: { name: true } },
        _count: { select: { referrals: true } },
      },
    }),
    prisma.talentReferral.findMany({
      orderBy: [{ createdAt: 'desc' }],
      include: {
        jobRequest: { select: { position: true, company: { select: { name: true } } } },
        talentApplication: { select: { fullName: true } },
      },
    }),
    prisma.talentApplication.findMany({
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true },
    }),
    prisma.jobRequest.findMany({
      orderBy: { position: 'asc' },
      select: { id: true, position: true, company: { select: { name: true } } },
    }),
  ]);

  const companyRows: CompanyRow[] = companies.map((c) => ({
    id: String(c.id),
    name: c.name,
    contactName: c.contactName,
    mobile: c.mobile,
    email: c.email,
    city: c.city,
    address: c.address,
    website: c.website,
    description: c.description,
    status: c.status,
    adminNote: c.adminNote,
    jobCount: c.jobRequests.length,
    createdAt: c.createdAt.toISOString(),
  }));

  const jobRows: JobRow[] = jobs.map((j) => ({
    id: String(j.id),
    companyName: j.company?.name ?? '—',
    position: j.position,
    city: j.city,
    status: j.status,
    employmentType: j.employmentType,
    salaryRange: j.salaryRange,
    adminNote: j.adminNote,
    handledByName: j.admin?.name ?? null,
    referralCount: j._count.referrals,
    requiredExperience: j.requiredExperience,
    skills: j.skills,
    description: j.description,
    contactName: j.company?.contactName ?? '',
    contactMobile: j.company?.mobile ?? '',
    createdAt: j.createdAt.toISOString(),
  }));

  const talentRows: TalentRow[] = talents.map((t) => ({
    id: String(t.id),
    fullName: t.fullName,
    mobile: t.mobile,
    email: t.email,
    city: t.city,
    position: t.position,
    experience: t.experience,
    employmentType: t.employmentType,
    status: t.status,
    adminNote: t.adminNote,
    reviewedBy: t.reviewedBy !== null ? String(t.reviewedBy) : null,
    reviewedByName: t.admin?.name ?? null,
    skills: t.skills,
    intro: t.intro,
    hasResume: Boolean(t.resumePath),
    createdAt: t.createdAt.toISOString(),
  }));

  const referralRows: ReferralRow[] = referrals.map((r) => ({
    id: String(r.id),
    jobRequestId: String(r.jobRequestId),
    talentApplicationId: String(r.talentApplicationId),
    jobTitle: `${r.jobRequest.company.name} · ${r.jobRequest.position}`,
    talentName: r.talentApplication.fullName,
    status: r.status,
    interviewAt: r.interviewAt?.toISOString() ?? null,
    note: r.note,
    createdAt: r.createdAt.toISOString(),
  }));

  const talentOptions = allTalentApps.map((t) => ({ id: String(t.id), name: t.fullName }));
  const jobOptions = allJobs.map((j) => ({
    id: String(j.id),
    name: `${j.company.name} · ${j.position}`,
  }));

  return (
    <div>
      <PageTitle
        title="جذب نیرو"
        description="مدیریت شرکت‌ها، درخواست‌های شغلی، کاندیداها و معرف‌ها"
      />
      <Card>
        <CardHeader
          title="جذب نیرو"
          description={`${(companyRows.length + jobRows.length + talentRows.length + referralRows.length).toLocaleString('fa-IR')} مورد`}
        />
        <RecruitmentManager
          companies={companyRows}
          jobs={jobRows}
          talents={talentRows}
          referrals={referralRows}
          talentOptions={talentOptions}
          jobOptions={jobOptions}
        />
      </Card>
    </div>
  );
}
