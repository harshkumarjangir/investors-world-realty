export default function ProjectBanner({ data }) {
  return (
    <section className="w-full h-[70vh] min-h-[500px]">
      <img 
        src={data.image} 
        alt="Project Lifestyle" 
        className="w-full h-full object-cover"
      />
    </section>
  );
}
