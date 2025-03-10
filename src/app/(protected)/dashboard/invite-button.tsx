"use client";

import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import useGetProjects from "@/hooks/use-get-projects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const InviteButton = () => {
  const { projectId } = useGetProjects();
  const [open, setOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInviteLink(`${window.location.origin}/join/${projectId}`);
    }
  }, [projectId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    toast.info("Copied to clipboard");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Members</DialogTitle>
            <p>Ask them to copy and paste the below link.</p>
          </DialogHeader>
          <div className="relative mt-4">
            <Input
              readOnly
              value={inviteLink}
              onClick={handleCopy}
            />
            <Copy
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
              onClick={handleCopy}
            />
          </div>
        </DialogContent>
      </Dialog>
      <Button size={"sm"} onClick={() => setOpen(true)} variant={"outline"}>
        Invite
      </Button>
    </>
  );
};

export default InviteButton;
