import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Header } from "@/components/portfolio/Header";
import { PipelineRail } from "@/components/portfolio/PipelineRail";
import { Hero } from "@/components/portfolio/Hero";
import { Work } from "@/components/portfolio/Work";
import { Toolchain, About, Contact } from "@/components/portfolio/Sections";
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

const SECTIONS: { id: string; mode: Mode; el: ReactNode }[] = [
  { id: "build", mode: "dark", el: <Hero /> },
  { id: "test", mode: "dark", el: <Work /> },
  { id: "deploy", mode: "light", el: <Toolchain /> },
  { id: "monitor", mode: "dark", el: <About /> },
  { id: "scale", mode: "signal", el: <Contact /> },
];

function Index() {
  return (
    <>
      <Header />
      <PipelineRail />
      <main className="overflow-x-clip">
        {SECTIONS.map((s) => (
          <section
            key={s.id}
            id={s.id}
            className={`section-surface rail-safe mode-${s.mode} relative scroll-mt-24 md:scroll-mt-16`}
          >
            {s.el}
          </section>
        ))}
      </main>
    </>
  );
}
