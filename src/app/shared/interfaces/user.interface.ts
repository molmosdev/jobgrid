export interface User {
  id: string;
  external_id: string;
  email: string;
  name: string;
  type: 'recruiter' | 'seeker';
  avatar_url?: string | null;
}
