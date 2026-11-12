import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { TestProject } from "vitest/node";

import Header from "../components/navbar/header.astro";
import PipelineRail from "../components/pipeline-rail/pipeline-rail.astro";
import CustomCursor from "../components/shared/custom-cursor.astro";
import Hero from "../components/hero/hero.astro";
import TechMarquee from "../components/logos/tech-marquee.astro";
import HeroTerminal from "../components/hero/hero-terminal.astro";
import Work from "../components/projects/work.astro";
import HowIWork from "../components/how-it-works/how-i-work.astro";
import Toolchain from "../components/toolstack/toolchain.astro";
import Certifications from "../components/certifications/certifications.astro";
import Experience from "../components/experience/experience.astro";
import Contact from "../components/contact/contact.astro";
import IndexPage from "../pages/index.astro";
import BlogPage from "../pages/blog/index.astro";
import ProjectsPage from "../pages/projects.astro";
import AboutPage from "../pages/about.astro";
import CaseStudiesPage from "../pages/case-studies/index.astro";
import NotFoundPage from "../pages/404.astro";
import AchievementsPage from "../pages/achievements.astro";
import LearningsPage from "../pages/learnings/index.astro";

const COMPONENTS = {
  header: Header,
  "pipeline-rail": PipelineRail,
  "custom-cursor": CustomCursor,
  hero: Hero,
  "tech-marquee": TechMarquee,
  "hero-terminal": HeroTerminal,
  work: Work,
  "how-i-work": HowIWork,
  toolchain: Toolchain,
  certifications: Certifications,
  experience: Experience,
  contact: Contact,
  index: IndexPage,
  projects: ProjectsPage,
  about: AboutPage,
  blog: BlogPage,
  "case-studies": CaseStudiesPage,
  "404": NotFoundPage,
  achievements: AchievementsPage,
  learnings: LearningsPage,
} as const;

export type FixtureName = keyof typeof COMPONENTS;

export default async function setup(project: TestProject) {
  const container = await AstroContainer.create();
  const fixtures: Record<string, string> = {};
  for (const [name, component] of Object.entries(COMPONENTS)) {
    fixtures[name] = await container.renderToString(
      component,
      name === "header" ? { props: { currentPath: "/" } } : {},
    );
  }
  project.provide("fixtures", fixtures);
}

declare module "vitest" {
  export interface ProvidedContext {
    fixtures: Record<string, string>;
  }
}
