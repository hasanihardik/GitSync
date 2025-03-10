"use client";

import { Fragment, useState } from "react";
import MDEditor from "@uiw/react-md-editor";

import { api } from "@/trpc/react";
import useGetProjects from "@/hooks/use-get-projects";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import AskQuestionCard from "../dashboard/ask-question-card";
import CodeReferences from "../dashboard/code-references";

const QAPage = () => {
  const { projectId } = useGetProjects();
  const { data: questions } = api.project.getQuestions.useQuery({ projectId });

  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => {
          return (
            <Fragment key={question.id}>
              <SheetTrigger onClick={() => setQuestionIndex(index)}>
                <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                  <img
                    className="rounded-full"
                    height={30}
                    width={30}
                    src={question.user.imageUrl ?? ""}
                  />
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 text-lg font-medium text-gray-700">
                        {question.question}
                      </p>
                      <span className="whitespace-nowrap text-xs text-muted-foreground">
                        {question.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {question.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </Fragment>
          );
        })}
      </div>
      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>
          </SheetHeader>
          <MDEditor.Markdown
            source={question.answer}
            disableCopy={false}
            className="h-full max-h-[40vh] max-w-[70vw] overflow-scroll bg-transparent text-gray-800 dark:text-gray-100"
            style={{
                backgroundColor: "transparent",
                color: "inherit",
                maxWidth: "70vw",
                height: "100%",
                maxHeight: "40vh",
                overflowY: "auto",
                overflowX: "auto",
                wordBreak: "break-word",
              }}
          />
          <div className="h-2"></div>
          <CodeReferences
            fileReferences={(question.fileReferences || []) as any}
          />
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QAPage;
