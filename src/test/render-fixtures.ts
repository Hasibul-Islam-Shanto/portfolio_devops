import { experimental_AstroContainer as AstroContainer } from "astro/container";
import type { TestProject } from "vitest/node";

import Header from "../components/portfolio/header.astro";
import PipelineRail from "../components/portfolio/pipeline-rail.astro";
import CustomCursor from "../components/portfolio/custom-cursor.astro";
import Hero from "../components/portfolio/hero.astro";
import TechMarquee from "../components/portfolio/tech-marquee.astro";
import HeroTerminal from "../components/portfolio/hero-terminal.astro";
import DeployFlow from "../components/portfolio/deploy-flow.astro";
import DeployPipeline from "../components/portfolio/deploy-pipeline.astro";
import Work from "../components/portfolio/work.astro";
import HowIWork from "../components/portfolio/how-i-work.astro";
import Toolchain from "../components/portfolio/toolchain.astro";
import Certifications from "../components/portfolio/certifications.astro";
import Experience from "../components/portfolio/experience.astro";
import Testimonials from "../components/portfolio/testimonials.astro";
import Contact from "../components/portfolio/contact.astro";
import IndexPage from "../pages/index.astro";
import BlogPage from "../pages/blog/index.astro";
import CaseStudiesPage from "../pages/case-studies/index.astro";
import NotFoundPage from "../pages/404.astro";

/**
 * Astro components can only be compiled for SSR, which the jsdom test environment doesn't do.
 * So every component/page the tests need is rendered once here (Node side) with the Astro
 * Container API, then provided to the jsdom tests as HTML strings (see helpers.ts).
 */
const COMPONENTS = {
  header: Header,
  "pipeline-rail": PipelineRail,
  "custom-cursor": CustomCursor,
  hero: Hero,
  "tech-marquee": TechMarquee,
  "hero-terminal": HeroTerminal,
  "deploy-flow": DeployFlow,
  "deploy-pipeline": DeployPipeline,
  work: Work,
  "how-i-work": HowIWork,
  toolchain: Toolchain,
  certifications: Certifications,
  experience: Experience,
  testimonials: Testimonials,
  contact: Contact,
  index: IndexPage,
  blog: BlogPage,
  "case-studies": CaseStudiesPage,
  "404": NotFoundPage,
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
