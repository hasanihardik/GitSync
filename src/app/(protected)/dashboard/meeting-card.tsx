"use client";

import { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Presentation, Upload } from "lucide-react";
import { toast } from "sonner";

import useGetProjects from "@/hooks/use-get-projects";
import { api } from "@/trpc/react";
import { uploadFile } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const MeetingCard = () => {
  const router = useRouter();
  const { project } = useGetProjects();
  const processMeeting = useMutation({
    mutationFn: async (data: {
      meetingUrl: string;
      projectId: string;
      meetingId: string;
    }) => {
      const { meetingId, meetingUrl, projectId } = data;
      const response = await axios.post(`/api/process-meeting`, {
        meetingUrl,
        meetingId,
        projectId,
      });
      return response.data;
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const uploadMeeting = api.project.uploadMeeting.useMutation();
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".mp4"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (accepetedFiles) => {
      if (!project) return;
      setIsUploading(true);
      console.log(accepetedFiles);
      const file = accepetedFiles[0];
      if (!file) return;
      const downloadUrl = (await uploadFile(
        file as File,
        setProgress,
      )) as string;
      uploadMeeting.mutate(
        {
          projectId: project?.id,
          meetingUrl: downloadUrl,
          name: file?.name,
        },
        {
          onSuccess: ( meeting ) => {
            toast.success("Meeting uploaded successfully.");
            router.push(`/meetings`);
            processMeeting.mutateAsync({
              meetingUrl: downloadUrl,
              meetingId: meeting.id,
              projectId: project.id,
            });
          },
          onError: () => {
            toast.error("Failed to upload meeting.");
          },
        },
      );
      setIsUploading(false);
    },
  });

  return (
    <Card
      className="col-span-2 flex flex-col items-center justify-center p-10"
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            Upload a new meeting
          </h3>
          <p className="mt-1 text-center text-sm text-gray-500">
            Analyze your meeting with GitSync.
            <br />
            Powered with AI
          </p>
          <div className="mt-6">
            <Button disabled={isUploading}>
              <Upload className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Upload
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
      {isUploading && (
        <div className="flex">
          <div className="h-20 w-20">
            <CircularProgressbar
              value={progress}
              text={`${progress}%`}
              styles={buildStyles({
                pathColor: "#2563eb",
                textColor: "#2563eb",
                textSize: "16px",
                trailColor: "#d6d6d6",
              })}
            />
          </div>
          <p className="mt-2 text-center text-sm text-gray-500">
            Uploading your meeting...
          </p>
        </div>
      )}
    </Card>
  );
};

export default MeetingCard;
