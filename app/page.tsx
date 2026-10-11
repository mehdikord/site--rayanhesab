import { Hero } from "@/app/components/home/Hero";
import { TrustStrip } from "@/app/components/home/TrustStrip";
import { ServicesOverview } from "@/app/components/home/ServicesOverview";
import { CoursesShowcase } from "@/app/components/home/CoursesShowcase";
import { RecruitmentSection } from "@/app/components/home/RecruitmentSection";
import { HowItWorks } from "@/app/components/home/HowItWorks";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <Hero />
        <TrustStrip />
        <ServicesOverview />
        <CoursesShowcase />
        <RecruitmentSection />
        <HowItWorks />
      </main>
    </div>
  );
}
