import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import ServicesSection from '@/components/home/ServicesSection';
import ProjectsSection from '@/components/home/ProjectsSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import StatsSection from '@/components/home/StatsSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';

async function getHomeData() {
  try {
    const res = await fetch('http://localhost:5001/api/home', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch home data');
    return res.json();
  } catch (error) {
    console.error('Error fetching live data, falling back to local JSON:', error);
    return import('@/data/homepage.json').then(mod => mod.default);
  }
}

export default async function Home() {
  const homeData = await getHomeData();

  return (
    <>
      <HeroSection data={homeData.hero} />
      <AboutSection data={homeData.about} />
      <ServicesSection data={homeData.services} />
      <ProjectsSection data={homeData.projects} />
      <FeaturesSection data={homeData.features} />
      <StatsSection data={homeData.stats} />
      <TestimonialsSection data={homeData.testimonials} />
    </>
  );
}
