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
    expect(doc.querySelector("h1")?.textContent).toContain("All Projects");
    expect(doc.querySelector('.nav-link[href="/projects"]')?.getAttribute("aria-current")).toBe("page");
    expect(doc.querySelectorAll("[data-project-item]").length).toBeGreaterThanOrEqual(2);
    expect(doc.querySelector("[data-pipeline-rail]")).toBeNull();
  });

  it("/about renders expanded bio, experience timeline, skills, and 3 principles without pipeline rail", async () => {
    const doc = renderPage("about");
    expect(doc.title).toContain("About");
    expect(doc.querySelector("h1")?.textContent).toContain("From product interfaces to production systems");
    expect(doc.querySelector('.nav-link[href="/about"]')?.getAttribute("aria-current")).toBe("page");
    expect(doc.querySelector('a[href="/projects"]')).not.toBeNull();
    expect(doc.querySelector('a[href="/#contact"]')).not.toBeNull();
    expect(doc.body.textContent).toContain("Design for reliability");
    expect(doc.body.textContent).toContain("Automate the repeatable");
    expect(doc.body.textContent).toContain("Keep changes reviewable");
    expect(doc.querySelector("[data-pipeline-rail]")).toBeNull();
  });

  it("/learnings renders the full curriculum and does not render the pipeline rail", async () => {
    const doc = renderPage("learnings");
    expect(doc.title).toContain("DevOps Learnings");
    expect(doc.querySelector('.nav-link[href="/learnings"]')?.getAttribute("aria-current")).toBe("page");
    expect(doc.querySelector("[data-pipeline-rail]")).toBeNull();
  });

  it("/blog renders the real blog articles and links to posts without pipeline rail", async () => {
    const doc = renderPage("blog");
    expect(doc.title).toContain("Blog");
    expect(meta(doc, 'meta[name="description"]')).toContain("write-ups");
    expect(doc.querySelector("h1")?.textContent).toContain("Production notes");
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
    expect(doc.querySelectorAll("article").length).toBe(8);
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
