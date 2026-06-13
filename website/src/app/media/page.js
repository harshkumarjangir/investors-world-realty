import mediaData from '@/data/media.json';
import aboutData from '@/data/about.json'; // reusing CTA block from about page
import CtaBlock from '@/components/common/CtaBlock';

import MediaHero from '@/components/media/MediaHero';
import EventsSection from '@/components/media/EventsSection';
import GallerySection from '@/components/media/GallerySection';
import NewsTestimonialsSection from '@/components/media/NewsTestimonialsSection';

export const metadata = {
  title: "Media Presence | Investor's World Realty",
  description: "Explore Investor's World Realty's media presence, upcoming events, news coverage, and photo gallery.",
};

export default function MediaPage() {
  return (
    <>
      <MediaHero data={mediaData.hero} />
      <EventsSection data={mediaData.events} />
      <GallerySection data={mediaData.gallery} />
      <NewsTestimonialsSection data={mediaData} />
      <CtaBlock data={aboutData.cta} />
    </>
  );
}
