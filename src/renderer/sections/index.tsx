import type { SectionType } from "@/lib/types";
import type { SectionProps } from "../primitives";
import { AboutSection } from "./about";
import { CareerSection } from "./career";
import {
  ClientsSection,
  CtaSection,
  FaqSection,
  LanguagesSection,
  PricingSection,
  ServicesSection,
  StatsSection,
  TestimonialsSection,
} from "./commerce";
import { ContactSection } from "./contact";
import { HeroSection } from "./hero";
import { BlogSection, CustomSection, GallerySection, ProjectsSection, SkillsSection } from "./work";

/**
 * Section type → renderer.
 *
 * Career-shaped sections (experience, education, publications, certifications,
 * awards) all share one renderer because they present the same entry shape;
 * their differences are expressed through variants and options instead.
 */
const RENDERERS: Record<SectionType, (props: SectionProps) => React.ReactNode> = {
  hero: HeroSection,
  about: AboutSection,
  experience: CareerSection,
  education: CareerSection,
  publications: CareerSection,
  certifications: CareerSection,
  awards: CareerSection,
  projects: ProjectsSection,
  skills: SkillsSection,
  gallery: GallerySection,
  blog: BlogSection,
  services: ServicesSection,
  pricing: PricingSection,
  stats: StatsSection,
  testimonials: TestimonialsSection,
  faq: FaqSection,
  languages: LanguagesSection,
  clients: ClientsSection,
  contact: ContactSection,
  cta: CtaSection,
  custom: CustomSection,
};

export function SectionRenderer(props: SectionProps) {
  const Component = RENDERERS[props.section.type] ?? CustomSection;
  return <Component {...props} />;
}
