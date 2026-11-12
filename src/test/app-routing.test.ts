import { describe, expect, it } from "vitest";
import { fixture, renderPage } from "./helpers";

const meta = (doc: Document, selector: string) =>
  doc.querySelector(selector)?.getAttribute("content");

describe("Astro routes", () => {
  it("/ renders all eight sections in order with the stage anchors and SEO metadata", async () => {
    const doc = renderPage("index");

    expect(doc.title).toBe("Shanto — DevOps & Platform Engineer");
    expect(meta(doc, 'meta[name="description"]')).toContain("Kubernetes platforms");
    expect(meta(doc, 'meta[property="og:title"]')).toBe("Shanto — DevOps & Platform Engineer");
    expect(meta(doc, 'meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(doc.documentElement.lang).toBe("en");
    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();

    const sections = Array.from(doc.querySelectorAll("main > section"));
    expect(sections.map((s) => s.id)).toEqual([
      "hero",
      "projects",
      "experience",
      "toolchain",
      "certifications",
      "process",
      "principles",
      "contact",
    ]);
    expect(sections.map((s) => s.className.match(/mode-(\w+)/)?.[1])).toEqual([
      "dark",
      "dark",
      "dark",
      "dark",
      "dark",
      "dark",
      "dark",
      "dark",
    ]);
    expect(doc.querySelectorAll("h1").length).toBe(1);
  });

  it("/ ships crawlable content in the static HTML, including real systems and experience", async () => {
    const html = fixture("index");
    for (const text of [
      "Making",
      "OrderFirst",
      "DevTalk",
      "Universal Machine Inc.",
      "Production platforms",
      "Every layer,",
      "Calm systems are",
      "mailto:mdhasibulislamshanto007@gmail.com",
    ]) {
      expect(html).toContain(text);
    }
  });

  it("/ in-page links point at existing sections", async () => {
    const doc = renderPage("index");
    const ids = new Set(Array.from(doc.querySelectorAll("[id]")).map((e) => e.id));
    const hashes = Array.from(doc.querySelectorAll('a[href^="#"], a[href^="/#"]'))
      .map((a) => a.getAttribute("href")!.replace(/^\/?#/, ""))
      .filter(Boolean);
    expect(hashes.length).toBeGreaterThan(0);
    for (const h of hashes) expect(ids.has(h)).toBe(true);
  });

  it("/projects renders all projects in a grid, without pipeline rail", async () => {
    const doc = renderPage("projects");
    expect(doc.title).toContain("Projects");
    expect(meta(doc, 'meta[name="description"]')).toContain("production platforms");
    expect(doc.querySelector("h1")?.textContent?.replace(/\s+/g, " ")).toContain("All Projects");
    expect(doc.querySelector('.nav-link[href="/projects"]')?.getAttribute("aria-current")).toBe(
      "page",
    );
    expect(doc.querySelectorAll("[data-project-item]").length).toBeGreaterThanOrEqual(2);
    expect(doc.querySelector("[data-pipeline-rail]")).toBeNull();
  });

  it("/about renders expanded bio with labeled chapters, git-log experience timeline, and filterable tools without pipeline rail", async () => {
    const doc = renderPage("about");
    expect(doc.title).toContain("About");
    expect(doc.querySelector("h1")?.textContent?.replace(/\s+/g, " ")).toContain(
      "From product interfaces to production systems",
    );
    expect(doc.querySelector('.nav-link[href="/about"]')?.getAttribute("aria-current")).toBe(
      "page",
    );
    expect(doc.querySelector('a[href="/projects"]')).not.toBeNull();
    expect(doc.querySelector('a[href="/#contact"]')).not.toBeNull();

    // Check bio chapter headings
    expect(doc.body.textContent).toContain("Background");
    expect(doc.body.textContent).toContain("Education");
    expect(doc.body.textContent).toContain("Early Career");
    expect(doc.body.textContent).toContain("The Shift to DevOps");
    expect(doc.body.textContent).toContain("Recognition");

    // Check git-log timeline & cards
    expect(doc.querySelector("[data-timeline]")).not.toBeNull();
    expect(doc.querySelectorAll("[data-exp-card]").length).toBe(2);
    expect(doc.querySelectorAll("[data-exp-toggle]").length).toBe(2);

    // Check filterable toolchain catalog
    expect(doc.querySelector("[data-toolchain]")).not.toBeNull();
    expect(doc.querySelectorAll("[data-filter-tab]").length).toBe(5);
    expect(doc.querySelectorAll("[data-tool-card]").length).toBe(29);
    expect(doc.body.textContent).toContain("Skills & tooling breakdown");
    expect(doc.body.textContent).not.toContain("Calm systems are monitored systems");
    expect(doc.querySelector("[data-pipeline-rail]")).toBeNull();
  });

  it("/learnings renders the full curriculum and does not render the pipeline rail", async () => {
    const doc = renderPage("learnings");
    expect(doc.title).toContain("DevOps Learnings");
    expect(doc.querySelector('.nav-link[href="/learnings"]')?.getAttribute("aria-current")).toBe(
      "page",
    );
    expect(doc.querySelector("[data-pipeline-rail]")).toBeNull();
  });

  it("/blog renders the real blog articles and links to posts without pipeline rail", async () => {
    const doc = renderPage("blog");
    expect(doc.title).toContain("Blog");
    expect(meta(doc, 'meta[name="description"]')).toContain("write-ups");
    expect(doc.querySelector("h1")?.textContent?.replace(/\s+/g, " ")).toContain(
      "Production notes",
    );
    expect(doc.querySelector('.nav-link[href="/blog"]')?.getAttribute("aria-current")).toBe("page");
    expect(doc.querySelector("[data-pipeline-rail]")).toBeNull();
  });

  it("/case-studies renders the case studies placeholder page", async () => {
    const doc = renderPage("case-studies");
    expect(doc.title).toContain("Case Studies");
    expect(doc.querySelector("h1")?.textContent).toContain("Case studies coming soon.");
  });

  it("/achievements renders all unpaginated credentials and honors in a 3-per-row grid", async () => {
    const doc = renderPage("achievements");
    expect(doc.title).toContain("Recognitions & Credentials");
    expect(meta(doc, 'meta[name="description"]')).toContain("credentials");
    expect(doc.querySelector("h1")?.textContent).toContain("Recognitions & Credentials");
    expect(doc.querySelectorAll("article").length).toBe(7);
    expect(doc.querySelector('a[href="/#certifications"]')).not.toBeNull();
  });

  it("the 404 page is centered and links back home", async () => {
    const doc = renderPage("404");
    expect(doc.querySelector("h1")?.textContent).toBe("404");
    expect(doc.querySelector('a[href="/"]')?.textContent?.trim()).toBe("Go home");
  });

  it("header and all index sections share the unified .site-container layout boundary", async () => {
    const doc = renderPage("index");
    expect(doc.querySelector("header .site-container")).not.toBeNull();
    const sections = Array.from(doc.querySelectorAll("main > section"));
    expect(sections.length).toBe(8);
    for (const section of sections) {
      expect(section.querySelector(".site-container")).not.toBeNull();
    }
  });
});
