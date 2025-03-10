"use client";

import { useState } from "react";
import { FileIcon, IndianRupee, Info } from "lucide-react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

declare global {
  interface Window {
    Razorpay: any;
  }
}

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

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_API_KEY_ID!,
        amount: price * 100,
        currency: "INR",
        name: "HARSH JAIN",
        description: "You are paying for GitSync AI credits.",
        order_id: data.orderId,
        handler: function (response: any) {
          toast.success("Payment successful!");
          router.push("/dashboard");
          console.log(response);
        },
        prefill: {
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.emailAddress,
          contact: "",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Failed");
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
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
