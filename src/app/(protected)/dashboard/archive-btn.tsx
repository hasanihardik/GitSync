"use client";

import { Button } from "@/components/ui/button";
import { useProject } from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "sonner";

const ArchiveBtn = () => {
  const archiveProject = api.project.archiveProject.useMutation();
  const { projectId } = useProject();
  const refetch = useRefetch();

  return (
    <Button
      disabled={archiveProject.isPending}
      className="size-sm"
      variant={"destructive"}
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to archive this project?",
        );
        if (confirm)
          archiveProject.mutateAsync(
            { projectId },
            {
              onSuccess: () => {
                toast.success("Project archived successfully");
                refetch();
              },
              onError: () => {
                toast.error("Failed to archive project");
              },
            },
          );
      }}
    >
      Archive
    </Button>
  );
};

export default ArchiveBtn;
