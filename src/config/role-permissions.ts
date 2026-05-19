import { RoleSlug } from './roles';

export type HttpMethod = 'GET' | 'POST';

export interface EndpointPermission {
  id: string;
  method: HttpMethod;
  path: string;
  allowedRoles: readonly RoleSlug[];
  description: string;
  body?: Record<string, unknown>;
  knownBug?: string;
}

export const PERMISSIONS: readonly EndpointPermission[] = [
  {
    id: 'health',
    method: 'GET',
    path: '/api/health',
    allowedRoles: ['test_subject', 'junior_coordinator', 'senior_coordinator', 'director'],
    description: 'Health check (public)',
  },
  {
    id: 'auth.me',
    method: 'GET',
    path: '/api/auth/me',
    allowedRoles: ['test_subject', 'junior_coordinator', 'senior_coordinator', 'director'],
    description: 'Get logged-in role (any authenticated)',
  },

  {
    id: 'subjects.list',
    method: 'GET',
    path: '/api/admin/subjects?q=s',
    allowedRoles: ['junior_coordinator', 'senior_coordinator', 'director'],
    description: 'List subjects (Junior+ per brief)',
  },
  {
    id: 'subjects.detail',
    method: 'GET',
    path: '/api/admin/subjects/S-0032',
    allowedRoles: ['junior_coordinator', 'senior_coordinator', 'director'],
    description: 'Subject detail (Junior+ per brief)',
  },

  {
    id: 'chambers.list',
    method: 'GET',
    path: '/api/admin/chambers',
    allowedRoles: ['junior_coordinator', 'senior_coordinator', 'director'],
    description: 'List chambers (Junior+ per brief)',
  },
  {
    id: 'chambers.detail',
    method: 'GET',
    path: '/api/admin/chambers/C-01',
    allowedRoles: ['junior_coordinator', 'senior_coordinator', 'director'],
    description: 'Chamber detail (Junior+ per brief)',
  },

  {
    id: 'sessions.list',
    method: 'GET',
    path: '/api/admin/sessions',
    allowedRoles: ['junior_coordinator', 'senior_coordinator', 'director'],
    description: 'List sessions (Junior+ per brief)',
  },
  {
    id: 'sessions.detail',
    method: 'GET',
    path: '/api/admin/sessions/SES-2007',
    allowedRoles: ['junior_coordinator', 'senior_coordinator', 'director'],
    description: 'Session detail (Junior+ per brief)',
  },

  {
    id: 'sessions.approve',
    method: 'POST',
    path: '/api/admin/sessions/SES-DOES-NOT-EXIST/approve',
    allowedRoles: ['senior_coordinator', 'director'],
    description: 'Approve session (Senior+ per brief)',
    body: {},
  },
  {
    id: 'sessions.reject',
    method: 'POST',
    path: '/api/admin/sessions/SES-DOES-NOT-EXIST/reject',
    allowedRoles: ['senior_coordinator', 'director'],
    description: 'Reject session (Senior+ per brief)',
    body: { reason: 'matrix test' },
  },
  {
    id: 'sessions.start',
    method: 'POST',
    path: '/api/admin/sessions/SES-DOES-NOT-EXIST/start',
    allowedRoles: ['senior_coordinator', 'director'],
    description: 'Start session (Senior+ per brief)',
    body: {},
  },
  {
    id: 'sessions.complete',
    method: 'POST',
    path: '/api/admin/sessions/SES-DOES-NOT-EXIST/complete',
    allowedRoles: ['senior_coordinator', 'director'],
    description: 'Complete session (Senior+ per brief)',
    body: {},
  },
  {
    id: 'sessions.cancel',
    method: 'POST',
    path: '/api/admin/sessions/SES-DOES-NOT-EXIST/cancel',
    allowedRoles: ['senior_coordinator', 'director'],
    description: 'Cancel session (Senior+ per brief)',
    body: { reason: 'matrix test' },
  },

  {
    id: 'methodology',
    method: 'GET',
    path: '/api/admin/methodology',
    allowedRoles: ['director'],
    description: 'Methodology (Director-only per brief)',
  },
  {
    id: 'reports.export',
    method: 'GET',
    path: '/api/admin/reports/export',
    allowedRoles: ['director'],
    description: 'Export reports (Director-only per brief)',
  },

  {
    id: 'dashboard',
    method: 'GET',
    path: '/api/admin/dashboard',
    allowedRoles: ['senior_coordinator', 'director'],
    description: 'Admin dashboard (Senior+ inferred)',
  },
  {
    id: 'apparatus',
    method: 'GET',
    path: '/api/admin/apparatus',
    allowedRoles: ['junior_coordinator', 'senior_coordinator', 'director'],
    description: 'Apparatus catalog (Junior+ inferred — needed for session draft)',
  },
  {
    id: 'audit',
    method: 'GET',
    path: '/api/admin/audit',
    allowedRoles: ['director'],
    description: 'Audit log (Director-only inferred)',
  },
  {
    id: 'roles',
    method: 'GET',
    path: '/api/admin/roles',
    allowedRoles: ['director'],
    description: 'Role catalog (Director-only inferred)',
  },
  {
    id: 'issue-token',
    method: 'POST',
    path: '/api/admin/issue-token',
    allowedRoles: ['director'],
    description: 'Issue case token (Director-only inferred — sensitive)',
    body: { candidate_name: 'matrix-test-probe' },
    knownBug: 'BUG-014',
  },

  {
    id: 'legacy.exclusions',
    method: 'GET',
    path: '/api/v1/legacy/exclusions',
    allowedRoles: ['director'],
    description: 'Legacy QE Index exclusions (Director-only inferred)',
    knownBug: 'BUG-013',
  },
  {
    id: 'legacy.console',
    method: 'POST',
    path: '/api/console',
    allowedRoles: ['director'],
    description: 'Legacy operator console (Director-only inferred)',
    body: { command: 'HELP' },
  },
];

export function expectationFor(role: RoleSlug, ep: EndpointPermission): 'allowed' | 'denied' {
  return ep.allowedRoles.includes(role) ? 'allowed' : 'denied';
}
