"use client";

import { useState } from "react";
import { FileIcon, IndianRupee, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const BillingPage = () => {
  const { data: user } = api.project.getCredits.useQuery();
  const [isProcessing, setIsProcessing] = useState(false);
  const [creditsToBuy, setCreditsToBuy] = useState<number[]>([100]);
  const creditsToBuyAmount = creditsToBuy[0]!;
  const price = creditsToBuyAmount * 2;
  const router = useRouter();

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: price, credits: creditsToBuyAmount }),
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment Failed", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-semibold">Billing</h1>
      <div className="h-2"></div>
      <p className="text-sm text-gray-500">
        You currently have {user?.credits} credits left.
      </p>
      <div className="h-2"></div>
      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-2 text-blue-700">
        <div className="flex items-center gap-2">
          <Info className="size-4" />
          <p className="text-sm">Each credit allows you to index 1 file.</p>
        </div>
        <div className="flex items-center gap-2">
          <FileIcon className="size-3" />
          <p className="text-xs">
            <strong>E.g.</strong> if your project has 70 files you would need 70
            credits.
          </p>
        </div>
      </div>
      <div className="h-4"></div>
      <Slider
        defaultValue={[100]}
        max={1000}
        min={10}
        step={10}
        onValueChange={(value) => setCreditsToBuy(value)}
        className="cursor-pointer"
      />
      <div className="h-4"></div>
      <Button onClick={handlePayment} disabled={isProcessing}>
        {isProcessing ? "Processing..." : `Buy ${creditsToBuyAmount} credits for `}
        <span className="flex items-center">
          <IndianRupee size={16} className="mr-1" />
          {price.toFixed(2)}
        </span>
      </Button>
    </div>
  );
};

export default BillingPage;