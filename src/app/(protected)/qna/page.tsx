"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { useProject } from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "../dashboard/code-references";

const QnA = () => {
  const { projectId } = useProject();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId });

  const [quesIndex, setQuesIndex] = React.useState(0);
  const ques = questions?.[quesIndex];

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((ques, index) => {
          return (
            <React.Fragment key={ques.id}>
              <SheetTrigger onClick={() => setQuesIndex(index)}>
                <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                  <img
                    src={ques.user.imageUrl ?? ""}
                    height={30}
                    width={30}
                    alt=""
                    className="rounded-full"
                  />

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="text-gray line-clamp-1 text-lg font-medium">
                        {ques.question}
                      </p>
                      <span className="whitespace-nowrap text-xs text-gray-400">
                        {ques.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p />
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {ques.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </React.Fragment>
          );
        })}
      </div>
      {ques && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle>{ques.question}</SheetTitle>
            <MDEditor.Markdown
              source={ques.answer}
              className="!h-full max-h-[45vh] overflow-scroll"
            />
            <CodeReferences
              filesReferences={(ques.filesReferences ?? []) as any}
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QnA;
