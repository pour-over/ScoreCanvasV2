/**
 * Project persistence — CRUD wrappers around the Supabase `projects` table.
 *
 * The DB schema stores the entire project as a single JSONB blob so we can
 * evolve the in-memory shape without migrations. The shape here matches
 * `GameProject` from src/data/projects.ts exactly.
 */

import { supabase, isConfigured } from "./supabase";
import type { GameProject } from "../data/projects";

export interface ProjectSummary {
  id: string;
  name: string;
  subtitle: string | null;
  updated_at: string;
}

/** Strip server-managed fields off the shape the canvas hands us. */
type ProjectInput = Omit<GameProject, "id"> & { id?: string };

/**
 * Save a project. If `data.id` is a uuid, this updates that row; otherwise it
 * inserts a new row and the DB assigns a uuid. Either way, the saved
 * project's id is returned.
 */
export async function saveProject(data: ProjectInput): Promise<string> {
  if (!isConfigured) throw new Error("Persistence is not configured.");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required to save.");

  // The body we persist excludes the row's primary key (the row id) and
  // the synthetic frontend id, but keeps everything else needed to restore.
  const body = {
    name: data.name,
    subtitle: data.subtitle ?? null,
    levels: data.levels,
  };

  if (isUuid(data.id)) {
    const { error } = await supabase
      .from("projects")
      .update({
        name: data.name,
        subtitle: data.subtitle ?? null,
        data: body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return data.id!;
  }

  const { data: row, error } = await supabase
    .from("projects")
    .insert({
      owner_id: user.id,
      name: data.name,
      subtitle: data.subtitle ?? null,
      data: body,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return row.id as string;
}

/** Load a project by id. Returns null if not found / not accessible. */
export async function loadProject(id: string): Promise<GameProject | null> {
  if (!isConfigured) return null;
  const { data: row, error } = await supabase
    .from("projects")
    .select("id,name,subtitle,data")
    .eq("id", id)
    .maybeSingle();
  if (error || !row) return null;
  // Stitch the row back into the GameProject shape.
  const blob = (row.data as Record<string, unknown>) || {};
  return {
    id: row.id as string,
    name: (blob.name as string) ?? row.name,
    subtitle: (blob.subtitle as string) ?? row.subtitle ?? "",
    levels: ((blob.levels as GameProject["levels"]) ?? []),
  };
}

/** List the current user's saved projects. Empty array when not signed in. */
export async function listMyProjects(): Promise<ProjectSummary[]> {
  if (!isConfigured) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("projects")
    .select("id,name,subtitle,updated_at")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });
  if (error || !data) return [];
  return data as ProjectSummary[];
}

export async function deleteProject(id: string): Promise<void> {
  if (!isConfigured) throw new Error("Persistence is not configured.");
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

function isUuid(s: string | undefined): s is string {
  if (!s) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

/**
 * Make a deep clone of a demo project as a brand-new user-owned project.
 * Strips the demo's id (so insert assigns a new uuid) and prefixes the name
 * with "My Copy of …" so the user knows what they're looking at.
 */
export function forkProject(source: GameProject, namePrefix = "My Copy of "): ProjectInput {
  return {
    name: `${namePrefix}${source.name}`,
    subtitle: source.subtitle,
    levels: JSON.parse(JSON.stringify(source.levels)),
  };
}
