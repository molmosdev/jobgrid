import { Company } from './company.interface';

export type UserCompany = Company & { role?: string };

export interface User {
  id: string;
  external_id: string;
  email: string;
  name: string;
  type: 'recruiter' | 'seeker';
  avatar_url?: string | null;
  company?: UserCompany | null;
}
