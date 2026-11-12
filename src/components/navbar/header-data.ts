export const NAV_LINKS = [
  { label: "Home", href: "/", path: "/", hash: "" },
  { label: "Projects", href: "/projects", path: "/projects", hash: "" },
  { label: "About", href: "/about", path: "/about", hash: "" },
  { label: "Learnings", href: "/learnings", path: "/learnings", hash: "" },
  { label: "Blog", href: "/blog", path: "/blog", hash: "" },
  { label: "Contact", href: "/#contact", path: "/", hash: "#contact" },
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

export const isNavActive = (link: NavLink, currentPath: string): boolean => {
  const normCurrent = currentPath.replace(/\/$/, "") || "/";
  const normPath = link.path.replace(/\/$/, "") || "/";
  if (link.hash !== "") {
    return false;
  }
  if (normPath === "/") {
    return normCurrent === "/";
  }
  return normCurrent === normPath || normCurrent.startsWith(`${normPath}/`);
};
