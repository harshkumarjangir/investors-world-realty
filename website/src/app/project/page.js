import Link from 'next/link';
import { MapPin, Compass } from 'lucide-react';

async function getProjects() {
  try {
    const res = await fetch('http://localhost:5001/api/projects', { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export const metadata = {
  title: 'All Projects | Investor\'s World Realty',
  description: 'Explore all our premium real estate projects.',
};

export default async function ProjectsListingPage() {
  const projects = await getProjects();

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-dark-bg mb-4">Our Projects</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover our portfolio of premium residential and commercial properties designed for elevated living and high returns.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div key={project.slug} className="border border-gray-200 group bg-white hover:shadow-xl transition-shadow duration-300">
              {/* Image */}
              <div className="relative h-[250px] w-full overflow-hidden">
                <img
                  src={project.hero?.image || '/placeholder.jpg'}
                  alt={project.hero?.title || 'Project'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-2xl font-serif text-dark-bg mb-2">{project.hero?.title || 'Project'}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{project.overview?.subtitle}</p>
                </div>

                {project.overview?.stats && project.overview.stats.length > 0 && (
                  <div className="flex items-center text-gray-500 text-sm mb-6">
                    <MapPin size={14} className="mr-1" />
                    {project.overview.stats[0].value} {project.overview.stats[0].label}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                  <Link href={`/project/${project.slug}`} className="flex-1 bg-gold-600 hover:bg-gold-700 text-white py-3 px-4 text-sm font-medium transition-colors flex items-center justify-center">
                    <Compass size={16} className="mr-2" />
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No projects available at the moment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
