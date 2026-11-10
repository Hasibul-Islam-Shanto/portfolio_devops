import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "@/components/portfolio/ComingSoon";

export const Route = createFileRoute("/case-studies")({
  head: () => ({
    meta: [
      { title: "Case Studies — Shanto, DevOps & Platform Engineer" },
      {
        name: "description",
        content:
          "In-depth write-ups of CI/CD, Kubernetes, IaC and observability projects by Shanto.",
      },
      { property: "og:title", content: "Case Studies — Shanto, DevOps & Platform Engineer" },
      {
        property: "og:description",
        content: "Long-form breakdowns of production platform work: problem, approach, outcome.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <ComingSoon
      eyebrow="Case studies"
      title="Long-form write-ups are in the pipeline."
      body="Detailed breakdowns of each system are on the way. Until then, the project summaries cover the problem, approach and outcome."
    />
  ),
});
