import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  .transform(str => str.toLowerCase().replace(/\s+/g, '-'));

// Authentication schemas
export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .transform(str => str.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const profileUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional()
});

// News schemas
export const newsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: slugSchema.optional(),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500, 'Excerpt must be less than 500 characters').optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'archived'], {
    required_error: 'Status is required'
  }),
  publishDate: z.string().optional(),
  featuredImage: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().max(60, 'Meta title must be less than 60 characters').optional(),
  metaDescription: z.string().max(160, 'Meta description must be less than 160 characters').optional()
});

// Events schemas
export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: slugSchema.optional(),
  description: z.string().min(1, 'Description is required'),
  eventType: z.enum(['workshop', 'seminar', 'conference', 'meeting', 'training', 'other'], {
    required_error: 'Event type is required'
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.string().min(1, 'Location is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1').optional(),
  status: z.enum(['draft', 'published', 'completed', 'cancelled'], {
    required_error: 'Status is required'
  }),
  featuredImage: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  registrationRequired: z.boolean().optional(),
  registrationDeadline: z.string().optional(),
  contactEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  contactPhone: z.string().optional()
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Report schemas
export const reportSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().optional(),
  dateOfIncident: z.string().optional(),
  personsInvolved: z.string().optional(),
  witnessInfo: z.string().optional(),
  additionalInfo: z.string().optional(),
  anonymous: z.boolean().optional(),
  reporterName: z.string().optional(),
  reporterEmail: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  reporterPhone: z.string().optional()
}).refine(data => {
  if (!data.anonymous) {
    return data.reporterName && data.reporterEmail;
  }
  return true;
}, {
  message: 'Reporter name and email are required for non-anonymous reports',
  path: ['reporterName']
});

export const reportUpdateSchema = z.object({
  status: z.enum(['submitted', 'under_review', 'investigating', 'resolved', 'closed'], {
    required_error: 'Status is required'
  }),
  assignedTo: z.string().optional(),
  internalNotes: z.string().optional(),
  publicResponse: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional()
});

// Report Category schemas
export const reportCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().min(0, 'Sort order must be 0 or greater').optional()
});

// User management schemas
export const userSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: emailSchema,
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'CASE_MANAGER', 'CONTENT_MANAGER', 'PR_OFFICER'], {
    required_error: 'Role is required'
  }),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional()
});

export const userUpdateSchema = userSchema.partial().extend({
  id: z.string().min(1, 'User ID is required')
});

// File upload schemas
export const fileUploadSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, 'At least one file is required'),
  maxSize: z.number().optional(),
  allowedTypes: z.array(z.string()).optional()
});

// Search and filter schemas
export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
});

// Utility functions for schema validation
export const validateSchema = (schema, data) => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, data: null, errors };
    }
    return { success: false, data: null, errors: { general: 'Validation failed' } };
  }
};

export const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};