import aboutData from '@/data/about.json';
import homeData from '@/data/homepage.json';

import AboutHero from '@/components/about/AboutHero';
import FounderSection from '@/components/about/FounderSection';
import MissionVision from '@/components/about/MissionVision';
import StatsSection from '@/components/home/StatsSection';
import CtaBlock from '@/components/common/CtaBlock';

export const metadata = {
  title: "About Us | Investor's World Realty",
  description: "Learn about Investor's World Realty Pvt. Ltd., our founder Deepak Yadav, and our mission to make real estate investment simple and transparent.",
};

export default function AboutPage() {
  return (
    <>
      <AboutHero data={aboutData.hero} />
      <StatsSection data={homeData.stats} />
      <FounderSection data={aboutData.founder} />
      <MissionVision data={aboutData.missionVision} />
      <CtaBlock data={aboutData.cta} />
    </>
  );
}
