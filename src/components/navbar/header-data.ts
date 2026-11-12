export const NAV_LINKS = [
  { label: "Home", href: "/", path: "/", hash: "" },
  { label: "Projects", href: "/#test", path: "/", hash: "#test" },
  { label: "About", href: "/about", path: "/about", hash: "" },
  { label: "Learnings", href: "/learnings", path: "/learnings", hash: "" },
  { label: "Blog", href: "/blog", path: "/blog", hash: "" },
  { label: "Contact", href: "/#scale", path: "/", hash: "#scale" },
] as const;

export const SOCIAL_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/hasibul-islam-shanto-80487a217/",
    icon: "Linkedin",
  },
  {
    label: "GitHub",
    href: "https://github.com/Hasibul-Islam-Shanto",
    icon: "Github",
  },
] as const;

export type NavLink = (typeof NAV_LINKS)[number];

export const isNavActive = (link: NavLink, currentPath: string): boolean =>
  link.path === currentPath && link.hash === "";
