// app/types/api.ts

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
 * Project creation request interface
 */
export interface ProjectCreate {
  name: string;
  full_name?: string | null;
  metadata?: Record<string, unknown>;
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
  user_id: string;
  role_id: string;
  resource_id: string;
  assigned_at: number;
}

/**
 * Role assignment creation request interface
 */
export interface RoleAssignmentCreate {
  user_id: string;
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
