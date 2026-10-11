import Link from 'next/link';
import { Container } from '@/app/components/ui/Section';
import { ButtonLink } from '@/app/components/ui/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col bg-white pt-[68px]">
      <Container className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <span className="text-sm font-bold tracking-[0.2em] text-brand-600" dir="ltr">
          404
        </span>
        <h1 className="mt-3 text-3xl font-black text-navy-900 sm:text-4xl">صفحه مورد نظر یافت نشد</h1>
        <p className="mt-4 max-w-md text-[14px] leading-8 text-ink-500">
          لینکی که دنبال آن بودید وجود ندارد یا جابه‌جا شده است. از دکمه زیر به صفحه اصلی برگردید.
        </p>
        <ButtonLink href="/" variant="primary" size="lg" className="mt-7">
          بازگشت به صفحه اصلی
        </ButtonLink>
      </Container>
    </div>
  );
}
