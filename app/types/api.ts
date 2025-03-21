// app/types/api.ts

/**
 * Generic pagination type matching backend Page model
 */
export interface Page<T> {
  object: "list";
  data: T[];
  first_id: string | null;
  last_id: string | null;
  has_more: boolean;
}

/**
 * Project entity interface matching backend model
 */
export interface Project {
  id: string;
  organization_id: string | null;
  name: string;
  full_name: string | null;
  disabled: boolean;
  metadata: Record<string, unknown>;
  created_by: string;
  created_at: number;
  updated_at: number;
}

/**
 * Projects response format from the API
 */
export type ProjectsResponse = Page<Project>;

/**
 * Project creation request interface
 */
export interface ProjectCreate {
  name: string;
  full_name?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * API Key entity interface matching backend model
 */
export interface APIKey {
  id: string;
  resource_id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: number;
  expires_at: number | null;
}

/**
 * API Key creation request interface
 */
export interface APIKeyCreate {
  name?: string;
  description?: string;
  expires_at?: number | null;
}

/**
 * API Key update request interface
 */
export interface APIKeyUpdate {
  name?: string;
  description?: string;
  expires_at?: number | null;
}

/**
 * Project member entity interface matching backend model
 */
export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  joined_at: number;
  metadata: Record<string, unknown>;
}

/**
 * Project member creation request interface
 */
export interface ProjectMemberCreate {
  user_id: string;
  metadata?: Record<string, unknown>;
}

/**
 * Role entity interface matching backend model
 */
export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string | null;
  disabled: boolean;
  parent_id: string | null;
  created_at: number;
  updated_at: number;
}

/**
 * Role assignment entity interface matching backend model
 */
export interface RoleAssignment {
  id: string;
  target_id: string;
  role_id: string;
  resource_id: string;
  assigned_at: number;
}

/**
 * Role assignment creation request interface
 */
export interface RoleAssignmentCreate {
  target_id: string;
  role_id: string;
  resource_id: string;
}

/**
 * User entity interface matching backend model
 */
export interface User {
  id: string;
  username: string;
  full_name: string | null;
  email: string;
  email_verified: boolean;
  phone: string | null;
  phone_verified: boolean;
  disabled: boolean;
  picture: string | null;
  metadata: Record<string, unknown>;
  created_at: number;
  updated_at: number;
}
