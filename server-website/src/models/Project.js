import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  hero: {
    title: String,
    image: String
  },
  nav: [{
    label: String,
    link: String
  }],
  overview: {
    logo: String,
    tagline: String,
    rera: String,
    subtitle: String,
    description: String,
    stats: [{
      value: String,
      label: String
    }],
    cta: {
      text: String,
      link: String
    }
  },
  banner: {
    image: String
  },
  highlights: {
    title: String,
    items: [{
      title: String,
      description: String,
      image: String
    }]
  },
  gallery: {
    title: String,
    tabs: [String],
    images: [{
      url: String,
      category: String
    }]
  },
  fixedBanner: {
    image: String
  },
  amenities: {
    title: String,
    items: [{
      title: String,
      icon: String
    }]
  },
  services: {
    title: String,
    items: [{
      title: String,
      icon: String
    }]
  },
  faqs: {
    title: String,
    items: [{
      question: String,
      answer: String
    }]
  },
  location: {
    title: String,
    mapUrl: String
  },
  similar: {
    title: String,
    linkText: String,
    linkUrl: String,
    items: [{
      badge: String,
      badgeColor: String,
      image: String,
      title: String,
      type: { type: String },
      location: String,
      price: String,
      size: String,
      projectSlug: String // Optional reference to another project
    }]
  }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
