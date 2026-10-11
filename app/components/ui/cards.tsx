import Image from 'next/image';
import Link from 'next/link';
import { Clock, GraduationCap, CalendarDays, ArrowUpLeft } from 'lucide-react';
import type { Course, Article, Service, TeamMember } from '@/app/types';
import { Badge } from '@/app/components/ui/Badge';
import { Icon } from '@/app/components/ui/Icon';
import { formatPrice, discountPercent, toFa, cn } from '@/app/lib/utils';

export function CourseCard({ course, className }: { course: Course; className?: string }) {
  const off = discountPercent(course.price, course.originalPrice);
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-[26px] border border-cloud-300 bg-white shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-lift',
        className,
      )}
    >
      <Link href={`/courses/${course.slug}`} className="img-frame relative block aspect-[16/10] overflow-hidden rounded-b-none">
        <Image
          src={course.image}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/55 via-navy-950/5 to-transparent" />
        <div className="absolute right-4 top-4 flex gap-2">
          <Badge tone="navy">{course.category}</Badge>
          {off && <Badge tone="gold">{toFa(off)}٪ تخفیف</Badge>}
        </div>
        <span className="absolute bottom-4 right-4 text-[12px] font-semibold text-white/85">{course.level}</span>
      </Link>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Link href={`/courses/${course.slug}`}>
          <h3 className="text-[16.5px] font-extrabold leading-8 text-navy-900 transition-colors group-hover:text-brand-600">
            {course.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-7 text-ink-500">{course.excerpt}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12.5px] text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-brand-500" aria-hidden="true" />
            {course.instructor}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand-500" aria-hidden="true" />
            {course.duration}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-cloud-200 pt-4">
          <div className="flex flex-col">
            {course.originalPrice && (
              <span className="text-[12.5px] text-ink-400 line-through">{formatPrice(course.originalPrice)} تومان</span>
            )}
            <span className="text-[17px] font-black text-navy-900">
              {formatPrice(course.price)} <span className="text-[12px] font-semibold text-ink-500">تومان</span>
            </span>
          </div>
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-navy-900 px-4 py-2.5 text-[12.5px] font-bold text-white transition-colors hover:bg-brand-600"
          >
            جزئیات دوره
            <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function CourseCardWide({ course }: { course: Course }) {
  const off = discountPercent(course.price, course.originalPrice);
  return (
    <article className="group grid overflow-hidden rounded-[28px] border border-cloud-300 bg-white shadow-card transition-shadow duration-500 hover:shadow-lift lg:grid-cols-2">
      <Link href={`/courses/${course.slug}`} className="img-frame relative block aspect-[16/11] lg:aspect-auto lg:min-h-[340px]">
        <Image src={course.image} alt={course.title} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent lg:bg-gradient-to-l" />
        <div className="absolute right-4 top-4 flex gap-2">
          <Badge tone="navy">دوره ویژه</Badge>
          {off && <Badge tone="gold">{toFa(off)}٪ تخفیف</Badge>}
        </div>
      </Link>
      <div className="flex flex-col justify-center p-6 sm:p-9">
        <span className="text-[13px] font-bold text-brand-600">{course.category}</span>
        <h3 className="mt-3 text-2xl font-black leading-[1.5] text-navy-900">{course.title}</h3>
        <p className="mt-3 text-[14px] leading-8 text-ink-500">{course.excerpt}</p>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-brand-500" aria-hidden="true" /> {course.instructor}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-brand-500" aria-hidden="true" /> {course.duration}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-brand-500" aria-hidden="true" /> {course.level}
          </span>
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <span className="text-2xl font-black text-navy-900">
            {formatPrice(course.price)} <span className="text-[13px] font-semibold text-ink-500">تومان</span>
          </span>
          {course.originalPrice && (
            <span className="text-[14px] text-ink-400 line-through">{formatPrice(course.originalPrice)} تومان</span>
          )}
          <Link
            href={`/courses/${course.slug}`}
            className="ms-auto inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-[13px] font-bold text-white transition-colors hover:bg-brand-600"
          >
            مشاهده و ثبت‌نام
            <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ArticleCard({ article, featured }: { article: Article; featured?: boolean }) {
  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-[28px] border border-cloud-300 shadow-card">
        <Link href={`/articles/${article.slug}`} className="block">
          <div className="img-frame relative aspect-[16/12] sm:aspect-[16/9] lg:aspect-[16/10]">
            <Image
              src={article.image}
              alt={article.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/45 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border-0 bg-white/15 px-3 py-1 text-[12px] font-bold text-white backdrop-blur">
                {article.category}
              </span>
              <span className="flex items-center gap-1.5 text-[12.5px] text-white/70">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> {article.date}
              </span>
              <span className="flex items-center gap-1.5 text-[12.5px] text-white/70">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {toFa(article.readingTime)} دقیقه مطالعه
              </span>
            </div>
            <h3 className="mt-4 max-w-2xl text-xl font-black leading-[1.6] text-white sm:text-2xl">
              {article.title}
            </h3>
            <p className="mt-3 hidden max-w-xl text-[14px] leading-8 text-white/70 sm:block">{article.excerpt}</p>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex gap-4 rounded-[22px] border border-cloud-300 bg-white p-3 shadow-card transition-all duration-400 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift">
      <Link href={`/articles/${article.slug}`} className="img-frame relative h-24 w-28 shrink-0 overflow-hidden rounded-[16px] sm:h-28 sm:w-36">
        <Image src={article.image} alt={article.title} fill sizes="150px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-center py-1 pe-2">
        <div className="flex items-center gap-3 text-[11.5px] text-ink-400">
          <span className="font-bold text-brand-600">{article.category}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden="true" /> {toFa(article.readingTime)} دقیقه
          </span>
        </div>
        <Link href={`/articles/${article.slug}`}>
          <h3 className="mt-2 line-clamp-2 text-[15px] font-bold leading-7 text-navy-900 transition-colors group-hover:text-brand-600">
            {article.title}
          </h3>
        </Link>
        <span className="mt-1.5 text-[11.5px] text-ink-400">{article.date}</span>
      </div>
    </article>
  );
}

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[26px] border border-cloud-300 bg-white shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-lift">
      <div className="img-frame relative aspect-[16/10]">
        <Image
          src={service.image}
          alt={service.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-navy-950/20 to-transparent" />
        <span className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-2xl bg-white/95 text-brand-600 shadow-card backdrop-blur">
          <Icon name={service.icon} className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="absolute bottom-4 right-5 text-[12px] font-bold tracking-widest text-white/70" dir="ltr">
          {toFa(String(index + 1).padStart(2, '0'))}
        </span>
        <h3 className="absolute bottom-4 left-5 right-16 text-[16px] font-extrabold text-white">{service.short}</h3>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h4 className="text-[17px] font-extrabold leading-8 text-navy-900">{service.title}</h4>
        <p className="mt-3 flex-1 text-[13.5px] leading-7 text-ink-500">{service.excerpt}</p>
        <Link
          href={`/services/${service.slug}`}
          className="mt-5 inline-flex items-center gap-2 text-[13.5px] font-bold text-brand-600 transition-colors hover:text-brand-700"
        >
          اطلاعات بیشتر
          <ArrowUpLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 group-hover:translate-y-1" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group overflow-hidden rounded-[26px] border border-cloud-300 bg-white shadow-card transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift">
      <div className="img-frame relative aspect-[4/5]">
        <Image src={member.image} alt={member.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent opacity-90" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="text-[17px] font-extrabold text-white">{member.name}</h3>
          <p className="mt-1 text-[12.5px] font-semibold text-brand-200">{member.role}</p>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[13px] leading-7 text-ink-500">{member.bio}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold text-brand-600">
          <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
          {member.expertise}
        </span>
      </div>
    </article>
  );
}
