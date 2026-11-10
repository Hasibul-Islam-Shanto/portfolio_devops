import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Hero } from "@/components/portfolio/Hero";
import { Work } from "@/components/portfolio/Work";
import {
  HowIWork,
  Certifications,
  Experience,
  Testimonials,
} from "@/components/portfolio/Sections";

describe("Portfolio new sections & elements", () => {
  it("renders the 4-block Stats Bar below Hero CTAs", () => {
    render(<Hero />);
    expect(screen.getByText("Building backend & platform systems")).toBeInTheDocument();
    expect(screen.getByText("Production incidents resolved this quarter")).toBeInTheDocument();
    expect(screen.getByText("Deploy frequency improved")).toBeInTheDocument();
    expect(screen.getByText("Services running in production")).toBeInTheDocument();
  });

  it("renders per-project 4-node mini flow diagrams inside all 6 project cards and animates on hover", () => {
    vi.useFakeTimers();
    const { container } = render(<Work />);
    const flowDiagrams = container.querySelectorAll('[aria-label="Project pipeline stages"]');
    expect(flowDiagrams.length).toBe(6);

    // Check specific project flow labels
    expect(screen.getByText("Reconcile")).toBeInTheDocument();
    expect(screen.getByText("Hypothesis")).toBeInTheDocument();

    const cards = container.querySelectorAll("article.work-card");
    expect(cards.length).toBe(6);
    cards.forEach((card) => {
      expect(card).not.toHaveAttribute("data-cursor-label");
      expect(card.className).not.toMatch(/tone-m-|tone-d-/);
      expect(card.querySelector(".work-cat-tick")).not.toBeNull();
      expect(card.querySelector(".work-case-link")?.textContent).toBe("View case study →");
    });

    const firstCard = cards[0];
    expect(firstCard).not.toBeUndefined();

    act(() => {
      fireEvent.mouseEnter(firstCard!);
    });

    expect(firstCard?.querySelector(".flow-node.is-on")).not.toBeNull();
    vi.useRealTimers();
  });

  it("renders the 5-step How I Work section and pull-quote", () => {
    render(<HowIWork />);
    expect(screen.getByText("Understand")).toBeInTheDocument();
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Delegate / Build")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Measure")).toBeInTheDocument();
    expect(screen.getByText(/if it pages at 3am, it pages me first/i)).toBeInTheDocument();
  });

  it("renders the 4 placeholder Certifications cards", () => {
    render(<Certifications />);
    expect(screen.getByText("Certifications")).toBeInTheDocument();
    expect(
      screen.getByText("[Certification Name — e.g. AWS Solutions Architect]"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("[Year]").length).toBe(4);
  });

  it("renders the two-column vertical timeline Experience section with placeholders and CTA", () => {
    render(<Experience />);
    expect(screen.getByText("Professional journey")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("[Month Year] – Present")).toBeInTheDocument();
    expect(screen.getAllByText("[Company Name]").length).toBe(3);
    expect(screen.getAllByText("[Job Title]").length).toBe(3);
    expect(screen.getByText("View Full Experience →")).toBeInTheDocument();
  });

  it("renders the 3 placeholder Testimonials quote cards", () => {
    render(<Testimonials />);
    expect(screen.getByText("What people say")).toBeInTheDocument();
    expect(screen.getAllByText("[Name Surname] — [Role, Company]").length).toBe(3);
  });
});
