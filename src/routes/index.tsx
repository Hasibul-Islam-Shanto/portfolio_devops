import { createFileRoute } from "@tanstack/react-router";
import { Fragment, type ReactNode } from "react";
import { Header } from "@/components/portfolio/Header";
import { PipelineRail } from "@/components/portfolio/PipelineRail";
import { Hero } from "@/components/portfolio/Hero";
import { Work } from "@/components/portfolio/Work";
import {
  HowIWork,
  Toolchain,
  Certifications,
  Experience,
  About,
  Testimonials,
  Contact,
} from "@/components/portfolio/Sections";
import type { Mode } from "@/components/portfolio/hooks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shanto — DevOps & Platform Engineer" },
      {
        name: "description",
        content:
          "Pipelines, Kubernetes platforms and observability that let teams ship safely. Portfolio of a DevOps / Platform Engineer.",
      },
      { property: "og:title", content: "Shanto — DevOps & Platform Engineer" },
      {
        property: "og:description",
        content:
          "Build → Test → Deploy → Monitor → Scale. Six production systems, told as a pipeline.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SECTIONS: {
  key: string;
  id?: string;
  mode: Mode;
  htmlComment?: string;
  el: ReactNode;
}[] = [
  { key: "build", id: "build", mode: "dark", el: <Hero /> },
  { key: "test", id: "test", mode: "dark", el: <Work /> },
  { key: "process", mode: "light", el: <HowIWork /> },
  { key: "deploy", id: "deploy", mode: "light", el: <Toolchain /> },
  {
    key: "certifications",
    mode: "dark",
    htmlComment:
      "PLACEHOLDER: Replace certification names, years, and icons with real credentials before publishing",
    el: <Certifications />,
  },
  {
    key: "experience",
    mode: "light",
    htmlComment:
      "PLACEHOLDER: Replace all company names, roles, dates, locations, bullet points, and tech tags below with real work history before publishing",
    el: <Experience />,
  },
  { key: "monitor", id: "monitor", mode: "dark", el: <About /> },
  {
    key: "testimonials",
    mode: "light",
    htmlComment:
      "PLACEHOLDER: Replace with 2-3 real testimonials from managers, teammates, or clients before publishing",
    el: <Testimonials />,
  },
  { key: "scale", id: "scale", mode: "signal", el: <Contact /> },
];

function Index() {
  return (
    <>
      <Header />
      <PipelineRail />
      <main className="overflow-x-clip">
        {SECTIONS.map((s) => (
          <Fragment key={s.key}>
            {s.htmlComment && (
              <div
                aria-hidden="true"
                className="contents"
                dangerouslySetInnerHTML={{ __html: `<!-- ${s.htmlComment} -->` }}
              />
            )}
            <section
              id={s.id}
              className={`section-surface rail-safe mode-${s.mode} relative scroll-mt-24 md:scroll-mt-16`}
            >
              {s.el}
            </section>
          </Fragment>
        ))}
      </main>
    </>
  );
}
