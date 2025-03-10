import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";

const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_API_KEY_ID!,
	key_secret: process.env.RAZORPAY_API_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
	try {
		const { amount, credits } = await request.json();
		const authUser = await auth();

		if (!authUser.userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const order = await razorpay.orders.create({
			amount: amount * 100,
			currency: "INR",
			receipt: "gitSync_" + Math.random().toString(36).substring(7),
		});

		await db.razorpayTransaction.create({
			data: {
				userId: authUser.userId,
				credits,
			},
		});

		await db.user.update({
			where: {
				id: authUser.userId,
			},
			data: {
				credits: {
					increment: credits,
				},
			},
		});

		return NextResponse.json({ orderId: order.id }, { status: 200 });
	} catch (error) {
		console.error("Error creating order: ", error);
		return NextResponse.json({ error: "Error creating order" }, { status: 500 });
	}
}
