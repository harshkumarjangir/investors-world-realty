import { notFound } from 'next/navigation';
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

async function getProjectData(slug) {
  try {
    const res = await fetch(`http://localhost:5001/api/projects/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error('Error fetching project data:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const projectData = await getProjectData(slug);
  if (!projectData) return { title: 'Project Not Found | Investor\'s World Realty' };
  
  return {
    title: `${projectData.hero?.title || 'Project'} | Investor's World Realty`,
    description: projectData.overview?.description ? projectData.overview.description.substring(0, 160) + '...' : 'Explore premium properties with Investor\'s World Realty',
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const projectData = await getProjectData(slug);

  if (!projectData) {
    notFound();
  }

  return (
    <div className="bg-white">
      {projectData.hero && <ProjectHero data={projectData.hero} />}
      {projectData.nav && <ProjectNav items={projectData.nav} />}
      {projectData.overview && <ProjectOverview data={projectData.overview} />}
      {projectData.banner && <ProjectBanner data={projectData.banner} />}
      {projectData.highlights && <ProjectHighlights data={projectData.highlights} />}
      {projectData.gallery && <ProjectGallery data={projectData.gallery} />}
      {projectData.fixedBanner && <ProjectFixedBanner data={projectData.fixedBanner} />}
      {projectData.amenities && <ProjectAmenities data={projectData.amenities} />}
      {projectData.services && <ProjectServices data={projectData.services} />}
      {projectData.faqs && <ProjectFaqs data={projectData.faqs} />}
      {projectData.location && <ProjectLocation data={projectData.location} />}
      {projectData.similar && <ProjectSimilar data={projectData.similar} />}
    </div>
  );
}
