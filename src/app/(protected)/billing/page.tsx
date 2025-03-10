"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    price: "$10",
    features: [
      "10 Projects",
      "Basic Git Integration",
      "Community Support",
      "Core Features",
    ],
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: "$29",
    features: [
      "Unlimited Projects",
      "Advanced Git Integration",
      "Priority Support",
      "All Features",
      "API Access",
      "Custom Integrations",
    ],
  },
];

export default function BillingPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(planId);
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">Choose Your Plan</h1>
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        {plans.map((plan) => (
          <Card key={plan.id} className="p-6">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold">{plan.name}</h2>
              <p className="mb-4 text-3xl font-bold text-primary">
                {plan.price}
                <span className="text-sm text-muted-foreground">/month</span>
              </p>
            </div>
            <div className="my-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="mr-2 h-5 w-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <Button
              className="mt-6 w-full"
              onClick={() => handleSubscribe(plan.id)}
              disabled={!!loading}
            >
              {loading === plan.id ? "Processing..." : "Subscribe"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
