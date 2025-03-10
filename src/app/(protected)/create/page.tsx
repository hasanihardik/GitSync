"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useRefetch from "@/hooks/use-refetch";
import { api } from "@/trpc/react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormInputProps = {
  projectName: string;
  repoURL: string;
  githubToken?: string;
};

const CreateProject = () => {
  const { register, handleSubmit, reset } = useForm<FormInputProps>();
  const createProject = api.project.createProject.useMutation();
  const reftech = useRefetch();

  function onSubmit(data: FormInputProps) {
    createProject.mutate(
      {
        name: data.projectName,
        githubURL: data.repoURL,
        githubToken: data.githubToken,
      },
      {
        onSuccess: () => {
          toast.success("Project created successfully");
          reset();
          reftech();
        },
      },
    );
    return true;
  }

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="/createPage.svg" alt="Logo" className="h-56 w-auto" />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link your GitHub Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter the URL of your GitHub repository to get started.
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
            />
            <div className="h-2"></div>
            <Input
              {...register("repoURL", { required: true })}
              placeholder="GitHub URL"
            />
            <div className="h-2"></div>
            <Input
              {...register("githubToken")}
              placeholder="GitHub Token (Optional)"
            />
            <div className="h-4"></div>
            <Button disabled={createProject.isPending} type="submit">
              Check Credits
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
