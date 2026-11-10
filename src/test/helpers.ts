import { afterEach, inject } from "vitest";
import type { FixtureName } from "./render-fixtures";

const cleanups: Array<() => void> = [];

/** Registers a teardown (e.g. the function returned by an init* script) to run after each test. */
export function track(cleanup: () => void) {
  cleanups.push(cleanup);
}

afterEach(() => {
  while (cleanups.length) cleanups.pop()?.();
  document.body.innerHTML = "";
  document.documentElement.className = "";
});

/** The pre-rendered static HTML of an Astro component or page (rendered in globalSetup). */
export function fixture(name: FixtureName): string {
  const html = inject("fixtures")[name];
  if (html === undefined) throw new Error(`No fixture named "${name}"`);
  return html;
}

/** Puts a component's HTML into the live jsdom document so scripts can be initialised against it. */
export function mount(name: FixtureName) {
  document.body.innerHTML = fixture(name);
  return document.body;
}

/** Parses a full page's HTML as a standalone document (for head/meta/route assertions). */
export function renderPage(name: FixtureName) {
  return new DOMParser().parseFromString(fixture(name), "text/html");
}

/** Overrides matchMedia so that queries containing `match` report as matching. */
export function mockMatchMedia(match: string) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    matches: query.includes(match),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
  track(() => {
    window.matchMedia = original;
  });
}
