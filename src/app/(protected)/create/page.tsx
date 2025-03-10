"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Info } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import useRefetch from "@/hooks/use-refetch";

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const [creditsChecked, setCreditsChecked] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject = api.project.createProject.useMutation();
  const checkCredits = api.project.checkCredits.useMutation();
  const refetch = useRefetch();
  const router = useRouter();

  async function onSubmit(data: FormInput) {
    if (!creditsChecked) {
      checkCredits.mutate(
        {
          githubUrl: data.repoUrl,
          githubToken: data.githubToken,
        },
        {
          onSuccess: () => {
            setCreditsChecked(true);
          },
          onError: () => {
            toast.error("Failed to check credits");
          },
        },
      );
    } else {
      createProject.mutate(
        {
          name: data.projectName,
          githubUrl: data.repoUrl,
          githubToken: data.githubToken,
        },
        {
          onSuccess: () => {
            toast.success("Project created successfully");
            refetch();
            reset();
            setCreditsChecked(false);
            router.push("/dashboard");
          },
          onError: () => {
            toast.error("Failed to create project");
          },
        },
      );
    }
  }

  const hasEnoughCredits = checkCredits?.data?.userCredits
    ? checkCredits.data?.userCredits >= checkCredits.data.fileCount
    : true;

  return (
    <div className="flex h-full items-center justify-center gap-12">
      <img src="/github_person.svg" className="h-56 w-auto" />
      <div>
        <div>
          <h1 className="text-2xl font-semibold">
            Link Your GitHub Repository
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter URL of your repository to link it to GitSync
          </p>
        </div>
        <div className="h-4"></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              {...register("projectName", { required: true })}
              placeholder="Project Name"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("repoUrl", { required: true })}
              type="url"
              placeholder="GitHub Repository URL"
              required
            />
            <div className="h-2"></div>
            <Input
              {...register("githubToken")}
              placeholder="GitHub Token (Optional)"
            />
            {!!checkCredits.data && (
              <>
                <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-2 text-orange-700">
                  <div className="flex items-center">
                    <Info className="size-4" />
                    <p className="text-sm">
                      You will be charged{" "}
                      <strong>{checkCredits?.data?.fileCount}</strong> credits
                      for this repository.
                    </p>
                  </div>
                  <p className="ml-6 text-sm text-blue-600">
                    You have <strong>{checkCredits?.data?.userCredits}</strong>{" "}
                    remaining.
                  </p>
                </div>
              </>
            )}
            <div className="h-4"></div>
            <Button
              type="submit"
              disabled={
                createProject.isPending ||
                checkCredits.isPending ||
                (creditsChecked && !hasEnoughCredits)
              }
            >
              {creditsChecked ? "Create Project" : "Check Credits"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
