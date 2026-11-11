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
      "build",
      "test",
      "",
      "deploy",
      "",
      "",
      "monitor",
      "scale",
    ]);
    expect(sections.map((s) => s.className.match(/mode-(\w+)/)?.[1])).toEqual([
      "dark",
      "dark",
      "light",
      "dark",
      "dark",
      "dark",
      "dark",
      "signal",
    ]);
    expect(doc.querySelectorAll("h1").length).toBe(1);
  });

  it("/ ships crawlable content in the static HTML, including the placeholder comments", async () => {
    const html = fixture("index");
    for (const text of [
      "Making",
      "Monorepo pipeline rebuild",
      "Game-day program",
      "Every layer,",
      "Calm systems are",
      "mailto:hello@shanto.dev",
      "PLACEHOLDER: Replace certification names",
      "PLACEHOLDER: Replace all company names",
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

  it("/blog is a coming-soon page with its own metadata and a link back to the projects", async () => {
    const doc = renderPage("blog");
    expect(doc.title).toBe("Blog — Shanto, DevOps & Platform Engineer");
    expect(meta(doc, 'meta[name="description"]')).toContain("Notes on pipelines");
    expect(doc.querySelector("h1")?.textContent).toContain("First posts are being written.");
    expect(doc.querySelector('a[href="/#test"]')).not.toBeNull();
    expect(doc.querySelector('.nav-link[href="/blog"]')?.getAttribute("aria-current")).toBe("page");
  });

  it("/case-studies is a coming-soon page with its own metadata", async () => {
    const doc = renderPage("case-studies");
    expect(doc.title).toBe("Case Studies — Shanto, DevOps & Platform Engineer");
    expect(doc.querySelector("h1")?.textContent).toContain("Long-form write-ups");
    expect(doc.querySelector('.nav-link[href="/case-studies"]')?.getAttribute("aria-current")).toBe(
      "page",
    );
  });

  it("the 404 page is centered and links back home", async () => {
    const doc = renderPage("404");
    expect(doc.querySelector("h1")?.textContent).toBe("404");
    expect(doc.querySelector('a[href="/"]')?.textContent?.trim()).toBe("Go home");
  });
});
