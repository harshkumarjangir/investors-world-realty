export default function ProjectFixedBanner({ data }) {
  return (
    <section 
      className="relative w-full h-[60vh] min-h-[500px] bg-fixed bg-center bg-cover"
      style={{ backgroundImage: `url(${data.image})` }}
    >
      <div className="absolute inset-0 bg-dark-bg/20"></div>
    </section>
  );
}
