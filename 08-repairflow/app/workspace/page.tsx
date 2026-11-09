import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Interactive RepairFlow service operations workspace.",
};

export default async function WorkspacePage() {
  const cloudMode = isSupabaseConfigured();
  const currentUser = cloudMode ? await getCurrentUser() : null;

  if (cloudMode && !currentUser) {
    redirect("/sign-in?next=/workspace");
  }

  return (
    <WorkspaceShell
      cloudMode={cloudMode}
      accountName={currentUser?.profile.fullName ?? null}
    />
  );
}
