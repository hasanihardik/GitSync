"use client";

import { toast } from "sonner";

import { api } from "@/trpc/react";
import useGetProjects from "@/hooks/use-get-projects";
import useRefetch from "@/hooks/use-refetch";
import { Button } from "@/components/ui/button";

const ArchiveButton = () => {
  const { projectId } = useGetProjects();
  const archive = api.project.archiveProject.useMutation();
  const refetch = useRefetch();

  return (
    <Button
      onClick={() => {
        const confirm = window.confirm(
          "Are you sure you want to delete this project?",
        );
        if (confirm)
          archive.mutate(
            { projectId },
            {
              onSuccess: () => {
                toast.success("Project archived successfully");
                refetch();
              },
              onError: () => {
                toast.error("Failed to archive project.");
              },
            },
          );
      }}
      disabled={archive.isPending}
      size={"sm"}
      variant={"destructive"}
    >
      Archive
    </Button>
  );
};

export default ArchiveButton;
