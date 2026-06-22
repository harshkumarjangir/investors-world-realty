import { MapPin } from 'lucide-react';

export default function ProjectsSection({ data }) {
  if (!data) return null;

  const currentProjects = data.items?.filter(p => p.status === 'Current') || [];
  const pastProjects = data.items?.filter(p => p.status !== 'Current') || [];

  return (
    <section id="projects" className="section-padding bg-dark-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-gold-500" />
            <span className="text-gold-400 text-xs font-bold tracking-[0.25em] uppercase">{data.pillText || 'Our Projects'}</span>
            <div className="h-px w-10 bg-gold-500" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            {data.mainHeading || 'Crafted for Premium Living'}
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl">{data.subtitle || 'Hand-Picked. Carefully Evaluated. Built for Investors.'}</p>
        </div>

        {/* Current Projects (Featured Large) */}
        {currentProjects.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
              <span className="text-gold-400 text-sm font-bold uppercase tracking-widest">Ongoing Projects</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentProjects.map((project, i) => (
                <div key={i} className="relative h-[400px] rounded-3xl overflow-hidden group cursor-pointer">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  {/* Live badge */}
                  <div className="absolute top-5 left-5 z-20 flex items-center gap-2 bg-gold-500/20 backdrop-blur-md border border-gold-500/40 rounded-full px-4 py-1.5">
                    <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
                    <span className="text-gold-300 text-xs font-bold uppercase tracking-widest">Live</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                      {project.name}
                    </h3>
                    {project.location && (
                      <div className="flex items-center gap-2 text-gold-400">
                        <MapPin size={14} />
                        <span className="text-sm">{project.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Projects (Horizontal scroll) */}
        {pastProjects.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">Completed Projects</span>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory">
              {pastProjects.map((project, i) => (
                <div key={i} className="relative min-w-[280px] h-[320px] rounded-2xl overflow-hidden group cursor-pointer shrink-0 snap-center">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-4 left-4 glass rounded-full px-3 py-1">
                    <span className="text-gray-300 text-[10px] font-bold uppercase tracking-widest">Sold Out</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>{project.name}</h3>
                    {project.location && (
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <MapPin size={12} />
                        <span className="text-xs">{project.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
