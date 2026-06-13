export default function MediaHero({ data }) {
  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden bg-dark-bg border-b-4 border-gold-500">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-dark-bg/85 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2000&q=80" 
          alt="Media Presence" 
          className="w-full h-full object-cover filter grayscale opacity-50"
        />
      </div>

      <div className="relative z-20 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-serif text-white mb-6 tracking-tight drop-shadow-md">
          {data.title}
        </h1>
        <div className="h-1 w-24 bg-gold-500 mx-auto mb-6 rounded-full"></div>
        <p className="text-xl md:text-2xl text-gold-100 font-light drop-shadow-sm">
          {data.subtitle}
        </p>
      </div>
    </section>
  );
}
