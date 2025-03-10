"use client";

import React from "react";
import { useProject } from "@/hooks/use-project";
import { ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import CommitLog from "./commit-log";
import AskQuestionCard from "./ask-question-card";
import ArchiveBtn from "./archive-btn";
import TeamMembers from "./team-members";
import dynamic from "next/dynamic";
const InviteBtn = dynamic(() => import("./invite-btn"), { ssr: false });

const Dashboard = () => {
  const { project } = useProject();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-y-4">
        {/*github link*/}
        <div className="w-fit rounded-md bg-primary px-4 py-3">
          <div className="flex items-center">
            <Github className="size-5 text-white" />
            <div className="ml-2">
              <p className="text-sm font-medium text-white">
                This Project is linked to{" "}
                <Link
                  target="_blank"
                  href={project?.githubURL ?? ""}
                  className="inline-flex items-center text-white/80 hover:underline"
                >
                  {project?.githubURL}
                  <ExternalLink className="ml-1 size-4" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="h-4"></div>
        <div className="flex items-center gap-4">
          <TeamMembers />
          <InviteBtn />
          <ArchiveBtn />
        </div>
      </div>
      <div className="mt-4">
        <div className="">
          <AskQuestionCard />
        </div>
      </div>
      <div className="mt-8"></div>
      <CommitLog />
    </div>
  );
};

export default Dashboard;
