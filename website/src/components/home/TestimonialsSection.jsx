export default function TestimonialsSection() {
  const testimonials = [
    {
      initial: "R",
      name: "Rohit Sharma",
      location: "Google Review - Jaipur",
      color: "bg-teal-500",
      review: "Investor's World Realty has been exceptional throughout the entire process. From the moment we visited to getting possession, everything was smooth and professional. The quality of their service is top-notch. Truly Jaipur's best real estate consultants!"
    },
    {
      initial: "P",
      name: "Priya Agarwal",
      location: "Google Review - Vaishali Nagar",
      color: "bg-teal-400",
      review: "We purchased a 3 BHK flat and the experience has been absolutely wonderful. They guided us to a project that is truly a landmark and the amenities are world-class. Investor's World delivered on every promise — with transparency and trust."
    },
    {
      initial: "A",
      name: "Ashok Gupta",
      location: "Google Review - Ajmer Road",
      color: "bg-teal-500",
      review: "Investing with them was the best decision of our lives. We found a beautifully designed property with Vastu-compliant layouts and premium fittings. The team was responsive, transparent, and truly customer-centric throughout the entire journey."
    }
  ];

  return (
    <section className="py-24 bg-[#0a1120] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif mb-4 tracking-wide">
            What Our <span className="text-[#38bdf8]">Customers</span> Say
          </h2>
          <p className="text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
            Homeowners across Jaipur share their experience of choosing Investor's World Realty — and making it home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-[#1e293b]/50 border border-white/5 rounded-2xl p-8 flex flex-col justify-between hover:bg-[#1e293b] transition-colors duration-300">
              <div>
                <div className="flex gap-1 text-[#38bdf8] mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-300 text-[15px] italic leading-relaxed mb-8">
                  "{testimonial.review}"
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${testimonial.color}`}>
                  {testimonial.initial}
                </div>
                <div>
                  <h4 className="text-white text-sm font-bold tracking-wide">{testimonial.name}</h4>
                  <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
