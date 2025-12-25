export const USER_ROLES = {
  SYSTEM_ADMIN: 'system_admin',
  CASE_MANAGER: 'case_manager',
  CONTENT_MANAGER: 'content_manager',
  PR_OFFICER: 'pr_officer',
};

// Updated to match backend constants
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  CASE_MANAGER: 'CASE_MANAGER',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  PR_OFFICER: 'PR_OFFICER'
};

export const ADMIN_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED'
};

export const REPORT_STATUS = {
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  INVESTIGATING: 'investigating',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

export const REPORT_CATEGORY = {
  CORRUPTION: 'corruption',
  MISCONDUCT: 'misconduct',
  ETHICS_VIOLATION: 'ethics_violation',
  OTHER: 'other',
};

export const REPORT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const NEWS_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

// Route permissions mapping
export const ROUTE_PERMISSIONS = {
  '/dashboard': [],
  '/news': ['manage_news', 'manage_content'],
  '/events': ['manage_events', 'manage_content'],
  '/reports': ['manage_reports', 'view_reports'],
  '/admin/users': ['manage_users'],
  '/admin/settings': ['manage_system'],
  '/admin/audit-logs': ['view_audit_logs']
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    VALIDATE: '/auth/validate'
  },
  ADMIN: {
    USERS: '/admin/users',
    DASHBOARD: '/admin/dashboard',
    REPORTS: '/admin/reports',
    NEWS: '/admin/news',
    EVENTS: '/admin/events'
  }
};
