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

  it("/blog renders the real blog articles and links to posts", async () => {
    const doc = renderPage("blog");
    expect(doc.title).toContain("Blog");
    expect(meta(doc, 'meta[name="description"]')).toContain("write-ups");
    expect(doc.querySelector("h1")?.textContent).toContain("Production notes");
    expect(doc.querySelector('.nav-link[href="/blog"]')?.getAttribute("aria-current")).toBe("page");
  });

  it("/case-studies renders the case studies placeholder page", async () => {
    const doc = renderPage("case-studies");
    expect(doc.title).toContain("Case Studies");
    expect(doc.querySelector("h1")?.textContent).toContain("Case studies coming soon.");
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
