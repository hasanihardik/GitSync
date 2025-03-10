import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

const plans = {
  basic: {
    price: "price_1R15CRP2KC9pMyNmDZ66UJ2H", // Monthly $10 plan
    name: "Basic Plan",
    description: "Basic access to GitSync features",
  },
  pro: {
    price: "price_1R15ClP2KC9pMyNmRSuntmL7", // Monthly $29 plan
    name: "Pro Plan",
    description: "Full access to all GitSync features",
  },
} as const;

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { planId } = await req.json();
    const plan = plans[planId as keyof typeof plans];

    if (!plan) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      // Email will be collected during checkout
      line_items: [
        {
          price: plan.price,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      metadata: {
        userId: userId,
        planId: planId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}
