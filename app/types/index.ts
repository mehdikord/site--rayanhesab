export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  dateIso: string;
  readingTime: number;
  author: string;
  authorRole: string;
  content: { heading?: string; paragraphs: string[]; list?: string[] }[];
  related: string[];
}

export interface Service {
  slug: string;
  title: string;
  short: string;
  excerpt: string;
  icon: string;
  image: string;
  accent: string;
  problems: string[];
  scope: { title: string; description: string }[];
  benefits: string[];
  process: { step: string; title: string; description: string }[];
  audience: string[];
  faqs: { q: string; a: string }[];
  related: string[];
}

export interface Course {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  image: string;
  category: string;
  instructor: string;
  instructorRole: string;
  duration: string;
  level: string;
  price: number;
  originalPrice?: number;
  featured?: boolean;
  tags: string[];
  objectives: string[];
  audience: string[];
  prerequisites: string[];
  curriculum: { title: string; duration: string; lessons: string[] }[];
  faqs: { q: string; a: string }[];
  related: string[];
}

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  expertise: string;
  image: string;
  bio: string;
}

export interface FaqItem {
  q: string;
  a: string;
}
