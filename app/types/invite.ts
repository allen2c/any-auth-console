// app/types/invite.ts
import { Page } from "./api";

export interface Invite {
  id: string;
  email: string;
  created_at: number;
  expires_at: number;
  invited_by: string;
  temporary_token: string;
  resource_id: string;
  metadata?: Record<string, unknown>;
}

export interface InviteCreate {
  email: string;
  role?: string;
}

export interface InvitesResponse extends Page<Invite> {}
