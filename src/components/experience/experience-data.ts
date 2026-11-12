export interface ExperienceRole {
  hash: string;
  period: string;
  company: string;
  location: string;
  context: string;
  role: string;
  isCurrent: boolean;
  bullets: string[];
  tags: string[];
}

export const EXPERIENCE_ROLES: ExperienceRole[] = [
  {
    hash: "a3f9c21",
    period: "Jan 2024 → Jun 2026",
    company: "Universal Machine Inc.",
    location: "Remote",
    context: "Full-time",
    role: "Front-End Engineer",
    isCurrent: true,
    bullets: [
      "Built a carbon credit management platform handling end-to-end project workflows — methodology creation, project setup, and inventory management — serving enterprise clients in sustainability.",
      "Engineered scalable front-end architecture using Next.js (SSR/SSG), React.js, TypeScript, Jotai, and Tailwind CSS to ensure high performance and maintainability.",
      "Contributed to Minipay wallet application (200K+ users), implementing smart contract interactions via Ethers.js and wallet authentication via RainbowKit.",
      "Designed and implemented RESTful APIs with Node.js and Express.js, architecting relational database models with PostgreSQL and Prisma ORM.",
      "Built CI/CD pipelines with GitHub Actions for automated linting, unit testing, and zero-downtime deployment on merge to production.",
    ],
    tags: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "GitHub Actions", "Docker"],
  },
  {
    hash: "7be41d0",
    period: "Jun 2022 → Feb 2023",
    company: "InnovexIT",
    location: "On-site",
    context: "Part-time",
    role: "Junior Web Developer",
    isCurrent: false,
    bullets: [
      "Created and maintained responsive web interfaces for appointment and workforce management platforms using React.js, Next.js, TypeScript, and Tailwind CSS.",
      "Collaborated on front-end architecture and UI implementation, improving usability, load performance, and accessibility.",
      "Contributed to feature enhancements and bug fixes across multiple client projects, ensuring reliable user experiences.",
    ],
    tags: ["React.js", "Next.js", "TypeScript", "Tailwind CSS"],
  },
];
