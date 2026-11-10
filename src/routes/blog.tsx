import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/portfolio/ComingSoon";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Shanto, DevOps & Platform Engineer" },
      {
        name: "description",
        content: "Notes on pipelines, Kubernetes, reliability and platform engineering by Shanto.",
      },
      { property: "og:title", content: "Blog — Shanto, DevOps & Platform Engineer" },
      {
        property: "og:description",
        content: "Notes on pipelines, Kubernetes, reliability and platform engineering.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Blog"
      title="First posts are being written."
      body="Notes on pipelines, Kubernetes and keeping production calm will land here soon."
    />
  ),
});
