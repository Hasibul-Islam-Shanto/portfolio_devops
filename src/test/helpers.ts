import { afterEach, inject } from "vitest";
import type { FixtureName } from "./render-fixtures";

const cleanups: Array<() => void> = [];

export function track(cleanup: () => void) {
  cleanups.push(cleanup);
}

afterEach(() => {
  while (cleanups.length) cleanups.pop()?.();
  document.body.innerHTML = "";
  document.documentElement.className = "";
});

export function fixture(name: FixtureName): string {
  const html = inject("fixtures")[name];
  if (html === undefined) throw new Error(`No fixture named "${name}"`);
  return html;
}

export function mount(name: FixtureName) {
  document.body.innerHTML = fixture(name);
  return document.body;
}

export function renderPage(name: FixtureName) {
  return new DOMParser().parseFromString(fixture(name), "text/html");
}

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
