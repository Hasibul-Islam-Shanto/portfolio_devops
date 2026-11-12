export interface CredentialItem {
  id: string;
  title: string;
  rank?: string | null;
  shortDescription: string;
  fullDescription?: string;
  year: string;
  issuer?: string;
  organization?: string;
  images?: string[];
  links?: Array<{ label: string; url: string }>;
}
