import { env } from './env';

export type RoleSlug = 'test_subject' | 'junior_coordinator' | 'senior_coordinator' | 'director';

export interface Role {
  id: number;
  slug: RoleSlug;
  name: string;
  password: string;
}

export const ROLES: Record<RoleSlug, Role> = {
  test_subject: {
    id: 41,
    slug: 'test_subject',
    name: 'Test Subject',
    password: env.IRIS_SUBJECT_PASSWORD,
  },
  junior_coordinator: {
    id: 42,
    slug: 'junior_coordinator',
    name: 'Junior Coordinator',
    password: env.IRIS_JUNIOR_PASSWORD,
  },
  senior_coordinator: {
    id: 43,
    slug: 'senior_coordinator',
    name: 'Senior Coordinator',
    password: env.IRIS_SENIOR_PASSWORD,
  },
  director: {
    id: 44,
    slug: 'director',
    name: 'Director of Enrichment',
    password: env.IRIS_DIRECTOR_PASSWORD,
  },
};
