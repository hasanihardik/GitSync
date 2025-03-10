"use client";

import { api } from "@/trpc/react";
import useGetProjects from "@/hooks/use-get-projects";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const CommitLog = () => {
  const { projectId, project } = useGetProjects();
  const { data: commits } = api.project.getCommits.useQuery({ projectId });

  return (
    <ul className="space-y-4">
      {commits?.map((commit, commitIndex) => {
        return (
          <li key={commitIndex} className="relative flex gap-x-4">
            <div
              className={cn(
                commitIndex === commits.length - 1 ? "h-6" : "-bottom-6",
                "absolute left-0 top-0 flex w-6 justify-center",
              )}
            >
              <div className="w-px translate-x-1 bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <>
              <img
                src={commit.commitAuthorAvatar}
                alt={commit.commitAuthorName.charAt(0).toUpperCase()}
                className="bg-gray-60 relative mt-4 size-8 flex-none rounded-full dark:bg-gray-800"
              />
              <div className="flex-auto rounded-md bg-white p-3 ring-1 ring-inset ring-gray-200 dark:bg-gray-900 dark:ring-gray-700">
                <div className="flex justify-between gap-x-4">
                  <Link
                    target="_blank"
                    href={`${project?.githubUrl}/commit/${commit.commitHash}`}
                    className="py-0.5 text-xs font-medium leading-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 hover:dark:text-gray-200"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {commit.commitAuthorName}
                    </span>{" "}
                    <span className="inline-flex items-center">
                      committed
                      <ExternalLink className="ml-1 size-4" />
                    </span>
                  </Link>
                </div>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {commit.commitMessage}
                </span>
                <pre className="mt-2 whitespace-pre-wrap text-xs leading-6 text-gray-600 dark:text-gray-400">
                  {commit.summary}
                </pre>
              </div>
            </>
          </li>
        );
      })}
    </ul>
  );
};

export default CommitLog;
