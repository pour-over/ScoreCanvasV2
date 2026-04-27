/**
 * Share-by-URL helpers — anonymous read-only access to a saved project
 * via a short token. Backed by the `share_links` table + RLS.
 *
 * Flow:
 *   - Owner clicks Share → createShareLink(projectId) → returns token + URL
 *   - Anyone with the URL hits scorecanvas.io/?share={token}
 *   - App resolves the token → loads the linked project → renders read-only
 *
 * The token IS the credential. RLS lets anonymous users read share_links by
 * token, and projects via that share_link. Tokens are 10-char nanoid
 * (~57 bits of entropy — enough to make guessing impractical without going
 * full UUIDv4 ugly URLs).
 */

import { nanoid } from "nanoid";
import { supabase, isConfigured } from "./supabase";

export interface ShareLink {
  token: string;
  url: string;
  projectId: string;
}

export async function createShareLink(projectId: string): Promise<ShareLink> {
  if (!isConfigured) throw new Error("Sharing requires the backend to be configured.");
  const token = nanoid(10);
  const { error } = await supabase.from("share_links").insert({
    token,
    project_id: projectId,
    permission: "view",
  });
  if (error) throw new Error(error.message);
  return {
    token,
    projectId,
    url: `${window.location.origin}/?share=${token}`,
  };
}

/**
 * Look up which project a share token points to. Returns null on
 * unknown / expired tokens. RLS lets anonymous users perform this select
 * (the policy "anyone reads share_link by token" is the gate).
 */
export async function resolveShareToken(token: string): Promise<string | null> {
  if (!isConfigured) return null;
  const { data, error } = await supabase
    .from("share_links")
    .select("project_id, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) return null;
  if (data.expires_at && new Date(data.expires_at as string).getTime() < Date.now()) {
    return null;
  }
  return data.project_id as string;
}
