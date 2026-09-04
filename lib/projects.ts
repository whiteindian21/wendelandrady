import { createClient } from "@/lib/supabase/server";
import { getActiveOrganization } from "@/lib/billing/context";
import type { Database } from "@/lib/database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export async function getProject(projectId: string): Promise<Project | null> {
  const ctx = await getActiveOrganization();
  if (!ctx) return null;

  const supabase = await createClient();
  
  // IDOR Protection: Query by BOTH project_id and organization_id
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("organization_id", ctx.organization.id) // Prevents cross-tenant access
    .maybeSingle();

  if (error) {
    console.error("[projects] Error fetching project:", error);
    return null;
  }

  return data;
}

export async function listProjects(): Promise<Project[]> {
  const ctx = await getActiveOrganization();
  if (!ctx) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("organization_id", ctx.organization.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}