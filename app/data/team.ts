import type { TeamMember } from '@/app/types';

export const team: TeamMember[] = [
  {
    slug: 'arash-mohammadi',
    name: 'آرش محمدی',
    role: 'مدیرعامل و مشاور ارشد مالی',
    expertise: 'مدیریت مالی، برنامه‌ریزی راهبردی',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=700&q=80',
    bio: 'بیش از پانزده سال تجربه در حوزه مالی و حسابداری شرکت‌ها؛ راهبری پروژه‌های تحول مالی و همراهی مدیران در تصمیم‌گیری‌های کلیدی.',
  },
  {
    slug: 'naznin-rahimi',
    name: 'نازنین رحیمی',
    role: 'مدیر آموزش و توسعه',
    expertise: 'آموزش حسابداری، طراحی دوره',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=700&q=80',
    bio: 'طراح مسیرهای آموزشی کاربردی و پروژه‌محور؛ متخصص تبدیل مفاهیم پیچیده مالی به آموزش‌های روشن و قابل اجرا.',
  },
  {
    slug: 'sara-mahdavi',
    name: 'سارا مهدوی',
    role: 'مشاور ارشد مالیاتی',
    expertise: 'مالیات بر ارزش افزوده، دفاع مالیاتی',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80',
    bio: 'متخصص پرونده‌های مالیاتی و تنظیم لایحه اعتراض؛ همراه کسب‌وکارها در مسیر کاهش ریسک‌های مالیاتی.',
  },
  {
    slug: 'farhad-karimi',
    name: 'فرهاد کریمی',
    role: 'مدیر حسابرسی',
    expertise: 'حسابرسی مستقل، کنترل داخلی',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=700&q=80',
    bio: 'حسابرس با تجربه در بررسی صورت‌های مالی و استقرار سیستم‌های کنترل داخلی در مجموعه‌های متوسط و بزرگ.',
  },
  {
    slug: 'elham-kiani',
    name: 'الهام کیانی',
    role: 'مدیر جذب و استعدادها',
    expertise: 'جذب نیرو، ارزیابی مهارت',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=700&q=80',
    bio: 'متخصص شناسایی استعدادهای حسابداری و تطبیق نیاز کارفرما با مهارت متقاضیان برای یک جذب موفق.',
  },
  {
    slug: 'mehdi-naseri',
    name: 'مهدی ناصری',
    role: 'تحلیلگر ارشد مالی',
    expertise: 'تحلیل صورت‌های مالی، بودجه‌بندی',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80',
    bio: 'طراح مدل‌های تحلیل مالی و بودجه‌بندی؛ ارائه‌دهنده گزارش‌های مدیریتی روشن برای تصمیم‌گیری مدیران.',
  },
];

export function getMember(slug: string) {
  return team.find((m) => m.slug === slug);
}
