import mongoose from 'mongoose';

const homePageSchema = new mongoose.Schema({
  hero: {
    title: String,
    subtitle: String,
    description: String,
    cta: {
      primary: {
        text: String,
        link: String
      },
      secondary: {
        text: String,
        link: String
      }
    }
  },
  about: {
    title: String,
    subtitle: String,
    image: String,
    content: [String]
  },
  services: {
    title: String,
    description: String,
    cta: {
      text: String,
      link: String
    },
    items: [{
      title: String,
      description: String,
      icon: String,
      image: String
    }]
  },
  projects: {
    pillText: String,
    mainHeading: String,
    subtitle: String,
    title: String,
    items: [{
      name: String,
      status: String,
      location: String,
      image: String,
      slug: String // Reference to dynamic project slug
    }]
  },
  features: {
    title: String,
    subtitle: String,
    cta: {
      text: String,
      link: String
    },
    items: [{
      title: String,
      description: String,
      icon: String
    }]
  },
  stats: {
    title: String,
    subtitle: String,
    image: String,
    items: [{
      value: String,
      label: String
    }]
  },
  testimonials: {
    title: String,
    subtitle: String,
    items: [{
      name: String,
      location: String,
      review: String,
      color: String,
      initial: String
    }]
  }
}, { timestamps: true });

const HomePage = mongoose.model('HomePage', homePageSchema);
export default HomePage;
