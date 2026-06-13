import projectData from '@/data/project.json';

import ProjectHero from '@/components/project/ProjectHero';
import ProjectNav from '@/components/project/ProjectNav';
import ProjectOverview from '@/components/project/ProjectOverview';
import ProjectBanner from '@/components/project/ProjectBanner';
import ProjectHighlights from '@/components/project/ProjectHighlights';

import ProjectGallery from '@/components/project/ProjectGallery';
import ProjectFixedBanner from '@/components/project/ProjectFixedBanner';
import ProjectAmenities from '@/components/project/ProjectAmenities';
import ProjectServices from '@/components/project/ProjectServices';
import ProjectFaqs from '@/components/project/ProjectFaqs';
import ProjectLocation from '@/components/project/ProjectLocation';
import ProjectSimilar from '@/components/project/ProjectSimilar';

export const metadata = {
  title: `${projectData.hero.title} | Investor's World Realty`,
  description: projectData.overview.description.substring(0, 160) + '...',
};

export default function ProjectPage() {
  return (
    <div className="bg-white">
      <ProjectHero data={projectData.hero} />
      <ProjectNav items={projectData.nav} />
      <ProjectOverview data={projectData.overview} />
      <ProjectBanner data={projectData.banner} />
      <ProjectHighlights data={projectData.highlights} />
      <ProjectGallery data={projectData.gallery} />
      <ProjectFixedBanner data={projectData.fixedBanner} />
      <ProjectAmenities data={projectData.amenities} />
      <ProjectServices data={projectData.services} />
      <ProjectFaqs data={projectData.faqs} />
      <ProjectLocation data={projectData.location} />
      <ProjectSimilar data={projectData.similar} />
    </div>
  );
}
