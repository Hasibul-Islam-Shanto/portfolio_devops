export type AboutToolCategory =
  | "CI/CD & Automation"
  | "Cloud & Container Orchestration"
  | "Infrastructure & Networking"
  | "Full-Stack & Data Architecture";

export interface AboutToolItem {
  id: string;
  name: string;
  category: AboutToolCategory;
  tag: string;
  svgInner: string;
  viewBox?: string;
}

export const ABOUT_CATEGORIES = [
  "All",
  "CI/CD & Automation",
  "Cloud & Container Orchestration",
  "Infrastructure & Networking",
  "Full-Stack & Data Architecture",
] as const;

export type AboutCategoryFilter = (typeof ABOUT_CATEGORIES)[number];

export const ABOUT_TOOLS: AboutToolItem[] = [
  // --- CI/CD & Automation ---
  {
    id: "jenkins",
    name: "Jenkins",
    category: "CI/CD & Automation",
    tag: "automation server",
    svgInner: `
      <path d="M12.012 0C7.726 0 4.225 3.067 3.528 7.147c-.24.16-.448.36-.6.6-.72 1.107-.4 2.587.707 3.3.067.04.133.08.2.107-.067.4-.093.813-.093 1.227 0 1.253.32 2.427.867 3.467-.227.453-.347.973-.347 1.52 0 1.48.907 2.733 2.227 3.24.907 1.88 2.653 3.227 4.773 3.56v-1.64c-1.573-.307-2.88-1.387-3.48-2.827.467-.2.867-.533 1.147-.947.453-.693.533-1.533.253-2.293.627-.973.987-2.12.987-3.347 0-.293-.027-.587-.067-.867.307-.227.533-.547.653-.92.2-.627.08-1.293-.307-1.813.44-.947 1.147-1.72 2.027-2.253.307.36.76.587 1.253.587.827 0 1.493-.667 1.493-1.493 0-.827-.667-1.493-1.493-1.493-.32 0-.613.107-.853.28C13.88 1.347 12.973.867 12.012 0z" fill="#D24939" />
    `,
  },
  {
    id: "github-actions",
    name: "GitHub Actions",
    category: "CI/CD & Automation",
    tag: "ci/cd workflows",
    svgInner: `
      <path d="M10.984 13.836a.5.5 0 0 1-.353-.146l-.745-.743a.5.5 0 1 1 .706-.708l.392.391 1.181-1.18a.5.5 0 0 1 .708.707l-1.535 1.533a.504.504 0 0 1-.354.146zm9.353-.147l1.534-1.532a.5.5 0 0 0-.707-.707l-1.181 1.18-.392-.391a.5.5 0 1 0-.706.708l.746.743a.497.497 0 0 0 .706-.001zM4.527 7.452l2.557-1.585A1 1 0 0 0 7.09 4.17L4.533 2.56A1 1 0 0 0 3 3.406v3.196a1.001 1.001 0 0 0 1.527.85zm2.03-2.436L4 6.602V3.406l2.557 1.61zM24 12.5c0 1.93-1.57 3.5-3.5 3.5a3.503 3.503 0 0 1-3.46-3h-2.08a3.503 3.503 0 0 1-3.46 3 3.502 3.502 0 0 1-3.46-3h-.558c-.972 0-1.85-.399-2.482-1.042V17c0 1.654 1.346 3 3 3h.04c.244-1.693 1.7-3 3.46-3 1.93 0 3.5 1.57 3.5 3.5S13.43 24 11.5 24a3.502 3.502 0 0 1-3.46-3H8c-2.206 0-4-1.794-4-4V9.899A5.008 5.008 0 0 1 0 5c0-2.757 2.243-5 5-5s5 2.243 5 5a5.005 5.005 0 0 1-4.952 4.998A2.482 2.482 0 0 0 7.482 12h.558c.244-1.693 1.7-3 3.46-3a3.502 3.502 0 0 1 3.46 3h2.08a3.503 3.503 0 0 1 3.46-3c1.93 0 3.5 1.57 3.5 3.5zm-15 8c0 1.378 1.122 2.5 2.5 2.5s2.5-1.122 2.5-2.5-1.122-2.5-2.5-2.5S9 19.122 9 20.5zM5 9c2.206 0 4-1.794 4-4S7.206 1 5 1 1 2.794 1 5s1.794 4 4 4zm9 3.5c0-1.378-1.122-2.5-2.5-2.5S9 11.122 9 12.5s1.122 2.5 2.5 2.5 2.5-1.122 2.5-2.5zm9 0c0-1.378-1.122-2.5-2.5-2.5S18 11.122 18 12.5s1.122 2.5 2.5 2.5 2.5-1.122 2.5-2.5zm-13 8a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0zm2 0a.5.5 0 1 0 1 0 .5.5 0 0 0-1 0zm12 0c0 1.93-1.57 3.5-3.5 3.5a3.503 3.503 0 0 1-3.46-3.002c-.007.001-.013.005-.021.005l-.506.017h-.017a.5.5 0 0 1-.016-.999l.506-.017c.018-.002.035.006.052.007A3.503 3.503 0 0 1 20.5 17c1.93 0 3.5 1.57 3.5 3.5zm-1 0c0-1.378-1.122-2.5-2.5-2.5S18 19.122 18 20.5s1.122 2.5 2.5 2.5 2.5-1.122 2.5-2.5z" fill="#2088FF" />
    `,
  },
  {
    id: "docker-compose",
    name: "Docker Compose",
    category: "CI/CD & Automation",
    tag: "multi-container dev",
    svgInner: `
      <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z" fill="#2496ED" />
    `,
  },
  {
    id: "multi-stage-builds",
    name: "Multi-stage Builds",
    category: "CI/CD & Automation",
    tag: "lean container layers",
    svgInner: `
      <rect x="3" y="3" width="18" height="4" rx="1.5" fill="#2496ED" opacity="0.4" />
      <rect x="3" y="10" width="18" height="4" rx="1.5" fill="#2496ED" opacity="0.7" />
      <rect x="3" y="17" width="18" height="4" rx="1.5" fill="#2496ED" />
      <path d="M12 7v2m0 5v2" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
    `,
  },
  {
    id: "sonarqube",
    name: "SonarQube",
    category: "CI/CD & Automation",
    tag: "code quality & sast",
    svgInner: `
      <path d="M19.82 17.5a10.8 10.8 0 0 0 1.95-6.27A11.03 11.03 0 0 0 10.74.2a10.86 10.86 0 0 0-6.19 1.92l2.36 2.37a7.6 7.6 0 0 1 3.83-1.04c4.32 0 7.82 3.5 7.82 7.82 0 1.4-.38 2.71-1.03 3.84l2.29 2.39z" fill="#CB3032" />
      <path d="M15.54 13.22a5.57 5.57 0 0 0 .97-3.15c0-3.17-2.58-5.75-5.75-5.75a5.7 5.7 0 0 0-3.1.9l2.4 2.4c.2-.07.45-.12.7-.12 1.65 0 3 1.35 3 3 0 .25-.05.5-.12.7l1.9 1.92z" fill="#4B9FD5" />
      <path d="M2.26 23.8l5.8-5.8c-1.5-1.3-2.4-3.2-2.4-5.3 0-.6.08-1.2.22-1.76L1.8 6.86A11.1 11.1 0 0 0 .15 12.7c0 3.7 1.7 7 4.3 9.2l-2.19 1.9z" fill="#549938" />
    `,
  },
  {
    id: "trivy",
    name: "Trivy",
    category: "CI/CD & Automation",
    tag: "vulnerability scanner",
    svgInner: `
      <path d="M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" fill="#1393D0" />
      <path d="M12 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" fill="#ffffff" />
      <circle cx="12" cy="11" r="1.5" fill="#1393D0" />
    `,
  },
  {
    id: "bash",
    name: "Bash Scripting",
    category: "CI/CD & Automation",
    tag: "shell automation",
    svgInner: `
      <rect x="0" y="0" width="24" height="24" rx="4" fill="#293134" />
      <path d="M5 8l4 4-4 4" stroke="#4EAA25" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <line x1="11" y1="16" x2="18" y2="16" stroke="#4EAA25" stroke-width="2" stroke-linecap="round" />
    `,
  },

  // --- Cloud & Container Orchestration ---
  {
    id: "kubernetes",
    name: "Kubernetes",
    category: "Cloud & Container Orchestration",
    tag: "orchestration",
    svgInner: `
      <path d="M10.204 14.35l.007.01-.999 2.413a5.171 5.171 0 0 1-2.075-2.597l2.578-.437.004.005a.44.44 0 0 1 .484.606zm-.833-2.129a.44.44 0 0 0 .173-.756l.002-.011L7.585 9.7a5.143 5.143 0 0 0-.73 3.255l2.514-.725.002-.009zm1.145-1.98a.44.44 0 0 0 .699-.337l.01-.005.15-2.62a5.144 5.144 0 0 0-3.01 1.442l2.147 1.523.004-.002zm.76 2.75l.723.349.722-.347.18-.78-.5-.623h-.804l-.5.623.179.779zm1.5-3.095a.44.44 0 0 0 .7.336l.008.003 2.134-1.513a5.188 5.188 0 0 0-2.992-1.442l.148 2.615.002.001zm10.876 5.97l-5.773 7.181a1.6 1.6 0 0 1-1.248.594l-9.261.003a1.6 1.6 0 0 1-1.247-.596l-5.776-7.18a1.583 1.583 0 0 1-.307-1.34L2.1 5.573c.108-.47.425-.864.863-1.073L11.305.513a1.606 1.606 0 0 1 1.385 0l8.345 3.985c.438.209.755.604.863 1.073l2.062 8.955c.108.47-.005.963-.308 1.34z" fill="#326CE5" />
    `,
  },
  {
    id: "kind",
    name: "Kind",
    category: "Cloud & Container Orchestration",
    tag: "k8s in docker",
    svgInner: `
      <rect x="2" y="4" width="20" height="16" rx="4" fill="#2496ED" />
      <circle cx="12" cy="12" r="4.5" fill="#ffffff" />
      <circle cx="12" cy="12" r="2" fill="#326CE5" />
      <path d="M12 5.5v2.5M12 16v2.5M6.5 12H9m6 0h2.5" stroke="#326CE5" stroke-width="1.5" stroke-linecap="round" />
    `,
  },
  {
    id: "containerd",
    name: "Containerd",
    category: "Cloud & Container Orchestration",
    tag: "container runtime",
    svgInner: `
      <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="#575757" />
      <path d="M7 7h10v3H7V7zm0 5h6v5H7v-5zm8 2h2v3h-2v-3z" fill="#54CAEC" />
    `,
  },
  {
    id: "ingress-nginx",
    name: "Ingress NGINX",
    category: "Cloud & Container Orchestration",
    tag: "ingress routing",
    svgInner: `
      <path d="M12.036 0L1.455 6.109v12.181l10.581 6.109 10.582-6.109V6.109zM8.335 17.527H6.709V9.588l6.327 7.939h-1.636v-7.939zm8.953 0h-1.637V9.588l1.637 2.036z" fill="#009639" />
      <path d="M8.335 9.588l6.327 7.939h1.636V9.588z" fill="#00772D" />
    `,
  },
  {
    id: "helm",
    name: "Helm",
    category: "Cloud & Container Orchestration",
    tag: "k8s package manager",
    svgInner: `
      <path d="M12 0L2 6v12l10 6 10-6V6L12 0zm0 3.236l7.5 4.5v8.528L12 20.764l-7.5-4.5V7.736L12 3.236z" fill="#0F1689" />
      <path d="M12 6.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zm0 2.2a3.3 3.3 0 1 1 0 6.6 3.3 3.3 0 0 1 0-6.6z" fill="#2496ED" />
    `,
  },
  {
    id: "statefulsets",
    name: "StatefulSets",
    category: "Cloud & Container Orchestration",
    tag: "ordered stateful pods",
    svgInner: `
      <rect x="4" y="3" width="16" height="4.5" rx="1" fill="#326CE5" />
      <rect x="4" y="9.75" width="16" height="4.5" rx="1" fill="#326CE5" opacity="0.8" />
      <rect x="4" y="16.5" width="16" height="4.5" rx="1" fill="#326CE5" opacity="0.6" />
      <circle cx="7" cy="5.25" r="1" fill="#ffffff" />
      <circle cx="7" cy="12" r="1" fill="#ffffff" />
      <circle cx="7" cy="18.75" r="1" fill="#ffffff" />
    `,
  },
  {
    id: "pvcs-storage",
    name: "PVCs & Storage",
    category: "Cloud & Container Orchestration",
    tag: "persistent volumes",
    svgInner: `
      <ellipse cx="12" cy="6" rx="8" ry="3" fill="#326CE5" />
      <path d="M4 6v5c0 1.66 3.58 3 8 3s8-1.34 8-3V6" stroke="#326CE5" stroke-width="2" fill="none" />
      <path d="M4 11v5c0 1.66 3.58 3 8 3s8-1.34 8-3v-5" stroke="#326CE5" stroke-width="2" fill="none" />
    `,
  },

  // --- Infrastructure & Networking ---
  {
    id: "linux",
    name: "Linux",
    category: "Infrastructure & Networking",
    tag: "systems & kernel",
    svgInner: `
      <path d="M12.001 0c-2.484 0-4.5 2.016-4.5 4.5 0 .285.029.562.08.83C6.398 5.753 5.484 6.85 5.484 8.167c0 .927.464 1.745 1.171 2.235-.11.455-.171.93-.171 1.419 0 2.43 1.572 4.49 3.738 5.21-.524.502-.916 1.143-1.118 1.868-.698.057-1.64.24-2.348.654-.772.45-1.256 1.168-1.256 2.003 0 1.353 1.294 2.444 3.255 2.444.82 0 1.637-.19 2.378-.546.757.345 1.603.546 2.508.546.905 0 1.751-.201 2.508-.546.741.356 1.558.546 2.378.546 1.961 0 3.255-1.091 3.255-2.444 0-.835-.484-1.553-1.256-2.003-.708-.414-1.65-.597-2.348-.654-.202-.725-.594-1.366-1.118-1.868 2.166-.72 3.738-2.78 3.738-5.21 0-.489-.061-.964-.171-1.419.707-.49 1.171-1.308 1.171-2.235 0-1.317-.914-2.414-2.097-2.837.051-.268.08-.545.08-.83 0-2.484-2.016-4.5-4.5-4.5z" fill="#FCC624" />
      <circle cx="10" cy="4.2" r="0.6" fill="#000000" />
      <circle cx="14" cy="4.2" r="0.6" fill="#000000" />
      <path d="M12 5.5c-.8 0-1.2.4-1.2.7s.4.7 1.2.7 1.2-.4 1.2-.7-.4-.7-1.2-.7z" fill="#FFA500" />
      <ellipse cx="12" cy="12" rx="3.5" ry="4.5" fill="#FFFFFF" />
    `,
  },
  {
    id: "terraform",
    name: "Terraform",
    category: "Infrastructure & Networking",
    tag: "infrastructure as code",
    svgInner: `
      <path d="M1.44 0v7.575l6.561 3.79V3.787zM22.56 4.227l-6.561 3.791v7.574l6.56-3.787zM8.72 4.23v7.575l6.561 3.787V8.018zm0 8.405v7.575L15.28 24v-7.578z" fill="#844FBA" />
    `,
  },
  {
    id: "ansible",
    name: "Ansible",
    category: "Infrastructure & Networking",
    tag: "config management",
    svgInner: `
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.038c4.962 0 8.962 4 8.962 8.962 0 1.956-.632 3.766-1.708 5.235L7.962 5.562c1.47-1.076 3.28-1.708 5.238-1.708zm-8.962 8.962c0-1.956.632-3.766 1.708-5.235l11.292 11.673c-1.47 1.076-3.28 1.708-5.238 1.708-4.962 0-8.962-4-8.962-8.962z" fill="#000000" />
      <path d="M9.8 14.5l2.2-6 2.2 6z" fill="#EE0000" />
    `,
  },
  {
    id: "tcp-ip-dns",
    name: "TCP/IP & DNS",
    category: "Infrastructure & Networking",
    tag: "networking & routing",
    svgInner: `
      <circle cx="12" cy="12" r="9" stroke="#0070F3" stroke-width="2" fill="none" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="#0070F3" stroke-width="1.5" fill="none" />
    `,
  },
  {
    id: "reverse-proxies",
    name: "Reverse Proxies",
    category: "Infrastructure & Networking",
    tag: "ssl termination & edge",
    svgInner: `
      <rect x="8" y="2" width="8" height="20" rx="2" fill="#009639" opacity="0.8" />
      <path d="M3 7h5M3 17h5M16 12h5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
      <path d="M6 5l2 2-2 2M6 15l2 2-2 2M19 10l2 2-2 2" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    `,
  },
  {
    id: "load-balancing",
    name: "Load Balancing",
    category: "Infrastructure & Networking",
    tag: "traffic distribution",
    svgInner: `
      <circle cx="5" cy="12" r="3" fill="#844FBA" />
      <circle cx="19" cy="5" r="2.5" fill="#844FBA" />
      <circle cx="19" cy="12" r="2.5" fill="#844FBA" />
      <circle cx="19" cy="19" r="2.5" fill="#844FBA" />
      <path d="M8 12h4m0 0l4-7m-4 7h4m-4 0l4 7" stroke="#844FBA" stroke-width="1.8" stroke-linecap="round" />
    `,
  },

  // --- Full-Stack & Data Architecture ---
  {
    id: "typescript-javascript",
    name: "TypeScript/JavaScript",
    category: "Full-Stack & Data Architecture",
    tag: "typed language runtime",
    svgInner: `
      <rect width="24" height="24" rx="4" fill="#3178C6" />
      <path d="M11.5 8.5H6.5v2h1.5v7h2v-7h1.5v-2zm7 3.5c-.5-.5-1.2-.8-2-.8-1.4 0-2.2.8-2.2 1.9 0 2.2 3.2 1.6 3.2 3.1 0 .6-.5 1-1.3 1-.9 0-1.6-.4-2.1-1l-1 1.4c.8 1 1.9 1.4 3.1 1.4 2.2 0 3.3-1.1 3.3-2.6 0-2.3-3.2-1.7-3.2-3.1 0-.5.4-.8 1.1-.8.7 0 1.3.3 1.7.7l.4-1.2z" fill="#ffffff" />
    `,
  },
  {
    id: "nodejs",
    name: "Node.js",
    category: "Full-Stack & Data Architecture",
    tag: "backend runtime",
    svgInner: `
      <path d="M12 2l9 5.2v10.4L12 22.8 3 17.6V7.2L12 2z" fill="#5FA04E" />
      <path d="M12 5.5l6.5 3.8v7.4L12 20.5l-6.5-3.8V9.3L12 5.5z" fill="#333333" />
      <circle cx="12" cy="13" r="2.5" fill="#5FA04E" />
    `,
  },
  {
    id: "expressjs",
    name: "Express.js",
    category: "Full-Stack & Data Architecture",
    tag: "rest apis & middleware",
    svgInner: `
      <rect width="24" height="24" rx="4" fill="#000000" />
      <text x="12" y="16" font-family="monospace" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">ex</text>
    `,
  },
  {
    id: "nextjs",
    name: "Next.js",
    category: "Full-Stack & Data Architecture",
    tag: "ssr & full-stack",
    svgInner: `
      <circle cx="12" cy="12" r="11" fill="#000000" />
      <path d="M15 8v8M9 8v8l6.5-8" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
    `,
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Full-Stack & Data Architecture",
    tag: "relational db",
    svgInner: `
      <path d="M23.953 5.407c-.126-.457-1.01-1.045-1.488-1.256-.479-.21-1.332-.42-1.332-.42s-.582.478-1.434.795c-.854.316-1.786.685-1.786.685s-.371-.843-.849-1.58c-.477-.738-1.162-1.487-1.162-1.487s-.632.422-1.536.896c-.905.474-1.942 1.056-1.942 1.056s-.263-.896-.79-1.74c-.525-.845-1.316-1.79-1.316-1.79S10.5 1.585 9.475 2.15c-1.026.565-2.144 1.348-2.144 1.348s.106-.79-.105-1.635c-.212-.845-.738-1.789-.738-1.789S5.438.414 4.54 1.152C3.642 1.89 2.576 3.004 2.576 3.004s-.897-.264-1.74-.053c-.843.212-1.687.844-1.687.844s1.107 1.84 2.107 3.363c1.001 1.524 2.107 2.839 2.107 2.839s-.316 1.107-.579 2.318c-.264 1.21-.474 2.682-.474 2.682s1.423.844 3.319 1.476c1.895.633 4.267 1.054 4.267 1.054s1.264-1.159 2.686-2.636c1.423-1.475 3.003-3.214 3.003-3.214s1.58 1.002 3.163 1.843c1.582.843 3.373 1.634 3.373 1.634s.422-1.37.738-3.004c.316-1.635.474-3.533.474-3.533s-1.055-.421-1.687-.685c-.633-.264-1.265-.527-1.265-.527s1.16-1.108 2.214-2.319c1.055-1.21 2.213-2.683 2.213-2.683z" fill="#336791" />
      <circle cx="6.86" cy="15.542" r="1.3" fill="#1C3852" />
    `,
  },
  {
    id: "prisma-orm",
    name: "Prisma ORM",
    category: "Full-Stack & Data Architecture",
    tag: "schema & migrations",
    svgInner: `
      <path d="M12.5 2L3 18.5l7 3.5 11-14.5L12.5 2zm-1 4.5l5.5 4.5-8 10.5-2.5-1.2 5-13.8z" fill="#2D3748" />
      <path d="M6 17.5l5.5-11 5.5 4.5-11 6.5z" fill="#16A394" />
    `,
  },
  {
    id: "mongodb",
    name: "MongoDB",
    category: "Full-Stack & Data Architecture",
    tag: "document database",
    svgInner: `
      <path d="M12.012 0c-.394.026-.807.218-1.109.522C9.479 2.002 6.57 6.138 6.046 9.845c-.538 3.805.815 7.64 3.722 10.36 1.094 1.023 2.053 1.957 2.193 3.655.02.24.123.36.216.36.094 0 .197-.12.217-.36.14-1.698 1.1-2.632 2.193-3.655 2.907-2.72 4.26-6.555 3.722-10.36-.524-3.707-3.433-7.843-4.857-9.323-.302-.304-.715-.496-1.11-.522zm-.177 1.834c.046 0 .093.003.139.01.62.083 2.87 2.697 3.86 6.064.927 3.153.275 6.368-1.587 8.784-.73.948-1.523 1.767-2.148 2.66-.08.115-.176.242-.264.38V1.834zm-.518.064v17.845c-.092-.143-.19-.276-.273-.396-.625-.893-1.418-1.712-2.148-2.66-1.862-2.416-2.514-5.63-1.587-8.784.99-3.367 3.24-5.981 3.86-6.064a1.05 1.05 0 0 1 .148-.01z" fill="#47A248" />
    `,
  },
  {
    id: "redis",
    name: "Redis",
    category: "Full-Stack & Data Architecture",
    tag: "in-memory cache",
    svgInner: `
      <path d="M12 0L0 3.746l12 3.746 12-3.746z" fill="#DC382D" />
      <path d="M0 6.67v3.746l12 3.655 12-3.655V6.67L12 10.325zM0 12.314v3.746l12 3.655 12-3.655v-3.746l-12 3.655zm0 5.643v3.746l12 3.655 12-3.655v-3.746l-12 3.655z" fill="#A41E11" />
    `,
  },
  {
    id: "rabbitmq",
    name: "RabbitMQ",
    category: "Full-Stack & Data Architecture",
    tag: "message broker",
    svgInner: `
      <path d="M10.94 0a3.94 3.94 0 0 0-3.94 3.94c0 1.25.59 2.37 1.5 3.09a3.94 3.94 0 0 0-3.44 3.91v.06a3.94 3.94 0 0 0-2.88 3.8v.14A3.94 3.94 0 0 0 6.06 18.8h.06c.44 2.9 2.94 5.2 6.02 5.2h4.86a6.94 6.94 0 0 0 6.94-6.94v-3.12a6.94 6.94 0 0 0-6.94-6.94h-2.12A3.94 3.94 0 0 0 10.94 0zm0 1.5c1.35 0 2.44 1.09 2.44 2.44 0 .93-.52 1.74-1.28 2.16-.38.21-.66.58-.66 1.02v.88h-1V7.12c0-.44-.28-.81-.66-1.02a2.43 2.43 0 0 1-1.28-2.16c0-1.35 1.09-2.44 2.44-2.44z" fill="#FF6600" />
    `,
  },
];
