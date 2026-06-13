import homeData from '@/data/homepage.json';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import ServicesSection from '@/components/home/ServicesSection';
import ProjectsSection from '@/components/home/ProjectsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import StatsSection from '@/components/home/StatsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

export default function Home() {
  return (
    <>
      <HeroSection data={homeData.hero} />
      <AboutSection data={homeData.about} />
      <ServicesSection data={homeData.services} />
      <ProjectsSection data={homeData.projects} />
      <FeaturesSection data={homeData.features} />
      <StatsSection data={homeData.stats} />
      <TestimonialsSection />
    </>
  );
}
